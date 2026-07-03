import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Calendar, ArrowDown } from "lucide-react";
import { apiBase } from "@/lib/auth";
import { Link } from "react-router-dom";

// --- Types ---

type QueryValue = string | number | boolean | undefined | null;
type PetSitterApiResponse = {
  id: number;
  name?: string;
  avatarUrl?: string;
  user?: { avatarUrl?: string };
  dogSitting?: boolean;
  catSitting?: boolean;
  petTypes?: Array<"dog" | "cat">;
  hourlyRate?: number;
  rating?: number;
  reviews?: number;
  reviewCount?: number;
  location?: string;
  city?: string;
  bio?: string;
  description?: string;
  serviceTypes?: string[];
};
type QueryParams = Record<string, QueryValue>;

type FiltersState = {
  petType: "cat" | "dog" | "both" | "any";
  maxPricePerHour?: number;
  minPricePerHour?: number;
  ratingMin?: number;
  nameQuery?: string;
  locationQuery?: string;
};

type PetSitter = {
  id: number;
  name: string;
  avatarUrl?: string;
  petTypes: Array<"cat" | "dog">;
  pricePerHour: number;
  rating: number;
  reviews: number;
  location: string;
  bio: string;
  serviceType: string[];
};

const API_BASE = apiBase();

type ListProps = {
  filters: FiltersState;
  sortBy: "relevance" | "price_asc" | "price_desc" | "rating_desc";
  onResultsTextChange?: (text: string) => void;
};

// --- Helpers ---
const buildQuery = (params: QueryParams) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    q.append(k, String(v));
  });
  return q.toString();
};

// Debounce a value so rapid changes (e.g. typing in the search box) don't
// trigger a request on every keystroke.
function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const PetsitterList: React.FC<ListProps> = ({ filters, sortBy, onResultsTextChange }) => {
  // Debounced filters drive the actual fetch; selects change infrequently so
  // the small delay is unnoticeable, while typing no longer spams requests.
  const debouncedFilters = useDebouncedValue(filters, 350);
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<PetSitter[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  // Reset to page 1 whenever filters or sort change
  useEffect(() => {
    setPage(1);
  }, [JSON.stringify(debouncedFilters), sortBy]);

  // Fetch logic
  useEffect(() => {
    const controller = new AbortController();

    const fetchSitters = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: QueryParams = {
          page,
          limit: pageSize,
        };

        if (sortBy && sortBy !== "relevance") params.sort = sortBy;
        if (debouncedFilters.petType && debouncedFilters.petType !== "any") params.petType = debouncedFilters.petType;
        if (typeof debouncedFilters.maxPricePerHour === "number") params.maxPricePerHour = debouncedFilters.maxPricePerHour;
        if (typeof debouncedFilters.minPricePerHour === "number") params.minPricePerHour = debouncedFilters.minPricePerHour;
        if (typeof debouncedFilters.ratingMin === "number") params.ratingMin = debouncedFilters.ratingMin;
        if ((debouncedFilters.nameQuery ?? "").trim()) params.name = (debouncedFilters.nameQuery ?? "").trim();
        if ((debouncedFilters.locationQuery ?? "").trim()) params.location = (debouncedFilters.locationQuery ?? "").trim();

        const query = buildQuery(params);
        const url = `${API_BASE}/petsitters${query ? `?${query}` : ""}`;

        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          signal: controller.signal,
        });

        if (!res.ok) {
          if (res.status === 401) throw new Error("Please sign in to view pet sitters.");
          throw new Error(`Failed to load sitters (${res.status})`);
        }

        const body = await res.json();
        const serverItems: PetSitterApiResponse[] = Array.isArray(body?.data)
          ? body.data
          : (body?.data?.items ?? []);

        const mapped: PetSitter[] = serverItems.map((s) => ({
          id: s.id,
          name: s.name || "Unknown",
          avatarUrl: s.avatarUrl || s.user?.avatarUrl,
          petTypes: (["dog", "cat"] as const).filter(
            (t) => s.petTypes?.includes(t) || s[`${t}Sitting` as keyof PetSitterApiResponse]
          ),
          pricePerHour: Number(s.hourlyRate ?? 0),
          rating: Number(s.rating ?? 0),
          reviews: Number(s.reviewCount ?? s.reviews ?? 0),
          location: s.location || s.city || "",
          bio: s.bio || s.description || "",
          serviceType: s.serviceTypes || [],
        }));

        setItems(prev => page === 1 ? mapped : [...prev, ...mapped]);

        const total = typeof body?.data?.total === "number"
          ? Number(body.data.total)
          : (typeof body?.total === "number" ? Number(body.total) : null);
        setTotalCount(total);

        if (total !== null) {
          const lastPage = Math.ceil(total / pageSize);
          setHasMore(page < lastPage);
        } else {
          setHasMore(mapped.length === pageSize);
        }
      } catch (e: unknown) {
        if (e instanceof Error && e.name !== "AbortError") {
          setError(e.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSitters();
    return () => controller.abort();
  }, [page, sortBy, JSON.stringify(debouncedFilters)]);

  const resultsText = useMemo(() => {
    if (loading && page === 1) return "Searching…";
    if (totalCount === 0) return "No sitters found";
    if (totalCount !== null) return `${totalCount} sitter${totalCount !== 1 ? 's' : ''} found`;
    return `${items.length} sitter${items.length !== 1 ? 's' : ''}`;
  }, [items.length, totalCount, loading, page]);

  useEffect(() => {
    onResultsTextChange?.(resultsText);
  }, [resultsText, onResultsTextChange]);

  // --- Components ---

  const LoadingSkeletons = () => (
    <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex gap-4 sm:block">
          <Skeleton className="aspect-square w-24 shrink-0 rounded-xl sm:aspect-[4/3] sm:w-full" />
          <div className="flex-1 space-y-2 sm:mt-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-10" />
            </div>
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full">

      {/* Error State */}
      {error && (
        <div className="mb-6 flex items-center gap-3 border-b border-destructive/40 pb-4 text-sm">
          <span className="font-medium text-destructive">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
            className="ml-auto rounded-full text-muted-foreground hover:text-foreground"
          >
            Try again
          </Button>
        </div>
      )}

      {loading && page === 1 ? (
        <LoadingSkeletons />
      ) : (items.length === 0 && !loading) ? (
        <div className="flex flex-col items-center py-24 text-center">
          <Calendar className="mb-4 h-8 w-8 text-muted-foreground/50" />
          <h3 className="text-lg font-medium text-foreground">No sitters found</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Try adjusting your filters or search criteria.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-3">
            {items.map((sitter) => (
              <Link
                key={sitter.id}
                to={`/sitter-profile/${sitter.id}`}
                className="group flex gap-4 sm:block"
              >
                {/* Image */}
                <div className="aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:aspect-[4/3] sm:w-full">
                  <img
                    src={sitter.avatarUrl?.trim() || "https://images.pexels.com/photos/2607544/pexels-photo-2607544.jpeg"}
                    alt={sitter.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1 sm:mt-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="truncate text-[15px] font-medium text-foreground">
                      {sitter.name}
                    </h3>
                    <span className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      {sitter.rating.toFixed(1)}
                      <span className="text-muted-foreground/70">({sitter.reviews})</span>
                    </span>
                  </div>

                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {sitter.location || "Location not set"}
                  </p>

                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground/90">
                    {sitter.bio || `Hi! I am ${sitter.name}, a professional pet lover ready to care for your furry family members.`}
                  </p>

                  <p className="mt-2 text-sm text-foreground">
                    ₹{sitter.pricePerHour}
                    <span className="text-muted-foreground"> /hr</span>
                    {sitter.petTypes.length > 0 && (
                      <span className="ml-2 text-muted-foreground">
                        {sitter.petTypes.map((t) => (t === "dog" ? "🐶" : "🐱")).join(" ")}
                      </span>
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="py-6 text-center">
              <Button
                variant="secondary"
                disabled={loading}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-full px-8"
              >
                {loading ? "Loading more…" : "Load more sitters"}
                <ArrowDown></ArrowDown>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PetsitterList;
