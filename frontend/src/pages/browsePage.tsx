// In BrowsePage.tsx
import { useState, useMemo } from "react";
import Filters from "@/components/Filters";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PetsitterList from "@/components/PetsitterList";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"; // NEW IMPORT
import { Button } from "@/components/ui/button"; // NEW IMPORT
import { Filter } from "lucide-react"; // NEW IMPORT

// Assuming FiltersState is defined and available here
// type FiltersState = {...}; 
export type FiltersState = {
  petType: "any" | "dog" | "cat" | "both"
  minPricePerHour?: number
  maxPricePerHour?: number
  ratingMin?: number
  nameQuery: string
  locationQuery: string
}
type FiltersProps = {
  value: FiltersState
  onChange: React.Dispatch<React.SetStateAction<FiltersState>>
  isMobileSheet?: boolean
  onApply?: () => void
}

export default function BrowsePage() {
  const [filters, setFilters] = useState<FiltersState>({
    petType: "any",
    maxPricePerHour: undefined,
    minPricePerHour: undefined,
    ratingMin: undefined,
    nameQuery: "",
    locationQuery: "",
  });

  const [sortBy, setSortBy] = useState<"relevance" | "price_asc" | "price_desc" | "rating_desc">("relevance");
  const [isSheetOpen, setIsSheetOpen] = useState(false); // NEW STATE for mobile filter

  // Check if filters are active (used for the mobile button badge)
  const hasActiveFilters = useMemo(() =>
    filters.petType !== "any" ||
    filters.minPricePerHour !== undefined ||
    filters.maxPricePerHour !== undefined ||
    filters.ratingMin !== undefined ||
    (filters.nameQuery ?? "").trim() !== "" ||
    filters.locationQuery !== ""
    , [filters]);


  return (
    <div className="flex flex-col md:flex-row md:items-start gap-6 w-full md:h-[calc(100vh-8rem)]">

      {/* --- 1. Desktop Filters Sidebar (Visible md and up) --- */}
      <div className="hidden md:block md:h-full">
        <Filters value={filters} onChange={setFilters} />
      </div>

      <Separator orientation="vertical" className="hidden md:block" />
      <Separator orientation="horizontal" className="md:hidden" />

      {/* --- 2. Mobile Filter Floating Button (Visible below md) --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          {/* Fixed button for mobile that triggers the sheet */}
          <Button
            className="fixed bottom-6 right-6 md:hidden z-50 shadow-lg h-12 w-12 rounded-full"
            variant="default"
            size="icon"
          >
            <Filter className="w-5 h-5" />
            {/* Active filter badge */}
            {hasActiveFilters && (
              <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 border border-background"></span>
            )}
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-full sm:max-w-xs overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" /> Filter Sitters
            </SheetTitle>
          </SheetHeader>
          {/* IMPORTANT: Pass a custom class to the Filters component to disable its internal margin/padding */}
          <Filters
            value={filters}
            onChange={setFilters}
            isMobileSheet={true} // New prop for conditional rendering inside Filters
            onApply={() => setIsSheetOpen(false)} // New callback to close sheet on apply
          />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 h-full flex flex-col">
        {/* Header with sorting */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 p-1 bg-background">
          {/* ... (Your existing Header content remains) ... */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">Pet Sitters</h2>
            <div className="text-sm text-muted-foreground">
              {/* Note: You might want to update the result count here eventually */}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm font-medium hidden sm:block">Sort by</div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="rating_desc">Highest Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* End of Header */}
        </div>

        {/* Scrollable list area - PetsitterList handles everything internally */}
        <div className="relative flex-1 min-h-0 md:overflow-y-auto fade-scroll">
          {/* NOTE: You need to pass sortBy to PetsitterList which you forgot in the provided code */}
          <PetsitterList filters={filters} sortBy={sortBy} />
        </div>
      </div>
    </div>
  );
}

// NOTE: You must update the PetsitterList component definition to accept `sortBy` prop:
// const PetsitterList: React.FC<ListProps> = ({ filters, sortBy }) => { ... }