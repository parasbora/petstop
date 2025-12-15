import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  DollarSign,
  Star,
  PawPrint,

  X,

  ListFilterIcon
} from "lucide-react";

// Assuming this type definition is correct for the application
type FiltersState = {
  petType: "cat" | "dog" | "both" | "any";
  maxPricePerHour?: number;
  minPricePerHour?: number;
  ratingMin?: number;
  nameQuery?: string;
  locationQuery: string;
};

type FiltersProps = {
  value: FiltersState;
  onChange: (next: FiltersState) => void;
  className?: string;
  isMobileSheet?: boolean; // True when rendered inside the mobile Sheet/Drawer
  onApply?: () => void; // Function to close the sheet on mobile
};

export default function Filters({ value, onChange, className, isMobileSheet, onApply }: FiltersProps) {
  // FIX: Added a defensive check to prevent crashing if the 'value' prop is undefined 
  // during initial render by the parent component.
  if (!value) {
    return null;
  }

  const setField = <K extends keyof FiltersState>(key: K, v: FiltersState[K]) => {
    onChange({ ...value, [key]: v });
  };

  const clearFilters = () => {
    onChange({
      petType: "any",
      locationQuery: "",
      nameQuery: "",
      maxPricePerHour: undefined,
      minPricePerHour: undefined,
      ratingMin: undefined,
    });
    // If running in a mobile sheet, clear should probably not close the sheet, 
    // but the user can then hit "Show Results" if they wish.
  };

  const hasActiveFilters =
    value.petType !== "any" ||
    value.minPricePerHour !== undefined ||
    value.maxPricePerHour !== undefined ||
    value.ratingMin !== undefined ||
    (value.nameQuery ?? "").trim() !== "" ||
    value.locationQuery !== "";

  // This is still used to display the price range summary in the label and the badge
  const priceRange = [value.minPricePerHour || 0, value.maxPricePerHour || 100];

  // The handlePriceRangeChange function is now removed as the Slider is gone.

  return (
    // Conditional width: full width on mobile/sheet, fixed width on desktop
    <div className={`w-full ${isMobileSheet ? "" : "md:w-80"} ${className || ""}`}>

      {/* --- Desktop Header (Hidden on Mobile Sheet) --- */}
      <div className={`flex items-center justify-between mb-6 pb-4 ${isMobileSheet ? "" : "border-b"}`}>

        {/* Title and Icon (only visible on desktop sidebar) */}
        {!isMobileSheet && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ListFilterIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">filters</h3>
              <p className="text-sm text-muted-foreground">Refine your search</p>
            </div>
          </div>
        )}

        {/* Clear All Button (always visible if filters are active) */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-3 text-xs text-muted-foreground hover:text-red-600 hover:bg-red-50"
          >
            <X className="w-3 h-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* --- Active Filters (Badges) --- */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-8 border-b pb-4">
          {value.petType !== "any" && (
            <Badge variant="secondary" className="text-xs px-3 py-1 font-medium bg-indigo-100 text-indigo-700">
              <PawPrint className="w-3 h-3 mr-1" />
              {value.petType.charAt(0).toUpperCase() + value.petType.slice(1)}
              <button
                onClick={() => setField("petType", "any")}
                className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {(value.minPricePerHour !== undefined || value.maxPricePerHour !== undefined) && (
            <Badge variant="secondary" className="text-xs px-3 py-1 font-medium bg-green-100 text-green-700">
              <DollarSign className="w-3 h-3 mr-1" />
              {value.minPricePerHour || 0}-{value.maxPricePerHour || "Any"} / hr
              <button
                onClick={() => {
                  setField("minPricePerHour", undefined);
                  setField("maxPricePerHour", undefined);
                }}
                className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {value.ratingMin !== undefined && (
            <Badge variant="secondary" className="text-xs px-3 py-1 font-medium bg-yellow-100 text-yellow-700">
              <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
              {value.ratingMin}+ Rating
              <button
                onClick={() => setField("ratingMin", undefined)}
                className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* --- Filter Sections --- */}
      <div className="space-y-8">

        {/* Pet Type */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <PawPrint className="w-4 h-4 text-primary" />
            Pet Type
          </Label>
          <Select
            value={value.petType}
            onValueChange={(v) => setField("petType", v as FiltersState["petType"])}
          >
            <SelectTrigger className="w-full h-10 bg-background border-border hover:bg-accent transition-colors">
              <SelectValue placeholder="Select pet type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any pet (All Sitters)</SelectItem>
              <SelectItem value="cat">Cats only</SelectItem>
              <SelectItem value="dog">Dogs only</SelectItem>
              <SelectItem value="both">Both cats & dogs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range - Now using only Min/Max inputs */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <DollarSign className="w-4 h-4 text-primary" />
            Price Range (per hour)
            <span className="text-sm text-muted-foreground font-normal ml-auto">
              ${priceRange[0]} - ${priceRange[1] === 100 ? "100+" : priceRange[1]}
            </span>
          </Label>

          {/* Removed Slider and relied on the existing Input fields below */}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Min price</Label>
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="0"
                value={value.minPricePerHour ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  const num = raw === "" ? undefined : Math.min(100, Number(raw));
                  setField("minPricePerHour", Number.isFinite(num) ? num : undefined);
                }}
                className="h-10 text-sm bg-background border-border focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Max price</Label>
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="100+"
                value={value.maxPricePerHour ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  const num = raw === "" ? undefined : Number(raw);
                  setField("maxPricePerHour", Number.isFinite(num) ? num : undefined);
                }}
                className="h-10 text-sm bg-background border-border focus-visible:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Rating - Emojis removed, clean icons used */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <Star className="w-4 h-4 text-primary" />
            Minimum Rating
          </Label>
          <Select
            value={String(value.ratingMin ?? "0")}
            onValueChange={(v) => setField("ratingMin", Number(v))}
          >
            <SelectTrigger className="w-full h-10 bg-background border-border hover:bg-accent transition-colors">
              <SelectValue placeholder="Any rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any rating</SelectItem>
              {/* Using descriptive text instead of emojis */}
              <SelectItem value="3">3.0+ stars</SelectItem>
              <SelectItem value="4">4.0+ stars</SelectItem>
              <SelectItem value="4.5">4.5+ stars</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search by Name/Bio */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <Search className="w-4 h-4 text-primary" />
            Sitter Search
          </Label>
          <Input
            type="text"
            placeholder="Search by name, bio, or skills..."
            value={value.nameQuery ?? ""}
            onChange={(e) => setField("nameQuery", e.target.value)}
            className="h-10 bg-background border-border focus-visible:ring-primary"
          />
        </div>

        {/* Location */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            Location
          </Label>
          <Input
            type="text"
            placeholder="City, ZIP code, or area"
            value={value.locationQuery}
            onChange={(e) => setField("locationQuery", e.target.value)}
            className="h-10 bg-background border-border focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* --- Apply Button (Sticky on Mobile Sheet) */}
      {isMobileSheet && onApply && (
        <div className="mt-8 pt-4 border-t sticky bottom-0 bg-background z-10 -mx-6 px-6 shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
          <Button
            className="w-full h-10 text-base"
            onClick={onApply}
          >
            Show Results
          </Button>
        </div>
      )}

    </div>
  );
}