import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Heart,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Wrench,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { getMarketplaceOffer } from "./api";

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function ProductDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["marketplace-offer", id],
    queryFn: () => getMarketplaceOffer(id),
    enabled: Boolean(id),
  });

  const productImages = useMemo(() => {
    if (!product) return [] as string[];
    if (product.images.length > 0) return product.images;
    if (product.image) return [product.image];
    return [];
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center text-gray-500">
          <Loader2 size={42} className="animate-spin text-[#FF6A00] mx-auto mb-4" />
          <p className="font-semibold">Cargando publicación real del marketplace...</p>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white border border-red-100 rounded-2xl p-8 text-red-500">
          <AlertCircle size={42} className="mx-auto mb-4" />
          <p className="text-lg font-semibold">No se pudo cargar esta publicación</p>
          <p className="text-sm text-red-400 mt-2">Verifica que el backend responda en `/api/marketplace/offers/:id`.</p>
          <Link to="/shop" className="inline-flex mt-5 px-5 py-2.5 rounded-xl bg-[#FF6A00] text-white font-semibold">
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const averageRating = product.reviews > 0 ? product.rating.toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex items-center gap-3 text-sm mb-6 text-gray-500">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-[#FF6A00] transition-colors">
            <ArrowLeft size={16} /> Volver
          </button>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#FF6A00] transition-colors">Catálogo</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-xs">{product.title}</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 p-6 flex flex-col-reverse sm:flex-row gap-4 border-b lg:border-b-0 lg:border-r border-gray-100">
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 shrink-0">
              {productImages.length > 0 ? productImages.map((image, index) => (
                <button
                  key={image}
                  onClick={() => setActiveImage(index)}
                  className={cn(
                    "w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0",
                    activeImage === index ? "border-[#FF6A00] opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={image} alt={`Vista ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              )) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center border border-slate-200 shrink-0">
                  {product.type === "service" ? <Wrench size={20} /> : <Package size={20} />}
                </div>
              )}
            </div>

            <div className="flex-1 bg-gray-50 rounded-2xl overflow-hidden aspect-square flex items-center justify-center relative">
              {productImages[activeImage] ? (
                <img src={productImages[activeImage]} alt={product.title} className="max-w-full max-h-full object-contain p-4" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  {product.type === "service" ? <Wrench size={64} /> : <Package size={64} />}
                </div>
              )}
              <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition-colors">
                <Heart size={20} />
              </button>
            </div>
          </div>

          <div className="w-full lg:w-1/2 p-6 md:p-10 flex flex-col">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-semibold mb-3">
                <span className={cn(
                  "px-2.5 py-1 rounded-full",
                  product.type === "product" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                )}>
                  {product.type === "product" ? "Producto" : "Servicio"}
                </span>
                <span className="text-gray-400">SKU: {product.sku}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-3">{product.title}</h1>
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((index) => (
                    <Star key={index} size={14} className={index <= Math.round(product.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                  ))}
                  <span className="text-gray-900 font-semibold ml-1">{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">{product.reviews} calificaciones</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500 flex items-center gap-1"><Share2 size={14} /> Compartir</span>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-[#FF6A00]">{formatUsd(product.price)}</span>
                <span className="text-gray-500 font-medium mb-1">{product.currency}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Precio obtenido desde el API del marketplace.</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                {product.type === "product" && (
                  <div className="w-full sm:w-32">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Cantidad</label>
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden h-12">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors font-bold text-lg">-</button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                        className="flex-1 w-full text-center font-bold text-gray-900 border-x border-gray-200 h-full focus:outline-none"
                      />
                      <button
                        onClick={() => setQuantity(product.stock ? Math.min(product.stock, quantity + 1) : quantity + 1)}
                        className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors font-bold text-lg"
                      >+
                      </button>
                    </div>
                    {product.stock !== null && <p className="text-[11px] text-gray-500 mt-1.5 text-center">({product.stock} disponibles)</p>}
                  </div>
                )}

                <button className="flex-1 w-full h-12 bg-[#FF6A00] text-white font-bold rounded-xl shadow-md shadow-[#FF6A00]/20 hover:bg-[#e65f00] transition-colors flex items-center justify-center gap-2">
                  <ShoppingBag size={18} />
                  {product.type === "product" ? "Agregar al Carrito" : "Solicitar Cotización"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-2">
                  <ShieldCheck size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Compra Protegida</p>
                    <p className="text-[10px] text-gray-500">Oferta cargada desde el marketplace real.</p>
                  </div>
                </div>
                {product.type === "product" ? (
                  <div className="flex items-start gap-2">
                    <Truck size={18} className="text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">Despacho sujeto al proveedor</p>
                      <p className="text-[10px] text-gray-500">Confirma cobertura y tiempos antes de cerrar la compra.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <RotateCcw size={18} className="text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">Coordinación directa</p>
                      <p className="text-[10px] text-gray-500">El alcance y disponibilidad se validan con el oferente.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-auto">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Información del Vendedor</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
                  <Building2 size={20} className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm flex items-center gap-1">
                    {product.seller} {product.sellerId && <CheckCircle2 size={14} className="text-blue-500" />}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={12} /> {product.location ?? "Ubicación por confirmar"}
                  </p>
                </div>
                <Link to="/directory" className="text-xs font-bold text-[#FF6A00] hover:underline">Ver directorio</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">Descripción del {product.type === "product" ? "Producto" : "Servicio"}</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">Características</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Categoría</span>
                <span className="font-semibold text-gray-900">{product.category}</span>
              </li>
              <li className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Tipo</span>
                <span className="font-semibold text-gray-900">{product.type === "product" ? "Producto" : "Servicio"}</span>
              </li>
              <li className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Moneda</span>
                <span className="font-semibold text-gray-900">{product.currency}</span>
              </li>
              {product.unit && (
                <li className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Unidad</span>
                  <span className="font-semibold text-gray-900">{product.unit}</span>
                </li>
              )}
              {product.stock !== null && (
                <li className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Disponibilidad</span>
                  <span className="font-semibold text-emerald-600">{product.stock} disponibles</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-8 flex items-center gap-2">
            <MessageSquare size={24} className="text-[#FF6A00]" />
            Calificaciones y Reseñas
          </h2>

          <div className="flex flex-col md:flex-row gap-8 pb-8 mb-8 border-b border-gray-100">
            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-8 min-w-[160px]">
              <span className="text-6xl font-black text-[#FF6A00]">{averageRating}</span>
              <div className="flex gap-0.5 my-2">
                {[1, 2, 3, 4, 5].map((index) => (
                  <Star key={index} size={18} className={index <= Math.round(product.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                ))}
              </div>
              <span className="text-xs text-gray-500">{product.reviews} reseñas</span>
            </div>

            <div className="flex-1 flex items-center">
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 w-full">
                <p className="text-sm font-semibold text-gray-900 mb-2">Reseñas reales pendientes de publicación</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Esta vista ya consume el API real del marketplace. Cuando existan reseñas persistidas en backend, se mostrarán aquí sin volver a usar datos mock ni estado local simulado.
                </p>
              </div>
            </div>
          </div>

          <p className="text-gray-400 text-sm text-center py-4">Aún no hay reseñas publicadas para esta oferta.</p>
        </div>
      </div>
    </div>
  );
}
