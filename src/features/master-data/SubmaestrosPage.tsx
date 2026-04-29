import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { formatCurrency } from "@/utils/cn";
import {
  Package, Wrench, HardHat, Search, Edit2, Save, X,
  CheckCircle, AlertCircle, RefreshCw, Globe, Building2
} from "lucide-react";

type TTab = "materials" | "equipments" | "labors";

interface IGlobalRow {
  id: string;
  codigo: string;
  descripcion: string;
  unidad: string;
  precio: string;
  precioGlobal: string;
  precioLocal: string | null;
  isLocal: boolean;
  disponible: boolean;
  depreciacionLocal?: string | null;
  fleteLocal?: string | null;
  fcocLocal?: string | null;
}

const TAB_CONFIG: Record<TTab, { label: string; icon: React.ElementType; endpoint: string; color: string }> = {
  materials: { label: "Materiales", icon: Package, endpoint: "materials", color: "text-blue-400" },
  equipments: { label: "Equipos", icon: Wrench, endpoint: "equipments", color: "text-amber-400" },
  labors: { label: "Mano de Obra", icon: HardHat, endpoint: "labors", color: "text-emerald-400" },
};

interface IEditState {
  id: string;
  precio: string;
  disponible: boolean;
  extra: string; // flete / depreciacion / fcoc
}

export function SubmaestrosPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TTab>("materials");
  const [search, setSearch] = useState("");
  const [editState, setEditState] = useState<IEditState | null>(null);
  const [page, setPage] = useState(1);
  const LIMIT = 50;

  const cfg = TAB_CONFIG[tab];

  const { data, isLoading } = useQuery({
    queryKey: ["submaestros", tab, search, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) params.set("search", search);
      const res = await api.get(`/${cfg.endpoint}?${params}`);
      return res.data as { data: IGlobalRow[]; total: number; page: number; totalPages: number };
    },
    placeholderData: (prev) => prev,
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.put(`/${cfg.endpoint}/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submaestros", tab] });
      setEditState(null);
    },
  });

  const rows = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const startEdit = (row: IGlobalRow) => {
    setEditState({
      id: row.id,
      precio: row.precioLocal ?? row.precioGlobal ?? "0",
      disponible: row.disponible,
      extra: (tab === "materials" ? row.fleteLocal : tab === "equipments" ? row.depreciacionLocal : row.fcocLocal) ?? "0",
    });
  };

  const saveEdit = () => {
    if (!editState) return;
    const body: Record<string, unknown> = {
      precio: editState.precio,
      disponible: editState.disponible,
    };
    if (tab === "materials") body.fleteLocal = editState.extra;
    if (tab === "equipments") body.depreciacionLocal = editState.extra;
    if (tab === "labors") body.fcocLocal = editState.extra;
    saveMutation.mutate({ id: editState.id, body });
  };

  const extraLabel = tab === "materials" ? "Flete Local" : tab === "equipments" ? "Depreciación Local" : "FCOC Local";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Submaestros de Empresa</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gestiona tus precios locales. El precio global del catálogo se usa como referencia; configura tu precio local para APUs propios.
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Globe className="h-4 w-4 text-slate-400" /> Precio global (catálogo)
        </span>
        <span className="flex items-center gap-1.5 text-emerald-400">
          <Building2 className="h-4 w-4" /> Precio local (tu empresa)
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {(Object.entries(TAB_CONFIG) as [TTab, typeof TAB_CONFIG[TTab]][]).map(([key, val]) => {
          const Icon = val.icon;
          return (
            <button
              key={key}
              onClick={() => { setTab(key); setPage(1); setSearch(""); setEditState(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === key
                  ? `border-primary ${val.color}`
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {val.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por código o descripción..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Código</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Descripción</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Unidad</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                <span className="flex items-center justify-end gap-1">
                  <Globe className="h-3.5 w-3.5" /> Precio Global
                </span>
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                <span className="flex items-center justify-end gap-1">
                  <Building2 className="h-3.5 w-3.5" /> Precio Local
                </span>
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">{extraLabel}</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Estado</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Acción</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Cargando catálogo...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  No se encontraron registros.
                </td>
              </tr>
            ) : rows.map((row) => {
              const isEditing = editState?.id === row.id;
              const extraVal = tab === "materials" ? row.fleteLocal : tab === "equipments" ? row.depreciacionLocal : row.fcocLocal;

              return (
                <tr key={row.id} className={`border-b border-border transition-colors hover:bg-muted/20 ${isEditing ? "bg-primary/5" : ""}`}>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.codigo}</td>
                  <td className="px-4 py-3 text-foreground max-w-xs">
                    <div className="truncate">{row.descripcion}</div>
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{row.unidad}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                    {formatCurrency(Number(row.precioGlobal))}
                  </td>

                  {/* Precio Local */}
                  <td className="px-4 py-3 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editState!.precio}
                        onChange={(e) => setEditState(s => s ? { ...s, precio: e.target.value } : s)}
                        className="w-28 text-right bg-card border border-primary/60 rounded px-2 py-1 text-sm font-mono focus:outline-none"
                        step="0.000001"
                        min="0"
                      />
                    ) : (
                      <span className={`font-mono ${row.isLocal ? "text-emerald-400 font-semibold" : "text-muted-foreground"}`}>
                        {row.precioLocal && Number(row.precioLocal) > 0
                          ? formatCurrency(Number(row.precioLocal))
                          : <span className="text-xs italic">Sin override</span>}
                      </span>
                    )}
                  </td>

                  {/* Extra field */}
                  <td className="px-4 py-3 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editState!.extra}
                        onChange={(e) => setEditState(s => s ? { ...s, extra: e.target.value } : s)}
                        className="w-24 text-right bg-card border border-border rounded px-2 py-1 text-sm font-mono focus:outline-none"
                        step="0.000001"
                        min="0"
                      />
                    ) : (
                      <span className="font-mono text-muted-foreground text-xs">
                        {extraVal && Number(extraVal) > 0 ? formatCurrency(Number(extraVal)) : "—"}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 text-center">
                    {isEditing ? (
                      <button
                        onClick={() => setEditState(s => s ? { ...s, disponible: !s.disponible } : s)}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
                          editState?.disponible
                            ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                            : "border-red-500/50 text-red-400 bg-red-500/10"
                        }`}
                      >
                        {editState?.disponible ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {editState?.disponible ? "Activo" : "Inactivo"}
                      </button>
                    ) : (
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                        row.disponible
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-red-400 bg-red-500/10"
                      }`}>
                        {row.disponible ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {row.disponible ? "Activo" : "Inactivo"}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-center">
                    {isEditing ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={saveEdit}
                          disabled={saveMutation.isPending}
                          className="inline-flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2.5 py-1.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          <Save className="h-3 w-3" />
                          {saveMutation.isPending ? "Guardando..." : "Guardar"}
                        </button>
                        <button
                          onClick={() => setEditState(null)}
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground border border-border px-2 py-1.5 rounded-lg hover:text-foreground transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(row)}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary border border-transparent hover:border-primary/30 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-3 w-3" />
                        Override
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Página {page} de {totalPages} · {data?.total ?? 0} registros</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/40 disabled:opacity-40 transition-colors"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/40 disabled:opacity-40 transition-colors"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
