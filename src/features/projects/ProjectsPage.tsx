import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useProjectStore } from "@/store/useProjectStore";
import { useNavigate } from "react-router";
import { useState } from "react";
import { FolderOpen, CheckCircle, Loader2, Plus, ArrowRight, Trash2 } from "lucide-react";
import { CreateProjectDialog } from "./components/CreateProjectDialog";

interface IProject {
  id: string; codigo: string; descripcion: string; status: string;
  fechaPresupuesto: string | null; moneda?: { simbolo: string };
  costoIndirecto?: { administracion: number; utilidad: number };
}

export function ProjectsPage() {
  const { activeProject, setActiveProject } = useProjectStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.get("/projects").then((r) => r.data.data as IProject[]),
  });

  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => api.delete(`/projects/${projectId}`),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      // Clear active project if the deleted one was active
      if (activeProject?.id === projectId) {
        setActiveProject(null as any);
      }
    }
  });

  const handleDelete = (e: React.MouseEvent, project: IProject) => {
    e.stopPropagation();
    if (confirm(`¿Está seguro de eliminar el proyecto "${project.descripcion}"?\n\nEsta acción es irreversible y eliminará todo el presupuesto, APUs, cómputos y valuaciones asociadas.`)) {
      deleteMutation.mutate(project.id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Proyectos</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{data?.length ?? 0} proyectos en el sistema</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} /> Nuevo Proyecto
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data ?? []).map((project) => {
            const isActive = activeProject?.id === project.id;
            const isDeleting = deleteMutation.isPending && deleteMutation.variables === project.id;
            return (
              <div key={project.id}
                className={`bg-card border rounded-xl p-4 transition-all hover:shadow-lg ${isActive ? "border-primary shadow-primary/10" : "border-border hover:border-border/80"} ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FolderOpen size={17} className="text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <span className="text-xs font-semibold text-primary flex items-center bg-primary/10 px-2 py-1 rounded">Activo <CheckCircle size={14} className="ml-1" /></span>
                    ) : (
                      <button 
                        onClick={() => setActiveProject(project)}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        Establecer Activo
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, project)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Eliminar proyecto"
                    >
                      {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
                <p className="text-xs font-mono text-muted-foreground">{project.codigo}</p>
                <h3 className="text-sm font-semibold text-foreground mt-0.5 line-clamp-2">{project.descripcion}</h3>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${project.status === "S" ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground"}`}>
                    {project.status === "S" ? "Activo" : "Normal"}
                  </span>
                  {project.fechaPresupuesto && (
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(project.fechaPresupuesto).toLocaleDateString("es-VE")}
                    </span>
                  )}
                </div>
                {project.costoIndirecto && (
                  <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span>Adm: {project.costoIndirecto.administracion}%</span>
                    <span>Util: {project.costoIndirecto.utilidad}%</span>
                  </div>
                )}
                
                <div className="mt-4 pt-3 border-t border-border flex justify-end">
                  <button 
                    onClick={() => {
                      setActiveProject(project);
                      navigate(`/projects/${project.id}/budget`);
                    }}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Ver Detalles <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateProjectDialog open={isCreating} onOpenChange={setIsCreating} />
    </div>
  );
}


interface IProject {
  id: string; codigo: string; descripcion: string; status: string;
  fechaPresupuesto: string | null; moneda?: { simbolo: string };
  costoIndirecto?: { administracion: number; utilidad: number };
}

export function ProjectsPage() {
  const { activeProject, setActiveProject } = useProjectStore();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.get("/projects").then((r) => r.data.data as IProject[]),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Proyectos</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{data?.length ?? 0} proyectos en el sistema</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} /> Nuevo Proyecto
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data ?? []).map((project) => {
            const isActive = activeProject?.id === project.id;
            return (
              <div key={project.id}
                className={`bg-card border rounded-xl p-4 transition-all hover:shadow-lg ${isActive ? "border-primary shadow-primary/10" : "border-border hover:border-border/80"}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FolderOpen size={17} className="text-primary" />
                  </div>
                  {isActive ? (
                    <span className="text-xs font-semibold text-primary flex items-center bg-primary/10 px-2 py-1 rounded">Activo <CheckCircle size={14} className="ml-1" /></span>
                  ) : (
                    <button 
                      onClick={() => setActiveProject(project)}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Establecer Activo
                    </button>
                  )}
                </div>
                <p className="text-xs font-mono text-muted-foreground">{project.codigo}</p>
                <h3 className="text-sm font-semibold text-foreground mt-0.5 line-clamp-2">{project.descripcion}</h3>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${project.status === "S" ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground"}`}>
                    {project.status === "S" ? "Activo" : "Normal"}
                  </span>
                  {project.fechaPresupuesto && (
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(project.fechaPresupuesto).toLocaleDateString("es-VE")}
                    </span>
                  )}
                </div>
                {project.costoIndirecto && (
                  <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span>Adm: {project.costoIndirecto.administracion}%</span>
                    <span>Util: {project.costoIndirecto.utilidad}%</span>
                  </div>
                )}
                
                <div className="mt-4 pt-3 border-t border-border flex justify-end">
                  <button 
                    onClick={() => {
                      setActiveProject(project);
                      navigate(`/projects/${project.id}/budget`);
                    }}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Ver Detalles <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateProjectDialog open={isCreating} onOpenChange={setIsCreating} />
    </div>
  );
}
