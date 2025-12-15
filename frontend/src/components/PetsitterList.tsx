import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge"; // Check your import path
import { MessageSquare, Star, MapPin, Calendar } from "lucide-react";
import { apiBase, getToken } from "@/lib/auth";
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

const PetsitterList: React.FC<ListProps> = ({ filters }) => {
  const [sortBy,] = useState<"relevance" | "price_asc" | "price_desc" | "rating_desc">("relevance");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<PetSitter[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  // Reset to page 1 whenever filters or sort change
  useEffect(() => {
    console.log('Page reset triggered');
    setPage(1);
  }, [JSON.stringify(filters), sortBy]);

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
        if (filters.petType && filters.petType !== "any") params.petType = filters.petType;
        if (typeof filters.maxPricePerHour === "number") params.maxPricePerHour = filters.maxPricePerHour;
        if (typeof filters.minPricePerHour === "number") params.minPricePerHour = filters.minPricePerHour;
        if (typeof filters.ratingMin === "number") params.ratingMin = filters.ratingMin;
        if ((filters.nameQuery ?? "").trim()) params.name = (filters.nameQuery ?? "").trim();
        if ((filters.locationQuery ?? "").trim()) params.location = (filters.locationQuery ?? "").trim();

        const query = buildQuery(params);
        const url = `${API_BASE}/petsitters${query ? `?${query}` : ""}`;
        const token = getToken() || "";

        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        });

        if (!res.ok) {
          if (res.status === 401) throw new Error("Please sign in to view pet sitters.");
          throw new Error(`Failed to load sitters (${res.status})`);
        }

        const body = await res.json();
        const serverItems: PetSitterApiResponse[] = body?.data ?? [];

        const mapped: PetSitter[] = serverItems.map((s) => ({
          id: s.id,
          name: s.name || "Unknown",
          avatarUrl: s.avatarUrl || s.user?.avatarUrl,
          petTypes: (["dog", "cat"] as const).filter(
            (t) => s.petTypes?.includes(t) || s[`${t}Sitting` as keyof PetSitterApiResponse]
          ),
          pricePerHour: Number(s.hourlyRate ?? 0),
          rating: Number(s.rating ?? 0),
          reviews: Number(s.reviews ?? 0),
          location: s.location || s.city || "",
          bio: s.bio || s.description || "",
          serviceType: s.serviceTypes || [],
        }));

        setItems(prev => page === 1 ? mapped : [...prev, ...mapped]);

        const total = typeof body?.total === "number" ? Number(body.total) : null;
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
    console.log('Fetch effect triggered with page:', page, 'filters:', filters);
    return () => controller.abort();
  }, [page, sortBy, JSON.stringify(filters)]); // Simplified deps

  const resultsText = useMemo(() => {
    if (loading) return "Searching...";
    if (totalCount === 0) return "No sitters found";
    if (totalCount !== null) return `${totalCount} sitter${totalCount !== 1 ? 's' : ''} found`;
    return `${items.length} sitter${items.length !== 1 ? 's' : ''}`;
  }, [items.length, totalCount, loading]);

  // --- Components ---

  const LoadingSkeletons = () => (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="p-3 sm:p-4 animate-pulse">
          <div className="flex gap-3 sm:gap-4 items-start">
            <Skeleton className="w-16 h-16 sm:w-24 sm:h-24 rounded-md shrink-0" />
            <div className="flex-1 space-y-3 min-w-0">
              <div className="flex justify-between items-start">
                <div className="space-y-2 w-full">
                  <Skeleton className="h-5 w-32 sm:w-40" />
                  <Skeleton className="h-4 w-24 sm:w-60" />
                </div>
                <Skeleton className="h-6 w-12 sm:w-16 shrink-0 ml-2" />
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between pt-2">
                <Skeleton className="h-6 w-24" />
                <div className="flex gap-2 w-full sm:w-auto">
                  <Skeleton className="h-9 flex-1 sm:w-24" />
                  <Skeleton className="h-9 flex-1 sm:w-24" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="w-full flex flex-col min-h-0">

      {/* Error State */}
      {error && (
        <Card className="mb-6 border-destructive/50 bg-destructive/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-destructive text-sm font-medium">{error}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="ml-auto bg-background hover:bg-accent"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count Header */}
      {!error && !loading && items.length > 0 && (
        <div className="mb-2 px-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {resultsText}
        </div>
      )}

      {/* Scrollable List Area */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 sm:space-y-4 min-h-0 pb-4">

          {loading && page === 1 ? (
            <LoadingSkeletons />
          ) : (items.length === 0 && !loading) ? (
            <Card className="text-center py-12 border-dashed bg-muted/30">
              <CardContent>
                <div className="text-muted-foreground mb-4">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <h3 className="font-semibold text-lg mb-2">No sitters found</h3>
                  <p className="text-sm max-w-sm mx-auto">
                    Try adjusting your filters or search criteria.
                  </p>
                </div>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Refresh
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {items.map((sitter) => (
                <Card
                  key={sitter.id}
                  className="p-3 sm:p-4 hover:shadow-md transition-all duration-200 group cursor-pointer border-muted-foreground/10"
                >
                  <div className="flex gap-3 sm:gap-4 items-start">
                    {/* Avatar - Responsive sizing */}
                    <div className="shrink-0 relative">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-muted border border-border group-hover:border-primary/50 transition-colors">
                        <img
                          src={sitter.avatarUrl?.trim() || "https://images.pexels.com/photos/2607544/pexels-photo-2607544.jpeg"}
                          alt={sitter.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      {/* Mobile Badge for Pet Type (optional visual flare) */}
                      <div className="absolute -bottom-1 -right-1 sm:hidden bg-background rounded-full border border-border p-0.5 shadow-sm">
                        {sitter.petTypes.includes("dog") ? <span className="text-xs">🐶</span> : <span className="text-xs">🐱</span>}
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0 flex flex-col h-full">

                      {/* Header Row: Name & Price */}
                      <div className="flex justify-between items-start mb-1 sm:mb-2">
                        <div className="min-w-0 pr-2">
                          <h3 className="font-semibold text-base sm:text-lg truncate text-foreground group-hover:text-primary transition-colors">
                            {sitter.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              {sitter.location}
                            </span>
                            <span className="flex items-center gap-1 font-medium text-foreground/80">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                              {sitter.rating.toFixed(1)} <span className="text-muted-foreground font-normal">({sitter.reviews})</span>
                            </span>
                          </div>
                        </div>

                        {/* Price Column */}
                        <div className="text-right shrink-0">
                          <div className="text-lg sm:text-xl font-bold text-primary leading-tight">
                            ₹{sitter.pricePerHour}
                          </div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                            /hour
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 leading-relaxed mb-3 sm:mb-4">
                        {sitter.bio || `Hi! I am ${sitter.name}, a professional pet lover ready to take care of your furry family members.`}
                      </p>

                      {/* Footer: Services & Actions */}
                      <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        {/* Service Badges */}
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {Array.isArray(sitter.serviceType) && sitter.serviceType.slice(0, 3).map((service) => (
                            <Badge
                              key={service}
                              variant="secondary"
                              className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs bg-secondary/40 font-normal text-secondary-foreground"
                            >
                              {service}
                            </Badge>
                          ))}
                          {/* Pet Type Badges */}
                          {sitter.petTypes.map(t => (
                            <Badge key={t} variant="outline" className="px-1.5 py-0.5 text-[10px] sm:text-xs capitalize border-primary/20 text-primary/80">
                              {t}
                            </Badge>
                          ))}
                        </div>

                        {/* Action Buttons - Grid on Mobile, Flex on Desktop */}
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 pt-1 sm:pt-0">
                          <Link to={`/sitter-profile/${sitter.id}`} >

                            <Button size="sm" variant="outline" className="h-8 sm:h-9 text-xs w-full"  >
                              Profile
                            </Button>
                          </Link>
                          <Button size="sm" className="h-8 sm:h-9 gap-1.5 text-xs w-full">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Load More Indicator */}
              {hasMore && (
                <div className="py-4 text-center">
                  <Button
                    variant="ghost"
                    disabled={loading}
                    onClick={() => setPage(p => p + 1)}
                    className="text-muted-foreground"
                  >
                    {loading ? "Loading more..." : "Load More Sitters"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetsitterList;