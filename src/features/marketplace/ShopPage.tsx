import { useState, useMemo } from "react";
import { Link } from "react-router";
import {
  Search, SlidersHorizontal, ShoppingBag, Star, ChevronDown,
  X, Grid3X3, List, Tag, Package, Wrench, Filter
} from "lucide-react";
import { cn } from "@/utils/cn";

interface IProduct {
  id: number;
  title: string;
  price: number;
  currency: string;
  image: string;
  category: string;
  type: "product" | "service";
  seller: string;
  rating: number;
  reviews: number;
  stock: number | null;
  badge?: string;
}

const ALL_PRODUCTS: IProduct[] = [
  { id: 1, title: "Cemento Gris Portland Tipo I (Saco 42.5kg)", price: 8.50, currency: "USD", image: "https://picsum.photos/seed/cem1/400/400", category: "Cementos", type: "product", seller: "Materiales Los Andes", rating: 4.8, reviews: 134, stock: 500, badge: "Más vendido" },
  { id: 2, title: "Cabilla Corrugada 1/2\" × 6m (Barra)", price: 6.20, currency: "USD", image: "https://picsum.photos/seed/cab1/400/400", category: "Aceros", type: "product", seller: "AceroCenter C.A.", rating: 4.9, reviews: 87, stock: 2400 },
  { id: 3, title: "Arena Lavada (Metro Cúbico)", price: 18.00, currency: "USD", image: "https://picsum.photos/seed/are1/400/400", category: "Agregados", type: "product", seller: "Agregados del Sur", rating: 4.5, reviews: 45, stock: 120 },
  { id: 4, title: "Bloque 15×20×40 cm (Unidad)", price: 0.80, currency: "USD", image: "https://picsum.photos/seed/blq1/400/400", category: "Bloques", type: "product", seller: "Bloques El Constructor", rating: 4.6, reviews: 210, stock: 8000 },
  { id: 5, title: "Alquiler Retroexcavadora CAT 420F (Día)", price: 150.00, currency: "USD", image: "https://picsum.photos/seed/cat1/400/400", category: "Maquinaria", type: "service", seller: "Equipos y Maquinarias C.A.", rating: 4.7, reviews: 32, stock: null, badge: "Disponible" },
  { id: 6, title: "Servicio Topografía y Levantamiento de Planos", price: 200.00, currency: "USD", image: "https://picsum.photos/seed/top1/400/400", category: "Ingeniería", type: "service", seller: "Ingeniería Total S.A.", rating: 4.9, reviews: 19, stock: null },
  { id: 7, title: "Cabilla Lisa 3/8\" × 6m (Barra)", price: 4.50, currency: "USD", image: "https://picsum.photos/seed/cab2/400/400", category: "Aceros", type: "product", seller: "AceroCenter C.A.", rating: 4.7, reviews: 63, stock: 1800 },
  { id: 8, title: "Pintura Caucho Interior Blanco (Galón 3.8L)", price: 12.00, currency: "USD", image: "https://picsum.photos/seed/pin1/400/400", category: "Pinturas", type: "product", seller: "Pinturas Royal", rating: 4.4, reviews: 78, stock: 340 },
  { id: 9, title: "Tubería PVC Sanitaria 4\" × 6m", price: 22.00, currency: "USD", image: "https://picsum.photos/seed/tub1/400/400", category: "Plomería", type: "product", seller: "Plásticos Nacionales", rating: 4.6, reviews: 41, stock: 190 },
  { id: 10, title: "Instalación Eléctrica Residencial (Por punto)", price: 35.00, currency: "USD", image: "https://picsum.photos/seed/ele1/400/400", category: "Electricidad", type: "service", seller: "Instalaciones Pro", rating: 4.8, reviews: 55, stock: null },
  { id: 11, title: "Cerámica 40×40 Rústica (M²)", price: 14.00, currency: "USD", image: "https://picsum.photos/seed/cer1/400/400", category: "Revestimientos", type: "product", seller: "Cerámicas Italianas", rating: 4.5, reviews: 89, stock: 450 },
  { id: 12, title: "Alquiler Andamio Multidireccional (Semana)", price: 80.00, currency: "USD", image: "https://picsum.photos/seed/and1/400/400", category: "Maquinaria", type: "service", seller: "Andamios Express", rating: 4.3, reviews: 24, stock: null, badge: "Nuevo" },
];

const CATEGORIES = ["Todos", "Cementos", "Aceros", "Agregados", "Bloques", "Maquinaria", "Ingeniería", "Pinturas", "Plomería", "Electricidad", "Revestimientos"];
const SORT_OPTIONS = [
  { id: "relevance", label: "Relevancia" },
  { id: "price_asc", label: "Precio: Menor a Mayor" },
  { id: "price_desc", label: "Precio: Mayor a Menor" },
  { id: "rating", label: "Mejor Calificados" },
];

export function ShopPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [type, setType] = useState<"all" | "product" | "service">("all");
  const [priceMax, setPriceMax] = useState(500);
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = ALL_PRODUCTS.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.seller.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "Todos" || p.category === category;
      const matchType = type === "all" || p.type === type;
      const matchPrice = p.price <= priceMax;
      return matchSearch && matchCat && matchType && matchPrice;
    });

    if (sortBy === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === "rating") list = [...list].sort((a, b) => b.rating - a.rating);

    return list;
  }, [search, category, type, priceMax, sortBy]);

  const FilterSidebar = () => (
    <aside className="w-full space-y-6">
      {/* Type */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 mb-3">Tipo de oferta</h3>
        <div className="space-y-2">
          {[
            { id: "all", label: "Todos", icon: Grid3X3 },
            { id: "product", label: "Productos", icon: Package },
            { id: "service", label: "Servicios", icon: Wrench },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setType(t.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                type === t.id
                  ? "bg-[#FF6A00] text-white shadow-md shadow-[#FF6A00]/20"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 mb-3">Categoría</h3>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                category === cat
                  ? "bg-orange-50 text-[#FF6A00] font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 mb-1">Precio máximo</h3>
        <p className="text-2xl font-black text-[#FF6A00] mb-4">
          ${priceMax.toLocaleString()}
        </p>
        <input
          type="range"
          min={1}
          max={500}
          value={priceMax}
          onChange={e => setPriceMax(Number(e.target.value))}
          className="w-full accent-[#FF6A00]"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>$1</span><span>$500</span>
        </div>
      </div>

      {/* Reset */}
      {(category !== "Todos" || type !== "all" || priceMax < 500 || search) && (
        <button
          onClick={() => { setCategory("Todos"); setType("all"); setPriceMax(500); setSearch(""); }}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-gray-500 hover:text-red-500 border border-gray-200 rounded-xl transition-colors"
        >
          <X size={14} /> Limpiar filtros
        </button>
      )}
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-gray-900">Catálogo de Productos y Servicios</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {filtered.length} resultados{category !== "Todos" && ` en ${category}`}
              </p>
            </div>

            {/* Search */}
            <div className="w-full md:w-96 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
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
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            <FilterSidebar />
          </div>

          {/* Products Area */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm"
              >
                <Filter size={16} /> Filtros
              </button>

              <div className="flex items-center gap-3 ml-auto">
                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[#FF6A00]/30 outline-none cursor-pointer shadow-sm"
                  >
                    {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* View toggle */}
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

            {/* Mobile Filters Panel */}
            {showMobileFilters && (
              <div className="lg:hidden mb-6 animate-in slide-in-from-top-4 duration-300">
                <FilterSidebar />
              </div>
            )}

            {/* Product Grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center text-gray-400 gap-4">
                <Package size={56} className="opacity-20" />
                <p className="text-xl font-bold text-gray-500">Sin resultados</p>
                <p className="text-sm">Intenta cambiar los filtros o el término de búsqueda.</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map(product => (
                  <Link key={product.id} to={`/product/${product.id}`} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col">
                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                      {product.badge && (
                        <span className="absolute top-3 left-3 z-10 bg-[#FF6A00] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                          {product.badge}
                        </span>
                      )}
                      <span className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur text-xs font-bold px-2.5 py-1 rounded-full text-gray-700 shadow flex items-center gap-1">
                        {product.type === "service" ? <Wrench size={10} /> : <Package size={10} />}
                        {product.type === "service" ? "Servicio" : "Producto"}
                      </span>
                      <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-xs text-gray-400 mb-1 truncate">{product.seller}</p>
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 flex-1">{product.title}</h3>
                      <div className="flex items-center gap-1 mb-3">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} size={11} className={i <= Math.round(product.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                        ))}
                        <span className="text-xs text-gray-400 ml-1">({product.reviews})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-black text-[#FF6A00]">${product.price.toFixed(2)}</span>
                          <span className="text-xs text-gray-400 ml-1">{product.currency}</span>
                        </div>
                        <span className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-[#FF6A00] group-hover:text-white group-hover:border-[#FF6A00] transition-all shadow-sm">
                          <ShoppingBag size={16} />
                        </span>
                      </div>
                      {product.stock !== null && (
                        <p className="text-[11px] text-emerald-600 font-medium mt-2">✓ {product.stock} en stock</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map(product => (
                  <Link key={product.id} to={`/product/${product.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer flex gap-5 p-4">
                    <div className="w-28 h-28 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                      <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-xs text-gray-400 mb-0.5">{product.seller}</p>
                          <h3 className="font-bold text-gray-900 leading-snug mb-1">{product.title}</h3>
                          <div className="flex items-center gap-1 mb-1">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} size={11} className={i <= Math.round(product.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                            ))}
                            <span className="text-xs text-gray-400 ml-1">({product.reviews} reseñas)</span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                            <Tag size={10} /> {product.category}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-2xl font-black text-[#FF6A00]">${product.price.toFixed(2)}</p>
                          <p className="text-xs text-gray-400">{product.currency}</p>
                          {product.stock !== null && <p className="text-xs text-emerald-600 font-medium mt-1">✓ En stock</p>}
                          <span className="mt-3 inline-block px-5 py-2 bg-[#FF6A00] text-white text-sm font-bold rounded-xl hover:bg-[#e65f00] transition-colors shadow-md shadow-[#FF6A00]/20">
                            Ver Detalle
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
