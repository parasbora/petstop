
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "./ui/badge";
import { MessageSquare, Star, MapPin, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { apiBase, getToken } from "@/lib/auth";

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
  serviceType: any;
};

const API_BASE = apiBase();

type ListProps = {
  filters: FiltersState;
};

const buildQuery = (params: Record<string, any>) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    q.append(k, String(v));
  });
  return q.toString();
};

const PetsitterList: React.FC<ListProps> = ({ filters }) => {
  const [sortBy, setSortBy] = useState<"relevance" | "price_asc" | "price_desc" | "rating_desc">("relevance");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<PetSitter[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  // Reset to page 1 whenever filters or sort change
  useEffect(() => {
    setPage(1);
  }, [JSON.stringify(filters), sortBy]);


  useEffect(() => {
    const controller = new AbortController();

    const fetchSitters = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, any> = {
          page,
          limit: pageSize,
        };

        if (sortBy && sortBy !== "relevance") {
          params.sort = sortBy;
        }

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
        const serverItems = (body?.data || []) as any[];
        const mapped: PetSitter[] = serverItems.map((s: any) => ({
          id: s.id,
          name: s.name || s.name || "Unknown",
          avatarUrl: s.avatarUrl || s.user?.avatarUrl,
          petTypes: (["dog", "cat"] as Array<"dog" | "cat">).filter((t) => s[`${t}Sitting`] || s.petTypes?.includes?.(t)),
          pricePerHour: Number(s.hourlyRate ?? 0),
          rating: Number(s.rating ?? 0),
          reviews: Number(s.reviews ?? 0),
          location: s.location || s.city || "",
          bio: s.bio || s.description || "",
          serviceType: s.serviceTypes || []
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
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setError(e.message || "Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSitters();

    return () => {
      controller.abort();
    };
  }, [page, sortBy, filters.petType, filters.maxPricePerHour, filters.minPricePerHour, filters.ratingMin, filters.nameQuery, filters.locationQuery]);

  const resultsText = useMemo(() => {
    if (loading) return "Searching...";
    if (totalCount === 0) return "No sitters found";
    if (totalCount !== null) return `${totalCount} sitter${totalCount !== 1 ? 's' : ''} found`;
    return `${items.length} sitter${items.length !== 1 ? 's' : ''}`;
  }, [items.length, totalCount, loading]);

  // Loading skeletons
  const LoadingSkeletons = () => (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="p-4 animate-pulse">
          <div className="flex gap-4 items-start">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-60" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="w-full flex flex-col min-h-0"> {/* Changed from min-h-[calc(100dvh-8rem)] to min-h-0 */}
      {/* Header Section - Fixed */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 p-1 bg-background">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground">Pet Sitters</h2>
          <div className={`text-sm transition-colors ${loading ? "text-muted-foreground" : "text-muted-foreground"
            }`}>
            {resultsText}
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
      </div>

      {/* Error State */}
      {error && (
        <Card className="mb-6 border-primary bg-primary/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-primary text-sm">{error}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="ml-auto"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scrollable Content Area - Confined height */}
      <div className="flex-1 min-h-0 flex flex-col"> {/* Added flex container */}
        {/* Scrollable List Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-0"> {/* Added min-h-0 and flex-1 */}
          {loading && page === 1 ? (
            <LoadingSkeletons />
          ) : items.length === 0 ? (
            <Card className="text-center py-12 border-dashed">
              <CardContent>
                <div className="text-muted-foreground mb-4">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <h3 className="font-semibold text-lg mb-2">No sitters found</h3>
                  <p className="text-sm max-w-sm mx-auto">
                    Try adjusting your filters or search criteria to find more pet sitters in your area.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setPage(1)}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {items.map((sitter) => (
                <Card
                  key={sitter.id}
                  className="p-4 hover:shadow-lg transition-all duration-200  group  cursor-pointer"
                >
                  <div className="flex gap-4 items-start">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-md overflow-hidden bg-muted border-2 border-border group-hover:border-primary/50 transition-colors">
                        <img
                          src={
                            sitter.avatarUrl?.trim() ||
                            "https://images.pexels.com/photos/2607544/pexels-photo-2607544.jpeg"
                          }
                          alt={sitter.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header Row */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-2">
                          <div>
                            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                              {sitter.name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                {sitter.location}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                {sitter.rating.toFixed(1)} ({sitter.reviews} review{sitter.reviews !== 1 ? 's' : ''})
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0 ml-4">
                          <div className="text-xl font-bold text-primary mb-1">
                            ${sitter.pricePerHour}
                            <span className="text-sm font-normal text-muted-foreground">/hr</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {sitter.petTypes.sort().join(" & ")} specialist
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-foreground/80 mb-4 line-clamp-2 leading-relaxed text-sm">
                        {sitter.bio || "Experienced pet sitter dedicated to providing the best care for your furry friends."}
                      </p>

                      {/* Footer - Services & Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Service Badges */}
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(sitter.serviceType) && sitter.serviceType.slice(0, 3).map((service) => (
                            <Badge
                              key={service}
                              variant="secondary"
                              className="px-2.5 py-1 text-xs bg-secondary/50 hover:bg-secondary/70 transition-colors"
                            >
                              {service}
                            </Badge>
                          ))}
                          {sitter.serviceType.length > 3 && (
                            <Badge variant="outline" className="px-2.5 py-1 text-xs">
                              +{sitter.serviceType.length - 3} more
                            </Badge>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 flex-shrink-0">
                          <Button size="sm" variant="outline" className="h-9 px-4 text-xs sm:text-sm">
                            View Profile
                          </Button>
                          <Button size="sm" className="h-9 px-4 gap-2 text-xs sm:text-sm">
                            <MessageSquare className="w-4 h-4" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Loading more indicator */}
              {loading && page > 1 && (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <Card key={`loading-${index}`} className="p-4 animate-pulse">
                      <div className="flex gap-4 items-start">
                        <Skeleton className="w-20 h-20 rounded-full" />
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-4 w-60" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination - Fixed at bottom */}
        {(items.length > 0 || page > 1) && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t bg-background">
            <div className="text-sm text-muted-foreground">
              Showing {items.length} of {totalCount || "?"} sitters
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1 px-3 py-1 text-sm text-muted-foreground">
                Page {page}{totalCount ? ` of ${Math.max(1, Math.ceil(totalCount / pageSize))}` : ""}
              </div>

              <Button
                size="sm"
                disabled={!hasMore || loading || !!error}
                onClick={() => setPage((p) => p + 1)}
                className="gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetsitterList;