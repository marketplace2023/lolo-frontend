import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import {
  Search, MapPin, Star, Building2, Briefcase,
  Phone, Mail, Shield, ChevronRight, Users, Loader2, AlertCircle
} from "lucide-react";
import { Link } from "react-router";

const ESPECIALIDADES = [
  "Residencial", "Comercial", "Industrial", "Infraestructura",
  "Vialidad", "Hidráulica", "Eléctrica", "Acabados", "Remodelación"
];

const ESTADOS_VE = [
  "Amazonas","Anzoátegui","Apure","Aragua","Barinas","Bolívar",
  "Carabobo","Cojedes","Delta Amacuro","Distrito Capital","Falcón",
  "Guárico","Lara","Mérida","Miranda","Monagas","Nueva Esparta",
  "Portuguesa","Sucre","Táchira","Trujillo","Vargas","Yaracuy","Zulia"
];

interface IContractor {
  id: string; nombre: string; rif: string | null; logo: string | null;
  descripcionPublica: string | null; especialidades: string[] | null;
  estadoUbicacion: string | null; anosFundacion: number | null;
  telefono: string | null; email: string | null; rating: string | null;
  totalProyectos: number | null; rncContratista: string | null;
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i<=Math.round(value)?"text-amber-400 fill-amber-400":"text-muted-foreground/30"}`} />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{Number(value).toFixed(1)}</span>
    </div>
  );
}

function ContractorCard({ c }: { c: IContractor }) {
  const specs = (c.especialidades ?? []) as string[];
  const rating = Number(c.rating ?? 0);
  const years = c.anosFundacion ? new Date().getFullYear() - c.anosFundacion : null;
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary font-bold text-lg">
          {c.logo ? <img src={c.logo} alt={c.nombre} className="w-full h-full object-cover rounded-xl" /> : c.nombre[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground text-sm leading-tight truncate">{c.nombre}</h3>
          {c.rif && <p className="text-xs text-muted-foreground font-mono mt-0.5">RIF: {c.rif}</p>}
          <StarRating value={rating} />
        </div>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {c.estadoUbicacion && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.estadoUbicacion}</span>}
        {years && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {years} años</span>}
        {(c.totalProyectos ?? 0) > 0 && <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {c.totalProyectos} proyectos</span>}
        {c.rncContratista && <span className="flex items-center gap-1 text-emerald-400"><Shield className="h-3 w-3" /> Registrado</span>}
      </div>
      {c.descripcionPublica && <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{c.descripcionPublica}</p>}
      {specs.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {specs.slice(0,3).map((s) => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">{s}</span>
          ))}
          {specs.length > 3 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{specs.length-3}</span>}
        </div>
      )}
      <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
        <div className="flex gap-3">
          {c.telefono && <a href={`tel:${c.telefono}`} className="text-muted-foreground hover:text-primary transition-colors"><Phone className="h-3.5 w-3.5" /></a>}
          {c.email && <a href={`mailto:${c.email}`} className="text-muted-foreground hover:text-primary transition-colors"><Mail className="h-3.5 w-3.5" /></a>}
        </div>
        <Link to={`/marketplace/contractors/${c.id}`} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-all">
          Ver perfil <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [estado, setEstado] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["marketplace-contractors", search, especialidad, estado],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (especialidad) params.set("especialidad", especialidad);
      if (estado) params.set("estado", estado);
      const res = await api.get(`/marketplace/contractors?${params}`);
      return res.data as { data: IContractor[]; total: number };
    },
    placeholderData: (prev) => prev,
  });

  const contractors = data?.data ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Directorio de Contratistas</h1>
            <p className="text-sm text-muted-foreground">Encuentra empresas constructoras verificadas en Venezuela</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2"><span className="text-foreground font-semibold">{data?.total ?? "—"}</span> contratistas activos</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar por nombre o RIF..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <select value={especialidad} onChange={(e) => setEspecialidad(e.target.value)}
          className="px-3 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40">
          <option value="">Todas las especialidades</option>
          {ESPECIALIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <select value={estado} onChange={(e) => setEstado(e.target.value)}
          className="px-3 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40">
          <option value="">Todos los estados</option>
          {ESTADOS_VE.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        {(search || especialidad || estado) && (
          <button onClick={() => { setSearch(""); setEspecialidad(""); setEstado(""); }}
            className="px-3 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
            Limpiar filtros
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
          <Loader2 className="h-5 w-5 animate-spin" /> Buscando contratistas...
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-red-400 py-10">
          <AlertCircle className="h-5 w-5" /> Error al cargar el directorio.
        </div>
      ) : contractors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <Building2 className="h-12 w-12 opacity-20" />
          <p className="text-sm">No se encontraron contratistas con esos criterios.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {contractors.map((c) => <ContractorCard key={c.id} c={c} />)}
        </div>
      )}
    </div>
  );
}
