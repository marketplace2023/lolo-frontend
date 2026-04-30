import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  AlertCircle,
  ChevronDown,
  Filter,
  Grid3X3,
  List,
  Loader2,
  Package,
  Search,
  ShoppingBag,
  Star,
  Tag,
  Wrench,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { getMarketplaceOffers, IMarketplaceOffer } from "./api";

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function ProductImage({ product }: { product: IMarketplaceOffer }) {
  if (product.image) {
    return <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />;
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500">
      {product.type === "service" ? <Wrench size={40} /> : <Package size={40} />}
    </div>
  );
}

export function ShopPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [type, setType] = useState<"all" | "product" | "service">("all");
  const [priceMax, setPriceMax] = useState(0);
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["marketplace-offers"],
    queryFn: () => getMarketplaceOffers(),
  });

  const products = data?.data ?? [];

  const maxAvailablePrice = useMemo(() => {
    const max = products.reduce((currentMax, product) => Math.max(currentMax, product.price), 0);
    return Math.max(Math.ceil(max), 1);
  }, [products]);

  const effectivePriceMax = priceMax || maxAvailablePrice;

  const categories = useMemo(() => {
    const values = Array.from(new Set(products.map((product) => product.category).filter(Boolean))).sort((a, b) => a.localeCompare(b));
    return ["Todos", ...values];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products.filter((product) => {
      const term = search.trim().toLowerCase();
      const matchSearch = !term
        || product.title.toLowerCase().includes(term)
        || product.seller.toLowerCase().includes(term)
        || product.description.toLowerCase().includes(term)
        || product.sku.toLowerCase().includes(term);
      const matchCategory = category === "Todos" || product.category === category;
      const matchType = type === "all" || product.type === type;
      const matchPrice = product.price <= effectivePriceMax;
      return matchSearch && matchCategory && matchType && matchPrice;
    });

    if (sortBy === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === "rating") list = [...list].sort((a, b) => b.rating - a.rating || b.price - a.price);

    return list;
  }, [products, search, category, type, effectivePriceMax, sortBy]);

  const FilterSidebar = () => (
    <aside className="w-full space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 mb-3">Tipo de oferta</h3>
        <div className="space-y-2">
          {[
            { id: "all", label: "Todos", icon: Grid3X3 },
            { id: "product", label: "Productos", icon: Package },
            { id: "service", label: "Servicios", icon: Wrench },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setType(item.id as "all" | "product" | "service")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                type === item.id
                  ? "bg-[#FF6A00] text-white shadow-md shadow-[#FF6A00]/20"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <item.icon size={16} /> {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 mb-3">Categoría</h3>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                category === item
                  ? "bg-orange-50 text-[#FF6A00] font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 mb-1">Precio máximo</h3>
        <p className="text-2xl font-black text-[#FF6A00] mb-4">{formatUsd(effectivePriceMax)}</p>
        <input
          type="range"
          min={0}
          max={maxAvailablePrice}
          value={effectivePriceMax}
          onChange={(event) => setPriceMax(Number(event.target.value))}
          className="w-full accent-[#FF6A00]"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>$0</span>
          <span>{formatUsd(maxAvailablePrice)}</span>
        </div>
      </div>

      {(category !== "Todos" || type !== "all" || priceMax > 0 || search) && (
        <button
          onClick={() => {
            setCategory("Todos");
            setType("all");
            setPriceMax(0);
            setSearch("");
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-gray-500 hover:text-red-500 border border-gray-200 rounded-xl transition-colors"
        >
          <X size={14} /> Limpiar filtros
        </button>
      )}
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-gray-900">Catálogo de Productos y Servicios</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {filtered.length} resultados{category !== "Todos" && ` en ${category}`}
              </p>
            </div>

            <div className="w-full md:w-96 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar productos o servicios..."
                className="w-full pl-11 pr-10 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#FF6A00]/30 focus:border-[#FF6A00] outline-none text-sm text-gray-900 transition"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex gap-8">
          <div className="hidden lg:block w-64 shrink-0">
            <FilterSidebar />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm"
              >
                <Filter size={16} /> Filtros
              </button>

              <div className="flex items-center gap-3 ml-auto">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[#FF6A00]/30 outline-none cursor-pointer shadow-sm"
                  >
                    <option value="relevance">Relevancia</option>
                    <option value="price_asc">Precio: Menor a Mayor</option>
                    <option value="price_desc">Precio: Mayor a Menor</option>
                    <option value="rating">Mejor Calificados</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <button onClick={() => setViewMode("grid")} className={cn("p-2.5 transition-colors", viewMode === "grid" ? "bg-[#FF6A00] text-white" : "text-gray-500 hover:bg-gray-50")}>
                    <Grid3X3 size={16} />
                  </button>
                  <button onClick={() => setViewMode("list")} className={cn("p-2.5 transition-colors", viewMode === "list" ? "bg-[#FF6A00] text-white" : "text-gray-500 hover:bg-gray-50")}>
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {showMobileFilters && (
              <div className="lg:hidden mb-6 animate-in slide-in-from-top-4 duration-300">
                <FilterSidebar />
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 text-center text-gray-500 gap-4">
                <Loader2 size={48} className="animate-spin text-[#FF6A00]" />
                <p className="text-lg font-semibold">Cargando catálogo real del marketplace...</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-32 text-center text-red-500 gap-4 bg-white rounded-2xl border border-red-100">
                <AlertCircle size={48} />
                <div>
                  <p className="text-lg font-semibold">No se pudo cargar el catálogo</p>
                  <p className="text-sm text-red-400 mt-1">Verifica que el backend esté disponible y respondiendo en `/api/marketplace/offers`.</p>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center text-gray-400 gap-4">
                <Package size={56} className="opacity-20" />
                <p className="text-xl font-bold text-gray-500">Sin resultados</p>
                <p className="text-sm">No hay publicaciones reales que coincidan con tus filtros.</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col">
                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                      <span className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur text-xs font-bold px-2.5 py-1 rounded-full text-gray-700 shadow flex items-center gap-1">
                        {product.type === "service" ? <Wrench size={10} /> : <Package size={10} />}
                        {product.type === "service" ? "Servicio" : "Producto"}
                      </span>
                      <ProductImage product={product} />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-xs text-gray-400 mb-1 truncate">{product.seller}</p>
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 flex-1">{product.title}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((index) => (
                          <Star key={index} size={11} className={index <= Math.round(product.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                        ))}
                        <span className="text-xs text-gray-400 ml-1">({product.reviews})</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                          <Tag size={10} /> {product.category}
                        </span>
                        {product.unit && <span>{product.unit}</span>}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-black text-[#FF6A00]">{formatUsd(product.price)}</span>
                          <span className="text-xs text-gray-400 ml-1">{product.currency}</span>
                        </div>
                        <span className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-[#FF6A00] group-hover:text-white group-hover:border-[#FF6A00] transition-all shadow-sm">
                          <ShoppingBag size={16} />
                        </span>
                      </div>
                      {product.stock !== null && (
                        <p className="text-[11px] text-emerald-600 font-medium mt-2">✓ {product.stock} disponibles</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer flex gap-5 p-4">
                    <div className="w-28 h-28 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                      <ProductImage product={product} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-xs text-gray-400 mb-0.5">{product.seller}</p>
                          <h3 className="font-bold text-gray-900 leading-snug mb-1">{product.title}</h3>
                          <div className="flex items-center gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map((index) => (
                              <Star key={index} size={11} className={index <= Math.round(product.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                            ))}
                            <span className="text-xs text-gray-400 ml-1">({product.reviews} reseñas)</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                              <Tag size={10} /> {product.category}
                            </span>
                            {product.unit && <span className="text-xs text-gray-500">Unidad: {product.unit}</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-2xl font-black text-[#FF6A00]">{formatUsd(product.price)}</p>
                          <p className="text-xs text-gray-400">{product.currency}</p>
                          {product.stock !== null && <p className="text-xs text-emerald-600 font-medium mt-1">✓ En stock</p>}
                          <span className="mt-3 inline-block px-5 py-2 bg-[#FF6A00] text-white text-sm font-bold rounded-xl hover:bg-[#e65f00] transition-colors shadow-md shadow-[#FF6A00]/20">
                            Ver detalle
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
