import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, X } from "lucide-react";
import type { FiltersState } from "@/pages/browsePage";

export type SortValue = "relevance" | "price_asc" | "price_desc" | "rating_desc";

type FilterBarProps = {
  value: FiltersState;
  onChange: (next: FiltersState) => void;
  sortBy: SortValue;
  onSortChange: (next: SortValue) => void;
  resultsText?: string;
};

const inputCls =
  "h-10 rounded-full border-border bg-transparent text-sm focus-visible:ring-1 focus-visible:ring-foreground/20";
const pillCls =
  "h-9 rounded-full border-border bg-transparent text-sm";
// Hide the number input spinner arrows
const noSpinner =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

export default function FilterBar({
  value,
  onChange,
  sortBy,
  onSortChange,
  resultsText,
}: FilterBarProps) {
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
    (value.nameQuery ?? "").trim() !== "" ||
    (value.locationQuery ?? "").trim() !== "";

  // Each control is defined once and placed into two different layout
  // wrappers below (a stacked grid on mobile, the original inline row on
  // sm+). They're controlled components, so rendering both is safe — only
  // one wrapper is visible at a time via CSS.
  const petTypeSelect = (
    <Select value={value.petType} onValueChange={(v) => setField("petType", v as FiltersState["petType"])}>
      <SelectTrigger className={`${pillCls} w-full sm:w-[120px]`}>
        <SelectValue placeholder="Pet type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="any">Any pet</SelectItem>
        <SelectItem value="cat">Cats</SelectItem>
        <SelectItem value="dog">Dogs</SelectItem>
        <SelectItem value="both">Cats & dogs</SelectItem>
      </SelectContent>
    </Select>
  );

  const ratingSelect = (
    <Select
      value={value.ratingMin === undefined ? "any" : String(value.ratingMin)}
      onValueChange={(v) => setField("ratingMin", v === "any" ? undefined : Number(v))}
    >
      <SelectTrigger className={`${pillCls} w-full sm:w-[130px]`}>
        <SelectValue placeholder="Any rating" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="any">Any rating</SelectItem>
        <SelectItem value="3">3.0+ stars</SelectItem>
        <SelectItem value="4">4.0+ stars</SelectItem>
        <SelectItem value="4.5">4.5+ stars</SelectItem>
      </SelectContent>
    </Select>
  );

  const priceRange = (
    <div className="flex items-center gap-1.5">
      <div className="relative min-w-0 flex-1 sm:flex-none">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          ₹
        </span>
        <Input
          type="number"
          min={0}
          placeholder="Min"
          inputMode="numeric"
          value={value.minPricePerHour ?? ""}
          onChange={(e) => {
            const raw = e.target.value;
            const num = raw === "" ? undefined : Number(raw);
            setField("minPricePerHour", Number.isFinite(num) ? num : undefined);
          }}
          className={`${pillCls} ${noSpinner} w-full pl-6 sm:w-24`}
        />
      </div>
      <span className="shrink-0 text-muted-foreground">–</span>
      <div className="relative min-w-0 flex-1 sm:flex-none">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          ₹
        </span>
        <Input
          inputMode="numeric"
          type="number"
          min={0}
          placeholder="Max"
          value={value.maxPricePerHour ?? ""}
          onChange={(e) => {
            const raw = e.target.value;
            const num = raw === "" ? undefined : Number(raw);
            setField("maxPricePerHour", Number.isFinite(num) ? num : undefined);
          }}
          className={`${pillCls} ${noSpinner} w-full pl-6 sm:w-24`}
        />
      </div>
    </div>
  );

  const clearButton = hasActiveFilters ? (
    <Button
      variant="ghost"
      size="sm"
      onClick={clearFilters}
      className="h-9 shrink-0 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground"
    >
      <X className="mr-1 h-3.5 w-3.5" />
      Clear filters
    </Button>
  ) : null;

  const resultsBadge = resultsText ? (
    <span className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.15em] text-primary">
      {resultsText}
    </span>
  ) : null;

  return (
    <div>
      {/* Primary row */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search sitters by name, bio, or skills…"
            value={value.nameQuery ?? ""}
            onChange={(e) => setField("nameQuery", e.target.value)}
            className={`${inputCls} pl-10`}
          />
        </div>

        <div className="relative sm:w-56">
          <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Location"
            value={value.locationQuery ?? ""}
            onChange={(e) => setField("locationQuery", e.target.value)}
            className={`${inputCls} pl-10`}
          />
        </div>

        <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortValue)}>
          <SelectTrigger className={`${inputCls} sm:w-44`}>
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

      {/* Secondary row — mobile: stacked, evenly-aligned rows.
          sm+: original single inline row. */}
      <div className="mt-3 flex flex-col gap-2 sm:hidden">
        <div className="grid grid-cols-2 gap-2">
          {petTypeSelect}
          {ratingSelect}
        </div>
        {priceRange}
        {(clearButton || resultsBadge) && (
          <div className="flex items-center justify-between gap-2">
            {clearButton}
            {resultsBadge}
          </div>
        )}
      </div>

      <div className="mt-3 hidden flex-wrap items-center gap-2 sm:flex">
        {petTypeSelect}
        {priceRange}
        {ratingSelect}
        {clearButton}
        {resultsBadge && <div className="ml-auto">{resultsBadge}</div>}
      </div>
    </div>
  );
}
