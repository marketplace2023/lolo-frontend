import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  Search, SlidersHorizontal, Star, MapPin, Phone, 
  BadgeCheck, X, ChevronDown, Building2, Clock
} from "lucide-react";
import { cn } from "@/utils/cn";

// Fix leaflet default icon issue with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom orange marker
const createOrangeIcon = (active = false) =>
  L.divIcon({
    html: `
      <div style="
        width: ${active ? 44 : 36}px; 
        height: ${active ? 44 : 36}px; 
        background: ${active ? "#FF6A00" : "#1e293b"};
        border: 3px solid ${active ? "#fff" : "#FF6A00"};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: all 0.2s;
      "></div>
    `,
    className: "",
    iconSize: [active ? 44 : 36, active ? 44 : 36],
    iconAnchor: [active ? 22 : 18, active ? 44 : 36],
    popupAnchor: [0, -36],
  });

interface IContractor {
  id: number;
  name: string;
  specialty: string;
  state: string;
  lat: number;
  lng: number;
  rating: number;
  reviews: number;
  phone: string;
  verified: boolean;
  hours: string;
  category: string;
  image: string;
}

// Mock data – replace with real API call
const MOCK_CONTRACTORS: IContractor[] = [
  { id: 1, name: "Constructora Horizonte C.A.", specialty: "Obras Civiles y Vialidad", state: "Distrito Capital", lat: 10.4806, lng: -66.9036, rating: 4.8, reviews: 142, phone: "+58 212 555-0101", verified: true, hours: "Lun–Vie 8am–5pm", category: "obras_civiles", image: "https://picsum.photos/seed/h1/80/80" },
  { id: 2, name: "AceroCenter Mayorista", specialty: "Distribución de Acero y Metales", state: "Miranda", lat: 10.4200, lng: -66.8500, rating: 4.9, reviews: 89, phone: "+58 212 555-0202", verified: true, hours: "Lun–Sáb 7am–6pm", category: "materiales", image: "https://picsum.photos/seed/h2/80/80" },
  { id: 3, name: "Ingeniería Total S.A.", specialty: "Diseño Estructural y Topografía", state: "Carabobo", lat: 10.1667, lng: -68.0000, rating: 4.7, reviews: 56, phone: "+58 241 555-0303", verified: true, hours: "Lun–Vie 8am–4pm", category: "ingenieria", image: "https://picsum.photos/seed/h3/80/80" },
  { id: 4, name: "Instalaciones Eléctricas Pro", specialty: "Electricidad Industrial y Residencial", state: "Zulia", lat: 10.6666, lng: -71.6124, rating: 4.6, reviews: 33, phone: "+58 261 555-0404", verified: false, hours: "Lun–Vie 9am–5pm", category: "electricidad", image: "https://picsum.photos/seed/h4/80/80" },
  { id: 5, name: "Movimiento de Tierras JR", specialty: "Excavación y Movimiento de Tierra", state: "Lara", lat: 10.0650, lng: -69.3220, rating: 4.5, reviews: 27, phone: "+58 251 555-0505", verified: false, hours: "Lun–Sáb 7am–5pm", category: "maquinaria", image: "https://picsum.photos/seed/h5/80/80" },
  { id: 6, name: "Plomería Express C.A.", specialty: "Instalaciones Sanitarias", state: "Aragua", lat: 10.2442, lng: -67.5783, rating: 4.4, reviews: 19, phone: "+58 243 555-0606", verified: true, hours: "Lun–Vie 8am–5pm", category: "plomeria", image: "https://picsum.photos/seed/h6/80/80" },
];

const CATEGORIES = [
  { id: "", label: "Todas las categorías" },
  { id: "obras_civiles", label: "Obras Civiles" },
  { id: "materiales", label: "Materiales" },
  { id: "ingenieria", label: "Ingeniería" },
  { id: "electricidad", label: "Electricidad" },
  { id: "maquinaria", label: "Maquinaria" },
  { id: "plomeria", label: "Plomería" },
];

const STATES = [
  { id: "", label: "Todo el país" },
  { id: "Distrito Capital", label: "Distrito Capital" },
  { id: "Miranda", label: "Miranda" },
  { id: "Carabobo", label: "Carabobo" },
  { id: "Zulia", label: "Zulia" },
  { id: "Lara", label: "Lara" },
  { id: "Aragua", label: "Aragua" },
];

// Helper to pan map to selected contractor
function MapFlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 13, { duration: 1 });
  }, [lat, lng, map]);
  return null;
}

export function DirectoryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const [selected, setSelected] = useState<IContractor | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filtered = MOCK_CONTRACTORS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.specialty.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || c.category === category;
    const matchState = !state || c.state === state;
    const matchVerified = !verifiedOnly || c.verified;
    return matchSearch && matchCat && matchState && matchVerified;
  });

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 88px)" }}>
      {/* ── Top Search Bar ── */}
      <div className="bg-card border-b border-border px-4 py-3 flex flex-col md:flex-row gap-3 items-start md:items-center shrink-0">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar contratistas, empresas o especialidades..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters row */}
        <div className="flex gap-2 w-full md:w-auto flex-wrap">
          {/* Category select */}
          <div className="relative">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-background border border-border text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/30 outline-none cursor-pointer"
            >
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          {/* State select */}
          <div className="relative">
            <select
              value={state}
              onChange={e => setState(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-background border border-border text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/30 outline-none cursor-pointer"
            >
              {STATES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          {/* Verified toggle */}
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
              verifiedOnly
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <BadgeCheck size={16} /> Verificadas
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-muted-foreground hover:text-foreground transition"
          >
            <SlidersHorizontal size={16} /> Filtros
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="bg-background border-b border-border px-4 py-2 text-xs text-muted-foreground shrink-0">
        <span className="font-semibold text-foreground">{filtered.length}</span> contratistas encontrados
        {(category || state || verifiedOnly || search) && (
          <button
            onClick={() => { setSearch(""); setCategory(""); setState(""); setVerifiedOnly(false); }}
            className="ml-3 text-primary hover:underline font-medium"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* ── Main Content: Cards + Map ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Contractor Cards List */}
        <div className="w-full md:w-[380px] lg:w-[420px] shrink-0 overflow-y-auto bg-background border-r border-border">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8 py-20 text-muted-foreground gap-4">
              <Building2 size={48} className="opacity-20" />
              <p className="text-lg font-semibold">Sin resultados</p>
              <p className="text-sm">Intenta ajustar los filtros de búsqueda.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(contractor => (
                <button
                  key={contractor.id}
                  onClick={() => setSelected(contractor)}
                  className={cn(
                    "w-full text-left p-4 flex gap-4 hover:bg-muted/30 transition-colors group",
                    selected?.id === contractor.id && "bg-primary/5 border-l-4 border-l-primary"
                  )}
                >
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                    <img src={contractor.image} alt={contractor.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-foreground leading-tight truncate pr-1">
                        {contractor.name}
                      </h3>
                      {contractor.verified && (
                        <BadgeCheck size={16} className="text-blue-500 shrink-0 mt-0.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{contractor.specialty}</p>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-2">
                      {[1,2,3,4,5].map(i => (
                        <Star
                          key={i}
                          size={12}
                          className={i <= Math.round(contractor.rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}
                        />
                      ))}
                      <span className="text-xs font-semibold text-foreground ml-0.5">{contractor.rating}</span>
                      <span className="text-xs text-muted-foreground">({contractor.reviews})</span>
                    </div>

                    {/* Location & hours */}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin size={11} /> {contractor.state}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={11} /> {contractor.hours}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={[10.2, -67.5]}
            zoom={7}
            className="w-full h-full z-0"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {selected && <MapFlyTo lat={selected.lat} lng={selected.lng} />}

            {filtered.map(contractor => (
              <Marker
                key={contractor.id}
                position={[contractor.lat, contractor.lng]}
                icon={createOrangeIcon(selected?.id === contractor.id)}
                eventHandlers={{ click: () => setSelected(contractor) }}
              >
                <Popup className="leaflet-popup-custom">
                  <div className="p-1 min-w-[180px]">
                    <p className="font-bold text-sm text-gray-900 leading-tight">{contractor.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{contractor.specialty}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Star size={11} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold">{contractor.rating}</span>
                      <span className="text-xs text-gray-400">({contractor.reviews} reseñas)</span>
                    </div>
                    <p className="text-xs mt-1 flex items-center gap-1 text-gray-500">
                      <Phone size={11} /> {contractor.phone}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Selected contractor floating panel */}
          {selected && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-card border border-border rounded-2xl shadow-2xl p-5 flex gap-4 items-start">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                  <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground text-sm truncate">{selected.name}</h3>
                    {selected.verified && <BadgeCheck size={15} className="text-blue-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{selected.specialty}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={11} className={i <= Math.round(selected.rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"} />
                    ))}
                    <span className="text-xs font-semibold text-foreground ml-1">{selected.rating}</span>
                  </div>
                  <div className="flex gap-3 mt-3">
                    <a
                      href={`tel:${selected.phone}`}
                      className="flex-1 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg text-center flex items-center justify-center gap-1 hover:bg-primary/90 transition"
                    >
                      <Phone size={13} /> Llamar
                    </a>
                    <button className="flex-1 py-2 bg-muted text-foreground text-xs font-bold rounded-lg hover:bg-muted/70 transition">
                      Ver Perfil
                    </button>
                    <button
                      onClick={() => setSelected(null)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/70 transition text-muted-foreground"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Zoom controls */}
          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1">
            <button
              onClick={() => {
                const map = document.querySelector(".leaflet-container") as any;
                if (map?._leaflet_id) return;
              }}
              className="w-10 h-10 bg-card border border-border rounded-xl shadow flex items-center justify-center text-foreground hover:bg-muted transition font-bold text-lg"
            >
              +
            </button>
            <button className="w-10 h-10 bg-card border border-border rounded-xl shadow flex items-center justify-center text-foreground hover:bg-muted transition font-bold text-lg">
              −
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
