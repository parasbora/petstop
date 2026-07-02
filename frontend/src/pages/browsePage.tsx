// Browse page: top filter bar + responsive card grid
import { useState } from "react";
import PetsitterList from "@/components/PetsitterList";
import FilterBar, { type SortValue } from "@/components/FilterBar";

export type FiltersState = {
  petType: "any" | "dog" | "cat" | "both";
  minPricePerHour?: number;
  maxPricePerHour?: number;
  ratingMin?: number;
  nameQuery: string;
  locationQuery: string;
};

export default function BrowsePage() {
  const [filters, setFilters] = useState<FiltersState>({
    petType: "any",
    maxPricePerHour: undefined,
    minPricePerHour: undefined,
    ratingMin: undefined,
    nameQuery: "",
    locationQuery: "",
  });

  const [sortBy, setSortBy] = useState<SortValue>("relevance");
  const [resultsText, setResultsText] = useState<string>("");

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="mx-auto mb-6 w-full max-w-6xl space-y-2 px-4  md:px-10">
        <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          Find a pet sitter
        </h1>
        <p className="text-[15px] text-muted-foreground">
          Browse trusted sitters near you and book with confidence.
        </p>
      </div>

      {/* Sticky filter bar — full-bleed glass strip attached under the navbar.
          -mx-4/-mx-10 cancels LayoutWrapper's px padding exactly (no vw math,
          which overflows on Windows because vw includes the scrollbar). */}
      <div className="sticky top-16 z-30 -mx-4  bg-background/85 backdrop-blur-xl md:-mx-10">
        <div className="mx-auto max-w-6xl px-4 py-3 md:px-10">
          <FilterBar
            value={filters}
            onChange={setFilters}
            sortBy={sortBy}
            onSortChange={setSortBy}
            resultsText={resultsText}
          />
        </div>
      </div>

      {/* Results grid */}
      <div className="mx-auto mt-8 w-full max-w-6xl">
        <PetsitterList
          filters={filters}
          sortBy={sortBy}
          onResultsTextChange={setResultsText}
        />
      </div>
    </div>
  );
}
