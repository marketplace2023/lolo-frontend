import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Package, Wrench, Users2, FolderOpen, Layers, TrendingUp } from "lucide-react";
import { Link } from "react-router";

interface IStatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  href: string;
  color: string;
}

function StatCard({ label, value, icon, href, color }: IStatCard) {
  return (
    <Link to={href} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <TrendingUp size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </Link>
  );
}

export function DashboardPage() {
  const { data: materials } = useQuery({
    queryKey: ["dashboard-materials"],
    queryFn: () => api.get("/materials?limit=1").then((r) => r.data.pagination?.total ?? 0),
  });
  const { data: equipments } = useQuery({
    queryKey: ["dashboard-equipments"],
    queryFn: () => api.get("/equipments?limit=1").then((r) => r.data.pagination?.total ?? 0),
  });
  const { data: labors } = useQuery({
    queryKey: ["dashboard-labors"],
    queryFn: () => api.get("/labors?limit=1").then((r) => r.data.pagination?.total ?? 0),
  });
  const { data: items } = useQuery({
    queryKey: ["dashboard-items"],
    queryFn: () => api.get("/items?limit=1").then((r) => r.data.pagination?.total ?? 0),
  });
  const { data: projects } = useQuery({
    queryKey: ["dashboard-projects"],
    queryFn: () => api.get("/projects").then((r) => r.data.data?.length ?? 0),
  });

  const stats: IStatCard[] = [
    { label: "Materiales", value: materials ?? "—", icon: <Package size={18} className="text-blue-400" />, href: "/master-data/materials", color: "bg-blue-500/10" },
    { label: "Equipos", value: equipments ?? "—", icon: <Wrench size={18} className="text-orange-400" />, href: "/master-data/equipments", color: "bg-orange-500/10" },
    { label: "Mano de Obra", value: labors ?? "—", icon: <Users2 size={18} className="text-green-400" />, href: "/master-data/labor", color: "bg-green-500/10" },
    { label: "Partidas (APU)", value: items ?? "—", icon: <Layers size={18} className="text-purple-400" />, href: "/master-data/items", color: "bg-purple-500/10" },
    { label: "Proyectos", value: projects ?? "—", icon: <FolderOpen size={18} className="text-primary" />, href: "/projects", color: "bg-primary/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Resumen del sistema LULOWinNG</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Quick links */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">Accesos Rápidos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Nuevo Proyecto", href: "/projects" },
            { label: "Ver Materiales", href: "/master-data/materials" },
            { label: "Ver Partidas", href: "/master-data/items" },
            { label: "Familias BCV", href: "/master-data/bcv-families" },
          ].map((l) => (
            <Link key={l.href} to={l.href}
              className="px-3 py-2 rounded-lg bg-accent border border-border text-xs text-center hover:bg-accent/80 hover:border-primary/30 transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
