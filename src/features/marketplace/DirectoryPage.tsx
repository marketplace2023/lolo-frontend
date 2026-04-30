import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  ChevronDown,
  Clock,
  Loader2,
  MapPin,
  Phone,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { getMarketplaceContractors } from "./api";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const STATE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Amazonas: { lat: 3.176, lng: -65.546 },
  "Anzoátegui": { lat: 9.433, lng: -64.47 },
  Apure: { lat: 7.088, lng: -68.141 },
  Aragua: { lat: 10.246, lng: -67.595 },
  Barinas: { lat: 8.622, lng: -70.207 },
  "Bolívar": { lat: 8.121, lng: -63.55 },
  Carabobo: { lat: 10.231, lng: -68.007 },
  Cojedes: { lat: 9.622, lng: -68.918 },
  "Delta Amacuro": { lat: 8.918, lng: -61.441 },
  "Distrito Capital": { lat: 10.4806, lng: -66.9036 },
  "Falcón": { lat: 11.404, lng: -69.673 },
  "Guárico": { lat: 8.748, lng: -66.237 },
  Lara: { lat: 10.067, lng: -69.347 },
  "Mérida": { lat: 8.589, lng: -71.156 },
  Miranda: { lat: 10.305, lng: -66.887 },
  Monagas: { lat: 9.747, lng: -63.153 },
  "Nueva Esparta": { lat: 11.034, lng: -63.862 },
  Portuguesa: { lat: 9.094, lng: -69.097 },
  Sucre: { lat: 10.456, lng: -64.167 },
  "Táchira": { lat: 7.913, lng: -72.141 },
  Trujillo: { lat: 9.372, lng: -70.434 },
  Vargas: { lat: 10.601, lng: -66.934 },
  Yaracuy: { lat: 10.339, lng: -68.739 },
  Zulia: { lat: 10.6666, lng: -71.6124 },
};

function createOrangeIcon(active = false) {
  return L.divIcon({
    html: `
      <div style="
        width: ${active ? 44 : 36}px;
        height: ${active ? 44 : 36}px;
        background: ${active ? "#FF6A00" : "#1e293b"};
        border: 3px solid ${active ? "#fff" : "#FF6A00"};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      "></div>
    `,
    className: "",
    iconSize: [active ? 44 : 36, active ? 44 : 36],
    iconAnchor: [active ? 22 : 18, active ? 44 : 36],
    popupAnchor: [0, -36],
  });
}

interface IContractorCard {
  id: string;
  name: string;
  specialty: string;
  state: string;
  lat: number;
  lng: number;
  rating: number;
  projects: number;
  phone: string;
  verified: boolean;
  category: string;
  image: string | null;
  description: string;
  email: string | null;
}

function MapFlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], 9, { duration: 1 });
  }, [lat, lng, map]);

  return null;
}

function getCoordinates(state: string | null) {
  if (!state) return { lat: 10.2, lng: -67.5 };
  return STATE_COORDINATES[state] ?? { lat: 10.2, lng: -67.5 };
}

export function DirectoryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selected, setSelected] = useState<IContractorCard | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["marketplace-contractors"],
    queryFn: () => getMarketplaceContractors(),
  });

  const contractors = useMemo<IContractorCard[]>(() => {
    return (data?.data ?? []).map((contractor) => {
      const coordinates = getCoordinates(contractor.estadoUbicacion);
      const specialty = contractor.especialidades?.[0] || contractor.descripcionPublica || "Servicios de construcción";

      return {
        id: contractor.id,
        name: contractor.nombre,
        specialty,
        state: contractor.estadoUbicacion || "Ubicación por confirmar",
        lat: coordinates.lat,
        lng: coordinates.lng,
        rating: Number(contractor.rating ?? 0),
        projects: Number(contractor.totalProyectos ?? 0),
        phone: contractor.telefono || "Sin teléfono publicado",
        verified: Boolean(contractor.rncContratista),
        category: specialty,
        image: contractor.logo,
        description: contractor.descripcionPublica || "Perfil público activo en el marketplace.",
        email: contractor.email,
      };
    });
  }, [data]);

  const categories = useMemo(() => ["", ...Array.from(new Set(contractors.map((contractor) => contractor.category))).sort((a, b) => a.localeCompare(b))], [contractors]);
  const states = useMemo(() => ["", ...Array.from(new Set(contractors.map((contractor) => contractor.state))).sort((a, b) => a.localeCompare(b))], [contractors]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return contractors.filter((contractor) => {
      const matchSearch = !term
        || contractor.name.toLowerCase().includes(term)
        || contractor.specialty.toLowerCase().includes(term)
        || contractor.description.toLowerCase().includes(term);
      const matchCategory = !category || contractor.category === category;
      const matchState = !state || contractor.state === state;
      const matchVerified = !verifiedOnly || contractor.verified;
      return matchSearch && matchCategory && matchState && matchVerified;
    });
  }, [contractors, search, category, state, verifiedOnly]);

  useEffect(() => {
    if (!filtered.length) {
      setSelected(null);
      return;
    }

    setSelected((current) => current && filtered.some((contractor) => contractor.id === current.id) ? current : filtered[0]);
  }, [filtered]);

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 88px)" }}>
      <div className="bg-white border-b border-gray-100 shadow-sm px-4 py-3 flex flex-col md:flex-row gap-3 items-start md:items-center shrink-0">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar contratistas, empresas o especialidades..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#FF6A00]/30 focus:border-[#FF6A00] outline-none transition"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex gap-2 w-full md:w-auto flex-wrap">
          <div className="relative">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[#FF6A00]/30 outline-none cursor-pointer"
            >
              {categories.map((item) => <option key={item || "all-categories"} value={item}>{item || "Todas las especialidades"}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={state}
              onChange={(event) => setState(event.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[#FF6A00]/30 outline-none cursor-pointer"
            >
              {states.map((item) => <option key={item || "all-states"} value={item}>{item || "Todo el país"}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
              verifiedOnly
                ? "bg-[#FF6A00] text-white border-[#FF6A00] shadow-md shadow-[#FF6A00]/20"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-900"
            )}
          >
            <BadgeCheck size={16} /> Verificadas
          </button>

          <button
            onClick={() => {
              setSearch("");
              setCategory("");
              setState("");
              setVerifiedOnly(false);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-500 hover:text-gray-900 transition"
          >
            <SlidersHorizontal size={16} /> Limpiar
          </button>
        </div>
      </div>

      <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 text-xs text-gray-500 shrink-0">
        <span className="font-semibold text-gray-800">{filtered.length}</span> contratistas encontrados
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-full md:w-[380px] lg:w-[420px] shrink-0 overflow-y-auto bg-white border-r border-gray-100">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8 py-20 text-gray-500 gap-4">
              <Loader2 size={42} className="animate-spin text-[#FF6A00]" />
              <p className="font-semibold">Cargando directorio real...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8 py-20 text-red-500 gap-4">
              <AlertCircle size={42} />
              <p className="font-semibold">No se pudo cargar el directorio</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8 py-20 text-gray-400 gap-4">
              <Building2 size={48} className="opacity-20" />
              <p className="text-lg font-semibold text-gray-500">Sin resultados</p>
              <p className="text-sm">No hay empresas públicas que coincidan con tu búsqueda.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((contractor) => (
                <button
                  key={contractor.id}
                  onClick={() => setSelected(contractor)}
                  className={cn(
                    "w-full text-left p-4 flex gap-4 hover:bg-gray-50 transition-colors group",
                    selected?.id === contractor.id && "bg-orange-50 border-l-4 border-l-[#FF6A00]"
                  )}
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 shadow-sm flex items-center justify-center text-gray-400">
                    {contractor.image ? <img src={contractor.image} alt={contractor.name} className="w-full h-full object-cover" /> : <Building2 size={24} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-gray-900 leading-tight truncate pr-1">{contractor.name}</h3>
                      {contractor.verified && <BadgeCheck size={16} className="text-blue-500 shrink-0 mt-0.5" />}
                    </div>
                    <p className="text-xs text-[#FF6A00] font-medium mt-0.5 truncate">{contractor.specialty}</p>

                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((index) => (
                        <Star key={index} size={12} className={index <= Math.round(contractor.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                      ))}
                      <span className="text-xs font-semibold text-gray-800 ml-0.5">{contractor.rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">({contractor.projects} proyectos)</span>
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={11} /> {contractor.state}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={11} /> Marketplace activo
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 relative">
          <MapContainer center={[10.2, -67.5]} zoom={7} className="w-full h-full z-0" zoomControl={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {selected && <MapFlyTo lat={selected.lat} lng={selected.lng} />}
            {filtered.map((contractor) => (
              <Marker
                key={contractor.id}
                position={[contractor.lat, contractor.lng]}
                icon={createOrangeIcon(selected?.id === contractor.id)}
                eventHandlers={{ click: () => setSelected(contractor) }}
              >
                <Popup>
                  <div className="p-1 min-w-[180px]">
                    <p className="font-bold text-sm text-gray-900 leading-tight">{contractor.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{contractor.specialty}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Star size={11} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold">{contractor.rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">({contractor.projects} proyectos)</span>
                    </div>
                    <p className="text-xs mt-1 flex items-center gap-1 text-gray-500">
                      <Phone size={11} /> {contractor.phone}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {selected && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md">
              <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl p-5 flex gap-4 items-start">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 flex items-center justify-center text-gray-400">
                  {selected.image ? <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" /> : <Building2 size={24} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-sm truncate">{selected.name}</h3>
                    {selected.verified && <BadgeCheck size={15} className="text-blue-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-[#FF6A00] font-medium mt-0.5">{selected.specialty}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    {[1, 2, 3, 4, 5].map((index) => (
                      <Star key={index} size={11} className={index <= Math.round(selected.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                    ))}
                    <span className="text-xs font-semibold text-gray-800 ml-1">{selected.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <a href={`tel:${selected.phone}`} className="flex-1 py-2 bg-[#FF6A00] text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1 hover:bg-[#e65f00] transition shadow-md shadow-[#FF6A00]/20">
                      <Phone size={13} /> Llamar
                    </a>
                    <Link to={`/directory/${selected.id}`} className="flex-1 py-2 bg-gray-100 text-gray-800 text-xs font-bold rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-1">
                      <Building2 size={13} /> Ver detalles
                    </Link>
                    <button onClick={() => setSelected(null)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition text-gray-500">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
