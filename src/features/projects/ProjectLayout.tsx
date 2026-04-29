import { Outlet, useParams, Link, useLocation, Navigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { ChevronRight, FileText, TrendingUp, TrendingDown, ClipboardCheck, Calculator, FileOutput, Layers, BookCheck, LayoutDashboard, CalendarRange } from "lucide-react";

export function ProjectLayout() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const { data: project } = useQuery({
    queryKey: ["project", id],
    queryFn: () => api.get(`/projects/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const tabs = [
    { name: "Resumen", path: `/projects/${id}/dashboard`, icon: <LayoutDashboard size={16} /> },
    { name: "Presupuesto", path: `/projects/${id}/budget`, icon: <FileText size={16} /> },
    { name: "Cómputos", path: `/projects/${id}/measurements`, icon: <Calculator size={16} /> },
    { name: "Valuaciones", path: `/projects/${id}/valuations`, icon: <ClipboardCheck size={16} /> },
    { name: "Aumentos", path: `/projects/${id}/aumentos`, icon: <TrendingUp size={16} /> },
    { name: "Disminuciones", path: `/projects/${id}/disminuciones`, icon: <TrendingDown size={16} /> },
    { name: "Obras Extra", path: `/projects/${id}/extras`, icon: <Layers size={16} /> },
    { name: "Cronograma", path: `/projects/${id}/cronograma`, icon: <CalendarRange size={16} /> },
    { name: "Cierre", path: `/projects/${id}/cierre`, icon: <BookCheck size={16} /> },
    { name: "Reportes", path: `/projects/${id}/reports`, icon: <FileOutput size={16} /> },
  ];

  // Si está en la ruta raíz del proyecto, redirigir al dashboard
  if (location.pathname === `/projects/${id}`) {
    return <Navigate to={`/projects/${id}/dashboard`} replace />;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Proyectos</span>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium">{project?.codigo ?? "..."}</span>
      </div>

      {/* Header */}
      {project && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h1 className="text-xl font-bold text-foreground">{project.descripcion}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Código: <span className="font-mono">{project.codigo}</span> · 
            Moneda: <span className="font-mono">{project?.moneda?.simbolo ?? "Bs."}</span>
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            to={tab.path}
            className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              location.pathname.startsWith(tab.path)
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            {tab.icon} {tab.name}
          </Link>
        ))}
      </div>

      {/* Content */}
      <div className="pt-2">
        <Outlet context={{ project }} />
      </div>
    </div>
  );
}
