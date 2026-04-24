import { useAuthStore } from "@/store/useAuthStore";
import { useProjectStore } from "@/store/useProjectStore";
import { LogOut, ChevronDown } from "lucide-react";

export function Header() {
  const { user, logout } = useAuthStore();
  const activeProject = useProjectStore((s) => s.activeProject);

  return (
    <header className="h-12 flex items-center justify-between px-6 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
      {/* Active project badge */}
      <div className="flex items-center gap-2">
        {activeProject ? (
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-md px-2.5 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary">
              {activeProject.codigo} — {activeProject.descripcion}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Sin proyecto activo</span>
        )}
      </div>

      {/* User menu */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-xs">
              {user.nombre.charAt(0).toUpperCase()}
            </div>
            <span className="text-muted-foreground hidden sm:block">{user.nombre}</span>
          </div>
        )}
        <button
          onClick={logout}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Cerrar sesión"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
