import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { 
  Star, ShoppingBag, ArrowLeft, Heart, Share2, 
  ShieldCheck, Truck, RotateCcw, Building2, MapPin, CheckCircle2,
  ThumbsUp, MessageSquare, Send
} from "lucide-react";
import { cn } from "@/utils/cn";

interface IReview {
  id: number;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
  productId: number;
}

const MOCK_REVIEWS: IReview[] = [
  { id: 1, productId: 1, author: "Carlos Medina", avatar: "https://picsum.photos/seed/u1/80/80", rating: 5, date: "2026-04-15", comment: "Excelente calidad, el cemento llegó en perfectas condiciones y el rendimiento es superior al esperado. Definitivamente volvería a comprar.", helpful: 12 },
  { id: 2, productId: 1, author: "María González", avatar: "https://picsum.photos/seed/u2/80/80", rating: 4, date: "2026-04-10", comment: "Buen producto, cumple con lo prometido. El despacho fue rápido. Solo le bajo una estrella porque el saco llegó un poco húmedo.", helpful: 5 },
  { id: 3, productId: 1, author: "José Ramírez", avatar: "https://picsum.photos/seed/u3/80/80", rating: 5, date: "2026-03-28", comment: "Uso este cemento en todos mis proyectos. Nunca falla. El proveedor responde rápido y el producto llega a tiempo.", helpful: 8 },
  { id: 4, productId: 2, author: "Ana Flores", avatar: "https://picsum.photos/seed/u4/80/80", rating: 5, date: "2026-04-20", comment: "La retroexcavadora llegó en perfecto estado y el operador fue muy profesional. Terminamos el trabajo en menos tiempo de lo estimado.", helpful: 7 },
  { id: 5, productId: 3, author: "Luis Torres", avatar: "https://picsum.photos/seed/u5/80/80", rating: 5, date: "2026-04-18", comment: "Servicio de topografía excelente. Los planos quedaron perfectos y el tiempo de entrega fue el prometido.", helpful: 3 },
  { id: 6, productId: 4, author: "Roberto Pérez", avatar: "https://picsum.photos/seed/u6/80/80", rating: 4, date: "2026-04-05", comment: "Las cabillas son de buena calidad y el peso es el correcto. Buen proveedor.", helpful: 6 },
];

// We use the same mock data for consistency
const MOCK_PRODUCTS = [
  { id: 1, title: "Cemento Gris Portland Tipo I (Saco 42.5kg)", price: 8.50, currency: "USD", image: "https://picsum.photos/seed/cemento/800/800", images: ["https://picsum.photos/seed/cemento/800/800", "https://picsum.photos/seed/cem2/800/800", "https://picsum.photos/seed/cem3/800/800"], category: "Materiales", type: "product", seller: "Materiales Los Andes", sellerRating: 4.8, rating: 4.8, reviews: 134, stock: 500, sku: "CEM-PORT-01", description: "Cemento gris de uso general Tipo I, ideal para la elaboración de concretos y morteros. Alta resistencia inicial y final. Saco de 42.5 kg.", location: "Caracas, Distrito Capital" },
  { id: 2, title: "Alquiler de Retroexcavadora CAT 420F (Por día)", price: 150.00, currency: "USD", image: "https://picsum.photos/seed/cat/800/800", images: ["https://picsum.photos/seed/cat/800/800", "https://picsum.photos/seed/cat2/800/800"], category: "Maquinaria", type: "service", seller: "Equipos y Maquinarias C.A.", sellerRating: 4.7, rating: 4.7, reviews: 32, stock: null, sku: "SRV-RET-CAT420", description: "Servicio de alquiler de retroexcavadora Caterpillar modelo 420F. Incluye operador capacitado. El combustible y traslado se cotizan por separado según la zona de la obra.", location: "Valencia, Carabobo" },
  { id: 3, title: "Servicio de Topografía y Levantamiento", price: 200.00, currency: "USD", image: "https://picsum.photos/seed/topo/800/800", images: ["https://picsum.photos/seed/topo/800/800"], category: "Servicios", type: "service", seller: "Ingeniería Total S.A.", sellerRating: 4.9, rating: 4.9, reviews: 19, stock: null, sku: "SRV-TOP-01", description: "Levantamiento topográfico planialtimétrico, replanteo de obras, cálculo de volúmenes de movimiento de tierra y generación de planos As-Built.", location: "Maracay, Aragua" },
  { id: 4, title: "Cabillas de 1/2 pulgada (Barra 6m)", price: 6.20, currency: "USD", image: "https://picsum.photos/seed/acero/800/800", images: ["https://picsum.photos/seed/acero/800/800", "https://picsum.photos/seed/acero2/800/800"], category: "Materiales", type: "product", seller: "AceroCenter C.A.", sellerRating: 4.9, rating: 4.9, reviews: 87, stock: 2400, sku: "CAB-12-6M", description: "Acero de refuerzo corrugado grado 60 de 1/2 pulgada. Longitud estándar de 6 metros. Cumple con normas COVENIN para estructuras de concreto armado.", location: "Guarenas, Miranda" }
];

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = MOCK_PRODUCTS.find(p => p.id === Number(id)) || MOCK_PRODUCTS[0]; // fallback
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [reviews, setReviews] = useState<IReview[]>(MOCK_REVIEWS);
  const [helpfulClicked, setHelpfulClicked] = useState<Set<number>>(new Set());

  const productReviews = reviews.filter(r => r.productId === product.id);
  const avgRating = productReviews.length ? (productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length).toFixed(1) : product.rating.toFixed(1);
  const ratingCounts = [5,4,3,2,1].map(s => ({ star: s, count: productReviews.filter(r => r.rating === s).length }));

  const handleSubmitReview = () => {
    if (!newRating || !newComment.trim()) return;
    const review: IReview = {
      id: Date.now(), productId: product.id,
      author: "Tú", avatar: "https://picsum.photos/seed/me/80/80",
      rating: newRating, date: new Date().toISOString().split('T')[0],
      comment: newComment.trim(), helpful: 0
    };
    setReviews(prev => [review, ...prev]);
    setNewRating(0); setNewComment("");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Breadcrumb & Back */}
        <div className="flex items-center gap-3 text-sm mb-6 text-gray-500">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-[#FF6A00] transition-colors">
            <ArrowLeft size={16} /> Volver
          </button>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#FF6A00] transition-colors">Catálogo</Link>
          <span>/</span>
          <Link to={`/shop?category=${product.category}`} className="hover:text-[#FF6A00] transition-colors">{product.category}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-xs">{product.title}</span>
        </div>

        {/* Main Product Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left: Images */}
          <div className="w-full lg:w-1/2 p-6 flex flex-col-reverse sm:flex-row gap-4 border-b lg:border-b-0 lg:border-r border-gray-100">
            {/* Thumbnails */}
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 shrink-0">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    "w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0",
                    activeImage === idx ? "border-[#FF6A00] opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            {/* Main Image */}
            <div className="flex-1 bg-gray-50 rounded-2xl overflow-hidden aspect-square flex items-center justify-center relative">
              <img src={product.images[activeImage]} alt={product.title} className="max-w-full max-h-full object-contain p-4" />
              <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition-colors">
                <Heart size={20} />
              </button>
            </div>
          </div>

          {/* Right: Info & Buy Box */}
          <div className="w-full lg:w-1/2 p-6 md:p-10 flex flex-col">
            {/* Header Info */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-semibold mb-3">
                <span className={cn(
                  "px-2.5 py-1 rounded-full",
                  product.type === "product" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                )}>
                  {product.type === "product" ? "Producto Nuevo" : "Servicio"}
                </span>
                <span className="text-gray-400">SKU: {product.sku}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-3">
                {product.title}
              </h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={14} className={i <= Math.round(product.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                  ))}
                  <span className="text-gray-900 font-semibold ml-1">{product.rating}</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500 hover:text-[#FF6A00] cursor-pointer transition-colors">{product.reviews} calificaciones</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500 flex items-center gap-1"><Share2 size={14}/> Compartir</span>
              </div>
            </div>

            {/* Price section */}
            <div className="mb-8">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-[#FF6A00]">${product.price.toFixed(2)}</span>
                <span className="text-gray-500 font-medium mb-1">{product.currency}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Precio no incluye IVA.</p>
            </div>

            {/* Buy Form */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                {product.type === "product" && (
                  <div className="w-full sm:w-32">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Cantidad</label>
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden h-12">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors font-bold text-lg"
                      >−</button>
                      <input 
                        type="number" 
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                        className="flex-1 w-full text-center font-bold text-gray-900 border-x border-gray-200 h-full focus:outline-none"
                      />
                      <button 
                        onClick={() => setQuantity(product.stock ? Math.min(product.stock, quantity + 1) : quantity + 1)}
                        className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors font-bold text-lg"
                      >+</button>
                    </div>
                    {product.stock && <p className="text-[11px] text-gray-500 mt-1.5 text-center">({product.stock} disponibles)</p>}
                  </div>
                )}
                
                <button className="flex-1 w-full h-12 bg-[#FF6A00] text-white font-bold rounded-xl shadow-md shadow-[#FF6A00]/20 hover:bg-[#e65f00] transition-colors flex items-center justify-center gap-2">
                  <ShoppingBag size={18} /> 
                  {product.type === "product" ? "Agregar al Carrito" : "Solicitar Cotización"}
                </button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-2">
                  <ShieldCheck size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Compra Protegida</p>
                    <p className="text-[10px] text-gray-500">Garantía LULOWinNG sobre tu dinero.</p>
                  </div>
                </div>
                {product.type === "product" ? (
                  <div className="flex items-start gap-2">
                    <Truck size={18} className="text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">Envíos a Nivel Nacional</p>
                      <p className="text-[10px] text-gray-500">Calculado en el checkout.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <RotateCcw size={18} className="text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">Reembolso Garantizado</p>
                      <p className="text-[10px] text-gray-500">Si no se presta el servicio.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Seller Info */}
            <div className="mt-auto">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Información del Vendedor</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
                  <Building2 size={20} className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm flex items-center gap-1">
                    {product.seller} <CheckCircle2 size={14} className="text-blue-500" />
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={12} /> {product.location}
                  </p>
                </div>
                <Link to="/directory" className="text-xs font-bold text-[#FF6A00] hover:underline">Ver perfil</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Details Specs */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">Descripción del {product.type === "product" ? "Producto" : "Servicio"}</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
              {product.description}
              <br/><br/>
              Asegúrese de verificar la disponibilidad de traslado para grandes volúmenes. Todos los materiales cumplen con las normativas vigentes para el territorio nacional. Si requiere especificaciones técnicas en formato PDF, puede solicitarlas directamente al vendedor en el momento de la cotización.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">Características</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Categoría</span>
                <span className="font-semibold text-gray-900">{product.category}</span>
              </li>
              <li className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Condición</span>
                <span className="font-semibold text-gray-900">{product.type === "product" ? "Nuevo" : "Servicio"}</span>
              </li>
              <li className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Moneda</span>
                <span className="font-semibold text-gray-900">{product.currency}</span>
              </li>
              {product.stock && (
                <li className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Disponibilidad</span>
                  <span className="font-semibold text-emerald-600">En stock</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* ── Reviews Section ── */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-8 flex items-center gap-2">
            <MessageSquare size={24} className="text-[#FF6A00]" />
            Calificaciones y Reseñas
          </h2>

          {/* Rating Summary */}
          <div className="flex flex-col md:flex-row gap-8 pb-8 mb-8 border-b border-gray-100">
            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-8 min-w-[160px]">
              <span className="text-6xl font-black text-[#FF6A00]">{avgRating}</span>
              <div className="flex gap-0.5 my-2">
                {[1,2,3,4,5].map(i => <Star key={i} size={18} className={i <= Math.round(Number(avgRating)) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />)}
              </div>
              <span className="text-xs text-gray-500">{productReviews.length} reseñas</span>
            </div>
            <div className="flex-1 space-y-2">
              {ratingCounts.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-4 text-right font-semibold text-gray-700">{star}</span>
                  <Star size={13} className="text-amber-400 fill-amber-400 shrink-0" />
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: productReviews.length ? `${(count / productReviews.length) * 100}%` : '0%' }} />
                  </div>
                  <span className="text-gray-400 w-4 text-left">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review List */}
          <div className="space-y-6 mb-10">
            {productReviews.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Aún no hay reseñas. ¡Sé el primero!</p>
            ) : productReviews.map(review => (
              <div key={review.id} className="flex gap-4 pb-6 border-b border-gray-50 last:border-0">
                <img src={review.avatar} alt={review.author} className="w-10 h-10 rounded-full object-cover shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="font-bold text-gray-900 text-sm">{review.author}</p>
                    <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString('es-VE', { year:'numeric', month:'long', day:'numeric' })}</span>
                  </div>
                  <div className="flex gap-0.5 my-1">
                    {[1,2,3,4,5].map(i => <Star key={i} size={13} className={i <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />)}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                  <button
                    onClick={() => { if (!helpfulClicked.has(review.id)) { setHelpfulClicked(prev => new Set([...prev, review.id])); } }}
                    className={cn("mt-3 flex items-center gap-1.5 text-xs font-medium transition-colors", helpfulClicked.has(review.id) ? "text-[#FF6A00]" : "text-gray-400 hover:text-gray-700")}
                  >
                    <ThumbsUp size={13} /> Útil ({review.helpful + (helpfulClicked.has(review.id) ? 1 : 0)})
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Review Form */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Escribe tu reseña</h3>
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2 font-medium">Tu calificación</p>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <button key={i} onMouseEnter={() => setHoverRating(i)} onMouseLeave={() => setHoverRating(0)} onClick={() => setNewRating(i)}>
                    <Star size={28} className={cn("transition-colors", i <= (hoverRating || newRating) ? "text-amber-400 fill-amber-400" : "text-gray-300")} />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Comparte tu experiencia con este producto o servicio..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#FF6A00]/30 focus:border-[#FF6A00] outline-none resize-none mb-4"
            />
            <button
              onClick={handleSubmitReview}
              disabled={!newRating || !newComment.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-[#FF6A00] text-white font-bold rounded-xl hover:bg-[#e65f00] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#FF6A00]/20"
            >
              <Send size={16} /> Publicar Reseña
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

