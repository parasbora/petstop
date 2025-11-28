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
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Star, 
  PawPrint, 
  Filter,
  X 
} from "lucide-react";

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
};

export default function Filters({ value, onChange, className }: FiltersProps) {
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
  };

  const hasActiveFilters = 
    value.petType !== "any" ||
    value.minPricePerHour !== undefined ||
    value.maxPricePerHour !== undefined ||
    value.ratingMin !== undefined ||
    value.nameQuery !== "" ||
    value.locationQuery !== "";

  const priceRange = [value.minPricePerHour || 0, value.maxPricePerHour || 100];
  const handlePriceRangeChange = (values: number[]) => {
    setField("minPricePerHour", values[0] === 0 ? undefined : values[0]);
    setField("maxPricePerHour", values[1] === 100 ? undefined : values[1]);
  };

  return (
    <div className={`w-full md:w-80 ${className || ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Filter className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">Filters</h3>
            <p className="text-sm text-muted-foreground">Refine your search</p>
          </div>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <X className="w-3 h-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {value.petType !== "any" && (
            <Badge variant="secondary" className="text-xs px-3 py-1">
              <PawPrint className="w-3 h-3 mr-1" />
              {value.petType}
              <button 
                onClick={() => setField("petType", "any")}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {(value.minPricePerHour !== undefined || value.maxPricePerHour !== undefined) && (
            <Badge variant="secondary" className="text-xs px-3 py-1">
              <DollarSign className="w-3 h-3 mr-1" />
              {value.minPricePerHour || 0}-{value.maxPricePerHour || "Any"}
              <button 
                onClick={() => {
                  setField("minPricePerHour", undefined);
                  setField("maxPricePerHour", undefined);
                }}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {value.ratingMin !== undefined && (
            <Badge variant="secondary" className="text-xs px-3 py-1">
              <Star className="w-3 h-3 mr-1" />
              {value.ratingMin}+
              <button 
                onClick={() => setField("ratingMin", undefined)}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Filter Sections */}
      <div className="space-y-8">
        {/* Pet Type */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
            <PawPrint className="w-4 h-4" />
            Pet Type
          </Label>
          <Select
            value={value.petType}
            onValueChange={(v) => setField("petType", v as FiltersState["petType"])}
          >
            <SelectTrigger className="w-full bg-background border-border hover:bg-accent/50 transition-colors">
              <SelectValue placeholder="Select pet type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any pet</SelectItem>
              <SelectItem value="cat">🐱 Cats only</SelectItem>
              <SelectItem value="dog">🐶 Dogs only</SelectItem>
              <SelectItem value="both">🐱🐶 Both cats & dogs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
            <DollarSign className="w-4 h-4" />
            Price Range
            <span className="text-xs text-muted-foreground font-normal ml-auto">
              ${priceRange[0]} - ${priceRange[1] === 100 ? "100+" : priceRange[1]}
            </span>
          </Label>
          
          <Slider
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            max={100}
            step={5}
            className="my-6"
          />
          
          <div className="grid grid-cols-2 gap-3">
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
                className="h-9 text-sm bg-background border-border"
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
                className="h-9 text-sm bg-background border-border"
              />
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
            <Star className="w-4 h-4" />
            Minimum Rating
          </Label>
          <Select
            value={String(value.ratingMin ?? "0")}
            onValueChange={(v) => setField("ratingMin", Number(v))}
          >
            <SelectTrigger className="w-full bg-background border-border hover:bg-accent/50 transition-colors">
              <SelectValue placeholder="Any rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">⭐ Any rating</SelectItem>
              <SelectItem value="3">⭐⭐⭐ 3.0+ stars</SelectItem>
              <SelectItem value="4">⭐⭐⭐⭐ 4.0+ stars</SelectItem>
              <SelectItem value="4.5">⭐⭐⭐⭐⭐ 4.5+ stars</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
            <Search className="w-4 h-4" />
            Search
          </Label>
          <Input
            type="text"
            placeholder="Search by name, bio, or skills..."
            value={value.nameQuery ?? ""}
            onChange={(e) => setField("nameQuery", e.target.value)}
            className="h-9 bg-background border-border"
          />
        </div>

        {/* Location */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
            <MapPin className="w-4 h-4" />
            Location
          </Label>
          <Input
            type="text"
            placeholder="City, ZIP code, or area"
            value={value.locationQuery}
            onChange={(e) => setField("locationQuery", e.target.value)}
            className="h-9 bg-background border-border"
          />
        </div>
      </div>
    </div>
  );
}