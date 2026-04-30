import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import {
  Package,
  Plus,
  Tag,
  ExternalLink,
  Edit2,
  Layers,
  Search,
  ShoppingBag,
  Star,
  TrendingUp,
  X,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { getMyMarketplaceOffers, IMarketplaceOffer } from "./api";
import { ProductFormPage } from "./ProductFormPage";

function StatusBadge({ stock, type }: { stock: number | null; type: string }) {
  if (type === "service")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
        <Tag size={10} /> Servicio
      </span>
    );
  if (stock === null || stock === undefined)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
        Sin stock
      </span>
    );
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
        <AlertCircle size={10} /> Agotado
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      <Package size={10} /> En stock ({stock})
    </span>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
        <ShoppingBag size={36} className="text-muted-foreground" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-foreground">Aún no tienes publicaciones</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Crea tu primera publicación y empieza a ofrecer productos o servicios en el marketplace.
        </p>
      </div>
      <button
        onClick={onNew}
        className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all shadow-sm hover:shadow-md hover:shadow-primary/20"
      >
        <Plus size={16} /> Crear primera publicación
      </button>
    </div>
  );
}

function OfferRow({ offer, onView }: { offer: IMarketplaceOffer; onView: (id: string) => void }) {
  const image = offer.images?.[0] ?? offer.image;
  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors group">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border">
            {image ? (
              <img src={image} alt={offer.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package size={20} className="text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm truncate max-w-[200px]">{offer.title}</p>
            {offer.sku && <p className="text-xs text-muted-foreground font-mono">{offer.sku}</p>}
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">{offer.category}</span>
      </td>
      <td className="py-3 px-4">
        <StatusBadge stock={offer.stock} type={offer.type} />
      </td>
      <td className="py-3 px-4 text-right">
        <span className="font-bold text-foreground tabular-nums">
          {offer.currency} {offer.price.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1 text-amber-400">
          <Star size={12} fill="currentColor" />
          <span className="text-xs font-semibold text-foreground">{offer.rating?.toFixed(1) ?? "—"}</span>
          <span className="text-xs text-muted-foreground">({offer.reviews ?? 0})</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onView(offer.id)}
            className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
            title="Ver en marketplace"
          >
            <ExternalLink size={15} />
          </button>
          <button
            className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            title="Editar (próximamente)"
          >
            <Edit2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function MyListingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["marketplace-offers-my"],
    queryFn: getMyMarketplaceOffers,
  });

  const offers = data?.data ?? [];
  const filtered = offers.filter(
    (o) =>
      !search ||
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.category.toLowerCase().includes(search.toLowerCase()) ||
      (o.sku ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenuePotential = offers.reduce((acc, o) => acc + o.price * (o.stock ?? 1), 0);

  const handleCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["marketplace-offers-my"] });
    setShowForm(false);
  };

  if (showForm) {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="flex items-center gap-3 pb-2">
          <button
            onClick={() => setShowForm(false)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} /> Cancelar y volver a mis publicaciones
          </button>
        </div>
        <ProductFormPage onSuccess={handleCreated} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Mis Publicaciones</h2>
          <p className="text-sm text-muted-foreground">Gestiona los productos y servicios de tu empresa en el marketplace</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all shadow-sm hover:shadow-md hover:shadow-primary/20"
        >
          <Plus size={16} /> Nueva Publicación
        </button>
      </div>

      {/* Stats */}
      {offers.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total publicaciones", value: offers.length, icon: Layers, color: "text-primary" },
            { label: "Servicios activos", value: offers.filter((o) => o.type === "service").length, icon: Tag, color: "text-blue-400" },
            {
              label: "Valor en catálogo",
              value: `$${totalRevenuePotential.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
              icon: TrendingUp,
              color: "text-emerald-400",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                <div className={cn("w-10 h-10 rounded-xl bg-muted flex items-center justify-center", stat.color)}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {offers.length > 0 && (
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nombre, categoría o SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            Cargando publicaciones...
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
            <AlertCircle size={32} className="text-red-400" />
            <p className="font-medium">No se pudieron cargar tus publicaciones.</p>
          </div>
        ) : offers.length === 0 ? (
          <EmptyState onNew={() => setShowForm(true)} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
            <Search size={28} />
            <p className="font-medium">Ningún resultado para "{search}"</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-4 text-left font-semibold">Publicación</th>
                  <th className="py-3 px-4 text-left font-semibold">Categoría</th>
                  <th className="py-3 px-4 text-left font-semibold">Estado</th>
                  <th className="py-3 px-4 text-right font-semibold">Precio</th>
                  <th className="py-3 px-4 text-left font-semibold">Rating</th>
                  <th className="py-3 px-4 text-left font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((offer) => (
                  <OfferRow key={offer.id} offer={offer} onView={(id) => navigate(`/product/${id}`)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
