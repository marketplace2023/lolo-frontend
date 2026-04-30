import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ChevronDown, Filter, Loader2, MessageSquare, Star, ThumbsUp, TrendingUp } from "lucide-react";
import { cn } from "@/utils/cn";
import { getMyMarketplaceReviews } from "@/features/marketplace/api";

export function ReviewsDashboardPage() {
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "rating">("date");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["marketplace-my-reviews"],
    queryFn: () => getMyMarketplaceReviews(),
  });

  const reviews = data?.data ?? [];
  const summary = data?.summary ?? {
    averageRating: 0,
    total: 0,
    positive: 0,
    breakdown: [5, 4, 3, 2, 1].map((star) => ({ star, count: 0 })),
  };

  const filtered = useMemo(() => {
    return reviews
      .filter((review) => filterRating === "all" || review.rating === filterRating)
      .sort((a, b) => sortBy === "date"
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : b.rating - a.rating);
  }, [reviews, filterRating, sortBy]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in pb-12">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="text-primary" /> Reseñas de mis Productos
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Esta vista ya consume el API del marketplace y dejó de depender de reseñas mock locales.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <Star size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">{summary.averageRating.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Calificación promedio</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">{summary.total}</p>
            <p className="text-xs text-muted-foreground">Reseñas totales</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <ThumbsUp size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">{summary.positive}</p>
            <p className="text-xs text-muted-foreground">Reseñas positivas (4-5★)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center">
          <span className="text-5xl font-black text-primary">{summary.averageRating.toFixed(1)}</span>
          <div className="flex gap-0.5 my-2">
            {[1, 2, 3, 4, 5].map((index) => <Star key={index} size={18} className={index <= Math.round(summary.averageRating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"} />)}
          </div>
          <p className="text-xs text-muted-foreground mb-6">{summary.total} reseñas en total</p>
          <div className="w-full space-y-2">
            {summary.breakdown.map(({ star, count }) => (
              <button
                key={star}
                onClick={() => setFilterRating(filterRating === star ? "all" : star)}
                className={cn("w-full flex items-center gap-2 text-sm rounded-lg px-2 py-1 transition-colors", filterRating === star ? "bg-primary/10 text-primary" : "hover:bg-muted/50")}
              >
                <span className="w-3 text-right font-semibold text-muted-foreground">{star}</span>
                <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" />
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${summary.total ? (count / summary.total) * 100 : 0}%` }} />
                </div>
                <span className="text-muted-foreground w-4 text-left">{count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            {filterRating !== "all" && (
              <span className="text-xs bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                <Filter size={11} /> {filterRating} estrella{filterRating === 1 ? "" : "s"}
                <button onClick={() => setFilterRating("all")} className="ml-1 hover:text-foreground">x</button>
              </span>
            )}
            <div className="ml-auto relative">
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value as "date" | "rating")}
                className="appearance-none pl-3 pr-7 py-1.5 rounded-lg bg-card border border-border text-xs font-medium text-muted-foreground focus:outline-none cursor-pointer">
                <option value="date">Más recientes</option>
                <option value="rating">Por calificación</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>
          </div>

          {isLoading ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
              Cargando reseñas desde el API...
            </div>
          ) : isError ? (
            <div className="bg-card border border-red-200 rounded-xl p-10 text-center text-red-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-3" />
              No se pudieron cargar las reseñas.
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-3 text-primary" />
              <p className="font-semibold text-foreground mb-1">Sin reseñas publicadas todavía</p>
              <p className="text-sm">El frontend ya está conectado al API. Cuando el backend empiece a persistir reseñas, aparecerán aquí automáticamente.</p>
            </div>
          ) : (
            filtered.map((review) => (
              <div key={review.id} className="bg-card border border-border rounded-xl p-5">
                <span className="inline-block text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full mb-3">
                  {review.productTitle}
                </span>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                    {review.author.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-bold text-sm text-foreground">{review.author}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.date).toLocaleDateString("es-VE", { year: "numeric", month: "short", day: "numeric" })}
                        </span>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", review.responded ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500")}>
                          {review.responded ? "Respondida" : "Sin respuesta"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-0.5 my-1">
                      {[1, 2, 3, 4, 5].map((index) => <Star key={index} size={13} className={index <= review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"} />)}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
