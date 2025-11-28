import Filters from "@/components/Filters";
import PetsitterList from "@/components/PetsitterList";
import { useState } from "react";
export default function BrowsePage() {
  const [filters, setFilters] = useState<FiltersState>({
    petType: "any",
    maxPricePerHour: undefined,
    minPricePerHour: undefined,
    ratingMin: undefined,
    nameQuery: "",
    locationQuery: "",
  });

  return (
    <div className="mt-24 container">
      <div className="flex flex-col md:flex-row md:items-start gap-6 w-full h-[calc(100vh-8rem)]"> {/* Use height instead of min-height */}
        
        {/* Filters Sidebar */}
        <div className="md:h-full"> {/* Optional: make filters full height too */}
          <Filters value={filters} onChange={setFilters} />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 min-h-0 h-full"> {/* Explicit height */}
          <PetsitterList filters={filters} />
        </div>
        
      </div>
    </div>
  );
}