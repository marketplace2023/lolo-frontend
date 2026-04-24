import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { formatCurrency } from "@/utils/cn";
import { ArrowLeft, Plus, RefreshCw, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/FormPrimitives";
import { FormDialog } from "@/components/ui/FormDialog";
import { InsumoSelectorDialog } from "./components/InsumoSelectorDialog";

interface IInsumo {
  id: string;
  insumoId: string;
  codigoInsumo: string;
  descripcion: string;
  unidad: string;
  tipo: string;
  cantidad: string;
  costoUnitario: string;
  subtotal: string;
}

interface IApuData {
  apu: {
    id: string;
    codigo: string;
    descripcion: string;
    unidad: string;
    rendimiento: string;
    precioUnitario: string;
  } | null;
  insumos: {
    materiales: IInsumo[];
    equipos: IInsumo[];
    manoDeObra: IInsumo[];
  };
}

export function ApuEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"materiales" | "equipos" | "manoDeObra">("materiales");
  
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [editInsumo, setEditInsumo] = useState<IInsumo | null>(null);
  const [editCantidad, setEditCantidad] = useState("");
  
  const { data, isLoading, isError } = useQuery<IApuData>({
    queryKey: ["apu", id],
    queryFn: () => api.get(`/apu/by-item/${id}`).then((r) => r.data),
  });

  const recalculateMutation = useMutation({
    mutationFn: (apuId: string) => api.post(`/apu/${apuId}/recalculate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["apu", id] }),
  });

  const addInsumoMutation = useMutation({
    mutationFn: (data: { insumoId: string, tipo: string, cantidad: string }) => 
      api.post(`/apu/${id}/insumos`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apu", id] });
      setIsSelectorOpen(false);
    },
  });

  const updateInsumoMutation = useMutation({
    mutationFn: ({ insumoId, cantidad }: { insumoId: string, cantidad: string }) => 
      api.put(`/apu/insumos/${insumoId}`, { cantidad }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apu", id] });
      setEditInsumo(null);
    },
  });

  const deleteInsumoMutation = useMutation({
    mutationFn: (insumoId: string) => api.delete(`/apu/insumos/${insumoId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["apu", id] }),
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando Análisis de Precios Unitarios...</div>;
  if (isError || !data?.apu) return <div className="p-8 text-center text-destructive">Error cargando el APU o no tiene análisis asociado.</div>;

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editInsumo) {
      updateInsumoMutation.mutate({ insumoId: editInsumo.id, cantidad: editCantidad });
    }
  };

  const currentInsumos = data.insumos[activeTab] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/master-data/items")} className="p-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/80 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Análisis de Precio Unitario (APU)</h1>
          <p className="text-sm text-muted-foreground">{data.apu.codigo} - {data.apu.descripcion}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Precio Unitario</p>
          <p className="text-2xl font-mono font-bold text-primary">{formatCurrency(data.apu.precioUnitario)}</p>
        </div>
        <Button 
          onClick={() => recalculateMutation.mutate(data.apu!.id)} 
          loading={recalculateMutation.isPending}
          variant="secondary"
          className="ml-2"
        >
          <RefreshCw size={14} className={recalculateMutation.isPending ? "animate-spin" : ""} /> Recalcular
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Unidad</p>
          <p className="text-lg font-medium">{data.apu.unidad}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Rendimiento</p>
          <p className="text-lg font-mono">{Number(data.apu.rendimiento).toLocaleString()} / día</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Total Materiales</p>
          <p className="text-lg font-mono">{formatCurrency(data.insumos.materiales.reduce((a, b) => a + Number(b.subtotal), 0).toString())}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Total Equipos + M.O.</p>
          <p className="text-lg font-mono">{formatCurrency((data.insumos.equipos.reduce((a, b) => a + Number(b.subtotal), 0) + data.insumos.manoDeObra.reduce((a, b) => a + Number(b.subtotal), 0)).toString())}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
        <div className="flex border-b border-border bg-muted/30">
          <button 
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "materiales" ? "bg-card text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-accent/50"}`}
            onClick={() => setActiveTab("materiales")}
          >
            Materiales ({data.insumos.materiales.length})
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "equipos" ? "bg-card text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-accent/50"}`}
            onClick={() => setActiveTab("equipos")}
          >
            Equipos ({data.insumos.equipos.length})
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "manoDeObra" ? "bg-card text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-accent/50"}`}
            onClick={() => setActiveTab("manoDeObra")}
          >
            Mano de Obra ({data.insumos.manoDeObra.length})
          </button>
        </div>

        <div className="p-4 flex items-center justify-between">
          <h3 className="font-semibold text-foreground capitalize">{activeTab.replace(/([A-Z])/g, ' $1').trim()}</h3>
          <Button variant="secondary" size="sm" onClick={() => setIsSelectorOpen(true)}>
            <Plus size={14} /> Añadir {activeTab === "manoDeObra" ? "Labor" : activeTab === "equipos" ? "Equipo" : "Material"}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border bg-muted/30">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Código</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Descripción</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Und.</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Cantidad</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Costo Unit.</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Subtotal</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentInsumos.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No hay insumos en esta categoría</td></tr>
              ) : (
                currentInsumos.map(ins => (
                  <tr key={ins.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{ins.codigoInsumo}</td>
                    <td className="px-4 py-2 max-w-xs truncate" title={ins.descripcion}>{ins.descripcion}</td>
                    <td className="px-4 py-2 text-xs">{ins.unidad}</td>
                    <td className="px-4 py-2 text-right font-mono">{Number(ins.cantidad).toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
                    <td className="px-4 py-2 text-right font-mono">{formatCurrency(ins.costoUnitario, "")}</td>
                    <td className="px-4 py-2 text-right font-mono font-medium">{formatCurrency(ins.subtotal, "")}</td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setEditInsumo(ins); setEditCantidad(ins.cantidad); }} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => deleteInsumoMutation.mutate(ins.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FormDialog 
        open={!!editInsumo} 
        onOpenChange={(v) => !v && setEditInsumo(null)} 
        title="Editar Insumo"
        size="sm"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">{editInsumo?.codigoInsumo}</p>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{editInsumo?.descripcion}</p>
            
            <label className="block text-xs font-medium text-muted-foreground mb-1">Cantidad</label>
            <input 
              type="number" 
              step="any"
              value={editCantidad}
              onChange={e => setEditCantidad(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditInsumo(null)}>Cancelar</Button>
            <Button type="submit" loading={updateInsumoMutation.isPending}>Guardar</Button>
          </div>
        </form>
      </FormDialog>
      <InsumoSelectorDialog
        open={isSelectorOpen}
        onOpenChange={setIsSelectorOpen}
        tipo={activeTab}
        onSelect={(insumoId, tipoBackend, cantidad) => {
          addInsumoMutation.mutate({ insumoId, tipo: tipoBackend, cantidad });
        }}
        isSubmitting={addInsumoMutation.isPending}
      />
    </div>
  );
}
