import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Loader2,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  TrendingDown,
  Users,
  Wrench,
} from "lucide-react";
import { getMarketplaceContractors, getMarketplaceOffers } from "./api";

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function OfferMedia({ image, type }: { image: string | null; type: "product" | "service" }) {
  if (image) {
    return <img src={image} alt="Oferta" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />;
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500">
      {type === "service" ? <Wrench size={42} /> : <Package size={42} />}
    </div>
  );
}

export function StorefrontPage() {
  const { data: offersData, isLoading: loadingOffers } = useQuery({
    queryKey: ["marketplace-featured-offers"],
    queryFn: () => getMarketplaceOffers({ featured: true, limit: 4 }),
  });

  const { data: contractorsData, isLoading: loadingContractors } = useQuery({
    queryKey: ["marketplace-featured-contractors"],
    queryFn: () => getMarketplaceContractors(),
  });

  const featuredProducts = offersData?.data ?? [];
  const featuredContractors = useMemo(() => (contractorsData?.data ?? []).slice(0, 3), [contractorsData]);

  return (
    <div className="flex flex-col">
      <section className="relative h-[500px] md:h-[580px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1541888086225-f64a13217d84?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Construction Site"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 w-full text-white">
          <div className="max-w-2xl space-y-6">
            <p className="text-[#FF6A00] font-bold tracking-widest text-sm uppercase">CONECTANDO CONTRATISTAS Y PROVEEDORES</p>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Compra y vende <br />
              <span className="text-gray-300">Materiales y Servicios</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 font-medium max-w-xl">
              El marketplace ya consume datos reales desde el API y publica oferta viva del ecosistema Lulo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/shop" className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center gap-2">
                <Search size={20} /> Explorar Catálogo
              </Link>
              <Link to="/register" className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-colors flex items-center justify-center">
                Quiero Vender
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 md:px-8 relative z-20 -mt-8 w-full">
        <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Buscar materiales, equipos o contratistas..." className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[#FF6A00] outline-none text-gray-900 font-medium" />
          </div>
          <select className="w-full md:w-64 py-4 px-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[#FF6A00] outline-none text-gray-700 font-medium cursor-pointer">
            <option value="">Todas las Categorías</option>
            <option value="materiales">Materiales</option>
            <option value="maquinaria">Maquinaria</option>
            <option value="mano-de-obra">Servicios / Mano de obra</option>
          </select>
          <Link to="/shop" className="w-full md:w-auto px-8 py-4 bg-[#FF6A00] text-white font-bold rounded-xl hover:bg-[#e65f00] transition-colors flex justify-center">
            Buscar
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative rounded-3xl overflow-hidden h-64 group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Equipos" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
              <span className="bg-[#FF6A00] text-white text-xs font-bold px-3 py-1 rounded-full w-max mb-3">API EN VIVO</span>
              <h3 className="text-2xl font-bold text-white mb-2">Catálogo conectado</h3>
              <p className="text-gray-300 text-sm mb-4">Las ofertas visibles ya salen de la base de datos del backend.</p>
              <div className="flex items-center text-[#FF6A00] font-bold text-sm">Ver catálogo <ArrowRight size={16} className="ml-1" /></div>
            </div>
          </div>
          <div className="relative rounded-3xl overflow-hidden h-64 group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Materiales" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
              <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full w-max mb-3">DIRECTORIO REAL</span>
              <h3 className="text-2xl font-bold text-white mb-2">Contratistas públicos</h3>
              <p className="text-gray-300 text-sm mb-4">Empresas visibles en marketplace cargadas desde la API.</p>
              <div className="flex items-center text-blue-400 font-bold text-sm">Explorar directorio <ArrowRight size={16} className="ml-1" /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Productos y Servicios Destacados</h2>
              <p className="text-gray-600">Publicaciones obtenidas en tiempo real desde el backend.</p>
            </div>
            <Link to="/shop" className="hidden md:flex items-center text-[#FF6A00] font-bold hover:underline">Ver todo <ChevronRight size={20} /></Link>
          </div>
          {loadingOffers ? (
            <div className="flex items-center justify-center py-16 text-gray-500 gap-3">
              <Loader2 className="animate-spin text-[#FF6A00]" /> Cargando ofertas...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer">
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-bold px-2.5 py-1 rounded text-gray-800 z-10 shadow-sm">{product.category}</span>
                    <OfferMedia image={product.image} type={product.type} />
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-gray-500 mb-1">{product.seller}</p>
                    <h3 className="font-bold text-gray-900 leading-tight mb-3 line-clamp-2">{product.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-[#FF6A00]">{formatUsd(product.price)}</span>
                      <span className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-900 group-hover:bg-[#FF6A00] group-hover:text-white group-hover:border-[#FF6A00] transition-colors">
                        <ShoppingBag size={18} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Contratistas Principales</h2>
              <p className="text-gray-600">Empresas públicas y verificables cargadas desde el API.</p>
            </div>
            <Link to="/directory" className="hidden md:flex items-center text-[#FF6A00] font-bold hover:underline">
              Ver directorio <ChevronRight size={20} />
            </Link>
          </div>
          {loadingContractors ? (
            <div className="flex items-center justify-center py-16 text-gray-500 gap-3">
              <Loader2 className="animate-spin text-[#FF6A00]" /> Cargando contratistas...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredContractors.map((contractor) => (
                <Link key={contractor.id} to="/directory" className="flex flex-col rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow group cursor-pointer">
                  <div className="h-32 bg-gray-200 relative">
                    {contractor.logo ? (
                      <img src={contractor.logo} alt={contractor.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white">
                        <Building2 size={42} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  </div>
                  <div className="p-6 bg-white relative pt-12">
                    <div className="absolute -top-10 left-6 w-20 h-20 bg-white rounded-xl shadow-md border border-gray-100 flex items-center justify-center overflow-hidden">
                      {contractor.logo ? (
                        <img src={contractor.logo} alt={contractor.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={32} className="text-gray-400" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{contractor.nombre}</h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{contractor.especialidades?.join(", ") || contractor.descripcionPublica || "Perfil público de empresa"}</p>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                      <Star size={16} fill="currentColor" /> {Number(contractor.rating ?? 0).toFixed(1)} <span className="text-gray-400 font-normal ml-1">(Marketplace)</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">¿Por qué usar el Marketplace de LULOWinNG?</h2>
            <p className="text-gray-400">Ahora con catálogo y directorio alimentados por el backend real.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-[#FF6A00]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#FF6A00]">
                <TrendingDown size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Precios reales</h3>
              <p className="text-gray-400 text-sm">Las publicaciones visibles ya no salen de mocks locales sino de la API conectada.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-400">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Perfiles públicos</h3>
              <p className="text-gray-400 text-sm">El directorio muestra compañías expuestas desde el backend y listas para ser consultadas.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-400">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Base lista para crecer</h3>
              <p className="text-gray-400 text-sm">El frontend ya quedó desacoplado de mocks y preparado para más endpoints del marketplace.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
