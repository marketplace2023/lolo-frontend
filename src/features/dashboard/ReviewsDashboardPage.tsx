import { useState } from "react";
import { Star, MessageSquare, TrendingUp, ThumbsUp, Filter, ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

interface IReview {
  id: number;
  productId: number;
  productTitle: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
  responded: boolean;
}

const MOCK_MY_REVIEWS: IReview[] = [
  { id: 1, productId: 1, productTitle: "Cemento Gris Portland Tipo I (Saco 42.5kg)", author: "Carlos Medina", avatar: "https://picsum.photos/seed/u1/80/80", rating: 5, date: "2026-04-15", comment: "Excelente calidad, el cemento llegó en perfectas condiciones.", helpful: 12, responded: false },
  { id: 2, productId: 1, productTitle: "Cemento Gris Portland Tipo I (Saco 42.5kg)", author: "María González", avatar: "https://picsum.photos/seed/u2/80/80", rating: 4, date: "2026-04-10", comment: "Buen producto. Solo le bajo una estrella porque el saco llegó un poco húmedo.", helpful: 5, responded: true },
  { id: 3, productId: 1, productTitle: "Cemento Gris Portland Tipo I (Saco 42.5kg)", author: "José Ramírez", avatar: "https://picsum.photos/seed/u3/80/80", rating: 5, date: "2026-03-28", comment: "Uso este cemento en todos mis proyectos. Nunca falla.", helpful: 8, responded: false },
  { id: 4, productId: 4, productTitle: "Cabillas de 1/2 pulgada (Barra 6m)", author: "Roberto Pérez", avatar: "https://picsum.photos/seed/u6/80/80", rating: 4, date: "2026-04-05", comment: "Las cabillas son de buena calidad y el peso es el correcto.", helpful: 6, responded: true },
  { id: 5, productId: 4, productTitle: "Cabillas de 1/2 pulgada (Barra 6m)", author: "Sofía Martín", avatar: "https://picsum.photos/seed/u7/80/80", rating: 3, date: "2026-03-20", comment: "El producto es correcto, pero el tiempo de entrega fue mayor al prometido.", helpful: 2, responded: false },
];

const avg = (MOCK_MY_REVIEWS.reduce((s, r) => s + r.rating, 0) / MOCK_MY_REVIEWS.length).toFixed(1);

export function ReviewsDashboardPage() {
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "rating">("date");
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [responded, setResponded] = useState<Set<number>>(new Set(MOCK_MY_REVIEWS.filter(r => r.responded).map(r => r.id)));

  const filtered = MOCK_MY_REVIEWS
    .filter(r => filterRating === "all" || r.rating === filterRating)
    .sort((a, b) => sortBy === "date" ? new Date(b.date).getTime() - new Date(a.date).getTime() : b.rating - a.rating);

  const handleRespond = (id: number) => {
    if (!replyText[id]?.trim()) return;
    setResponded(prev => new Set([...prev, id]));
    setReplyText(prev => ({ ...prev, [id]: "" }));
  };

  const ratingCounts = [5,4,3,2,1].map(s => ({ star: s, count: MOCK_MY_REVIEWS.filter(r => r.rating === s).length }));

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="text-primary" /> Reseñas de mis Productos
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Monitorea lo que dicen tus clientes y responde para mejorar tu reputación.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <Star size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">{avg}</p>
            <p className="text-xs text-muted-foreground">Calificación promedio</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">{MOCK_MY_REVIEWS.length}</p>
            <p className="text-xs text-muted-foreground">Reseñas totales</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <ThumbsUp size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">{MOCK_MY_REVIEWS.filter(r => r.rating >= 4).length}</p>
            <p className="text-xs text-muted-foreground">Reseñas positivas (4-5★)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Breakdown */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center">
          <span className="text-5xl font-black text-primary">{avg}</span>
          <div className="flex gap-0.5 my-2">
            {[1,2,3,4,5].map(i => <Star key={i} size={18} className={i <= Math.round(Number(avg)) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"} />)}
          </div>
          <p className="text-xs text-muted-foreground mb-6">{MOCK_MY_REVIEWS.length} reseñas en total</p>
          <div className="w-full space-y-2">
            {ratingCounts.map(({ star, count }) => (
              <button
                key={star}
                onClick={() => setFilterRating(filterRating === star ? "all" : star)}
                className={cn("w-full flex items-center gap-2 text-sm rounded-lg px-2 py-1 transition-colors", filterRating === star ? "bg-primary/10 text-primary" : "hover:bg-muted/50")}
              >
                <span className="w-3 text-right font-semibold text-muted-foreground">{star}</span>
                <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" />
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${(count / MOCK_MY_REVIEWS.length) * 100}%` }} />
                </div>
                <span className="text-muted-foreground w-4 text-left">{count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-3 flex-wrap">
            {filterRating !== "all" && (
              <span className="text-xs bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                <Filter size={11} /> {filterRating} estrella{filterRating === 1 ? "" : "s"}
                <button onClick={() => setFilterRating("all")} className="ml-1 hover:text-foreground">✕</button>
              </span>
            )}
            <div className="ml-auto relative">
              <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                className="appearance-none pl-3 pr-7 py-1.5 rounded-lg bg-card border border-border text-xs font-medium text-muted-foreground focus:outline-none cursor-pointer">
                <option value="date">Más recientes</option>
                <option value="rating">Por calificación</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>
          </div>

          {filtered.map(review => (
            <div key={review.id} className="bg-card border border-border rounded-xl p-5">
              {/* Product tag */}
              <span className="inline-block text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full mb-3">
                {review.productTitle}
              </span>

              <div className="flex items-start gap-3">
                <img src={review.avatar} alt={review.author} className="w-9 h-9 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-bold text-sm text-foreground">{review.author}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.date).toLocaleDateString('es-VE', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      {responded.has(review.id) ? (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full">Respondida</span>
                      ) : (
                        <span className="text-[10px] bg-amber-500/10 text-amber-500 font-bold px-2 py-0.5 rounded-full">Sin respuesta</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-0.5 my-1">
                    {[1,2,3,4,5].map(i => <Star key={i} size={13} className={i <= review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"} />)}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>

                  {/* Reply area */}
                  {!responded.has(review.id) && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <textarea
                        value={replyText[review.id] || ""}
                        onChange={e => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                        placeholder="Escribe tu respuesta al cliente..."
                        rows={2}
                        className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring outline-none resize-none"
                      />
                      <button
                        onClick={() => handleRespond(review.id)}
                        disabled={!replyText[review.id]?.trim()}
                        className="mt-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Responder
                      </button>
                    </div>
                  )}
                  {responded.has(review.id) && (
                    <div className="mt-3 pl-3 border-l-2 border-primary/30">
                      <p className="text-xs font-bold text-primary mb-0.5">Tu respuesta</p>
                      <p className="text-xs text-muted-foreground">Gracias por tu reseña. Tomamos nota para mejorar nuestro servicio.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
