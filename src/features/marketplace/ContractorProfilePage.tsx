import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  Globe,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Star,
  Wrench,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { getMarketplaceContractor, IMarketplaceOffer } from "./api";

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function OfferImage({ offer }: { offer: IMarketplaceOffer }) {
  if (offer.image) {
    return <img src={offer.image} alt={offer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />;
  }
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500">
      {offer.type === "service" ? <Wrench size={40} /> : <Package size={40} />}
    </div>
  );
}

/** Carousel banner that cycles through gallery images as the profile header background */
function ProfileBanner({
  portada,
  gallery,
  children,
}: {
  portada?: string | null;
  gallery: string[];
  children: React.ReactNode;
}) {
  // Build the slide list: gallery images first, fall back to portada, then empty
  const slides = useMemo(() => {
    if (gallery.length > 0) return gallery;
    if (portada) return [portada];
    return [] as string[];
  }, [gallery, portada]);

  const [current, setCurrent] = useState(0);

  // Auto-advance every 4 seconds when there are multiple slides
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <div className="relative h-52 md:h-80 overflow-hidden bg-gradient-to-r from-[#FF6A00]/30 via-slate-200 to-slate-300">
      {/* Slides */}
      {slides.map((src, i) => (
        <div
          key={src}
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-opacity duration-700",
            i === current ? "opacity-100" : "opacity-0"
          )}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}

      {/* Dark gradient overlay so profile info stays readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      {/* Prev / Next arrows — only when multiple images */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm z-10"
            aria-label="Anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm z-10"
            aria-label="Siguiente"
          >
            <ChevronRight size={18} />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  i === current ? "bg-white w-4" : "bg-white/50"
                )}
                aria-label={`Ir a imagen ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Slot for content overlaid on top of banner (not used here, kept for flexibility) */}
      {children}
    </div>
  );
}

export function ContractorProfilePage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const { data: contractor, isLoading, isError } = useQuery({
    queryKey: ["marketplace-contractor", id],
    queryFn: () => getMarketplaceContractor(id),
    enabled: Boolean(id),
  });

  const gallery = useMemo(() => {
    if (!contractor) return [] as string[];
    return contractor.galeria?.filter(Boolean) ?? [];
  }, [contractor]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center text-gray-500">
          <Loader2 size={42} className="animate-spin text-[#FF6A00] mx-auto mb-4" />
          <p className="font-semibold">Cargando perfil de la tienda...</p>
        </div>
      </div>
    );
  }

  if (isError || !contractor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white border border-red-100 rounded-2xl p-8 text-red-500">
          <AlertCircle size={42} className="mx-auto mb-4" />
          <p className="text-lg font-semibold">No se pudo cargar este perfil</p>
          <Link to="/directory" className="inline-flex mt-5 px-5 py-2.5 rounded-xl bg-[#FF6A00] text-white font-semibold">
            Volver al directorio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-[#FF6A00] transition-colors">
            <ArrowLeft size={16} /> Volver
          </button>
          <span>/</span>
          <Link to="/directory" className="hover:text-[#FF6A00] transition-colors">Directorio</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{contractor.nombre}</span>
        </div>

        {/* Profile card with gallery carousel as banner */}
        <section className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          <ProfileBanner portada={contractor.portada} gallery={gallery}>
            {null}
          </ProfileBanner>

          {/* Profile info row — pulled up over the banner */}
          <div className="px-6 md:px-10 pb-8 -mt-16 md:-mt-20 relative">
            <div className="flex flex-col lg:flex-row gap-6 lg:items-end">
              {/* Logo */}
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-gray-400 shrink-0">
                {contractor.logo
                  ? <img src={contractor.logo} alt={contractor.nombre} className="w-full h-full object-cover" />
                  : <Building2 size={48} />}
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-black text-gray-900">{contractor.nombre}</h1>
                  {contractor.rncContratista && <BadgeCheck size={20} className="text-blue-500" />}
                </div>
                <p className="text-[#FF6A00] font-semibold mt-1">
                  {contractor.especialidades?.join(" • ") || "Perfil de tienda"}
                </p>
                <div className="flex items-center gap-5 mt-3 text-sm text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {contractor.estadoUbicacion || "Ubicación por confirmar"}</span>
                  <span className="flex items-center gap-1"><Star size={14} className="text-amber-400 fill-amber-400" /> {Number(contractor.rating ?? 0).toFixed(1)}</span>
                  <span>{Number(contractor.totalProyectos ?? 0)} proyectos</span>
                  {contractor.anosFundacion && <span>Desde {contractor.anosFundacion}</span>}
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex gap-3 flex-wrap">
                {contractor.telefono && (
                  <a href={`tel:${contractor.telefono}`} className="px-5 py-3 rounded-xl bg-[#FF6A00] text-white font-bold hover:bg-[#e65f00] transition-colors flex items-center gap-2">
                    <Phone size={16} /> Llamar
                  </a>
                )}
                {contractor.email && (
                  <a href={`mailto:${contractor.email}`} className="px-5 py-3 rounded-xl bg-gray-100 text-gray-900 font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
                    <Mail size={16} /> Escribir
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Body grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sobre la tienda</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {contractor.descripcionPublica || "Esta tienda todavía no ha cargado una descripción pública."}
              </p>
            </section>

            {/* Listings */}
            <section className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900">Publicaciones de la tienda</h2>
                  <p className="text-sm text-gray-500">Productos y servicios publicados por este contratista.</p>
                </div>
                <span className="text-sm font-semibold text-gray-400">
                  {contractor.listings.length} resultado{contractor.listings.length === 1 ? "" : "s"}
                </span>
              </div>

              {contractor.listings.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-400 shadow-sm">
                  <Package size={36} className="mx-auto mb-3 opacity-60" />
                  Esta tienda aún no tiene publicaciones activas.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {contractor.listings.map((offer) => (
                    <Link
                      key={offer.id}
                      to={`/product/${offer.id}`}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col"
                    >
                      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                        <span className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur text-xs font-bold px-2.5 py-1 rounded-full text-gray-700 shadow flex items-center gap-1">
                          {offer.type === "service" ? <Wrench size={10} /> : <Package size={10} />}
                          {offer.type === "service" ? "Servicio" : "Producto"}
                        </span>
                        <OfferImage offer={offer} />
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <p className="text-xs text-gray-400 mb-1 truncate">{offer.category}</p>
                        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 flex-1">{offer.title}</h3>
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((index) => (
                            <Star key={index} size={11} className={index <= Math.round(offer.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                          ))}
                          <span className="text-xs text-gray-400 ml-1">({offer.reviews})</span>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <div>
                            <span className="text-xl font-black text-[#FF6A00]">{formatUsd(offer.price)}</span>
                            <span className="text-xs text-gray-400 ml-1">{offer.currency}</span>
                          </div>
                          {offer.stock !== null && <span className="text-[11px] text-emerald-600 font-medium">{offer.stock} disponibles</span>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Datos de contacto</h2>
              <div className="space-y-4 text-sm text-gray-600">
                {contractor.telefono && <p className="flex items-start gap-2"><Phone size={16} className="mt-0.5 text-[#FF6A00]" /> {contractor.telefono}</p>}
                {contractor.email && <p className="flex items-start gap-2"><Mail size={16} className="mt-0.5 text-[#FF6A00]" /> {contractor.email}</p>}
                {contractor.direccion && <p className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 text-[#FF6A00]" /> {contractor.direccion}</p>}
                {contractor.coberturaServicio && <p className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 text-[#FF6A00]" /> Cobertura: {contractor.coberturaServicio}</p>}
                {contractor.horarioAtencion && <p className="flex items-start gap-2"><Building2 size={16} className="mt-0.5 text-[#FF6A00]" /> {contractor.horarioAtencion}</p>}
              </div>
            </section>

            <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Presencia digital</h2>
              <div className="space-y-3 text-sm">
                {contractor.sitioWeb
                  ? <a href={contractor.sitioWeb} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#FF6A00] hover:underline"><Globe size={16} /> Sitio web</a>
                  : null}
                {contractor.instagram
                  ? <a href={contractor.instagram.startsWith("http") ? contractor.instagram : `https://instagram.com/${contractor.instagram.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#FF6A00] hover:underline"><Instagram size={16} /> Instagram</a>
                  : null}
                {contractor.linkedin
                  ? <a href={contractor.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#FF6A00] hover:underline"><Linkedin size={16} /> LinkedIn</a>
                  : null}
                {!contractor.sitioWeb && !contractor.instagram && !contractor.linkedin
                  ? <p className="text-gray-400">Sin enlaces públicos todavía.</p>
                  : null}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
