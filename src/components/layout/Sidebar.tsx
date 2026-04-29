import { NavLink } from "react-router";
import { cn } from "@/utils/cn";
import {
  LayoutDashboard, FolderOpen, Package, Wrench, Users2,
  Layers, Building2, ChevronDown, HardHat, Settings, ShoppingBag
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";

interface INavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: { label: string; href: string }[];
}

const navItems: INavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={16} /> },
  { label: "Proyectos", href: "/projects", icon: <FolderOpen size={16} /> },
  {
    label: "Datos Maestros", icon: <Layers size={16} />,
    children: [
      { label: "Materiales", href: "/master-data/materials" },
      { label: "Equipos", href: "/master-data/equipments" },
      { label: "Mano de Obra", href: "/master-data/labor" },
      { label: "Partidas (APU)", href: "/master-data/items" },
      { label: "Familias BCV", href: "/master-data/bcv-families" },
      { label: "Submaestros", href: "/master-data/submaestros" },
    ],
  },
  { label: "Configuración", href: "/settings", icon: <Settings size={16} /> },
  {
    label: "Marketplace", icon: <ShoppingBag size={16} />,
    children: [
      { label: "Directorio de Empresas", href: "/marketplace/directory" },
      { label: "Publicar Producto/Servicio", href: "/marketplace/create" },
      { label: "Solicitudes RFQ", href: "/marketplace/rfq" },
    ],
  },
];

function NavGroup({ item }: { item: INavItem }) {
  const [open, setOpen] = useState(true);
  if (!item.children) {
    return (
      <NavLink
        to={item.href!}
        className={({ isActive }) =>
          cn("flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
            isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          )}
      >
        {item.icon}
        {item.label}
      </NavLink>
    );
  }
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
      >
        <span className="flex items-center gap-2.5">{item.icon}{item.label}</span>
        <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="ml-4 mt-0.5 border-l border-border pl-2 space-y-0.5">
          {item.children.map((child) => (
            <NavLink
              key={child.href}
              to={child.href}
              className={({ isActive }) =>
                cn("block px-3 py-1.5 rounded-md text-xs transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const user = useAuthStore(s => s.user);
  
  const { data: company } = useQuery({
    queryKey: ["company", user?.companyId],
    queryFn: () => api.get(`/companies/${user?.companyId}`).then(r => r.data),
    enabled: !!user?.companyId,
  });

  return (
    <aside className="w-56 flex flex-col bg-sidebar border-r border-border shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <HardHat size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">LULOWinNG</p>
          <p className="text-[10px] text-muted-foreground">Web v1.0</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {navItems.map((item) => (
          <NavGroup key={item.label} item={item} />
        ))}
      </nav>

      {/* Company indicator */}
      <div className="px-3 py-3 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Building2 size={12} className="shrink-0" />
          <span className="truncate font-medium">{company?.nombre || "Sin empresa activa"}</span>
        </div>
      </div>
    </aside>
  );
}
