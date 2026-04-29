import { useState } from "react";
import { useOutletContext } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { formatCurrency } from "@/utils/cn";
import { Button } from "@/components/ui/FormPrimitives";
import { FormDialog } from "@/components/ui/FormDialog";
import { Loader2, Plus, Pencil, Trash2, AlertCircle } from "lucide-react";

interface IExtraItem {
  id: string;
  codigoPartida: string;
  descripcion: string;
  unidad: string | null;
  cantidad: string;
  precioUnitario: string;
  montoTotal: string;
  motivo: string | null;
  fechaAprobacion: string | null;
}

const emptyForm = {
  codigoPartida: "",
  descripcion: "",
  unidad: "",
  cantidad: "",
  precioUnitario: "",
  motivo: "",
  fechaAprobacion: "",
  apuId: "",
};

export function ExtrasPage() {
  const { project } = useOutletContext<{ project: any }>();
  const id = project?.id;
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IExtraItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: extras, isLoading } = useQuery<IExtraItem[]>({
    queryKey: ["extras", id],
    queryFn: () => api.get(`/projects/${id}/extras`).then(r => r.data),
    enabled: !!id,
  });

  const { data: apus } = useQuery<any[]>({
    queryKey: ["apu", id],
    queryFn: () => api.get(`/projects/${id}/apu`).then(r => r.data),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post(`/projects/${id}/extras`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["extras", id] }); handleClose(); },
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof form) => api.put(`/projects/${id}/extras/${editingItem!.id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["extras", id] }); handleClose(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (extraId: string) => api.delete(`/projects/${id}/extras/${extraId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["extras", id] }),
  });

  const handleOpen = (item?: IExtraItem) => {
    if (item) {
      setEditingItem(item);
      setForm({ codigoPartida: item.codigoPartida, descripcion: item.descripcion,
        unidad: item.unidad ?? "", cantidad: item.cantidad, precioUnitario: item.precioUnitario,
        motivo: item.motivo ?? "", fechaAprobacion: item.fechaAprobacion ?? "", apuId: "" });
    } else {
      setEditingItem(null);
      const nextNum = String((extras?.length ?? 0) + 1).padStart(3, "0");
      setForm({ ...emptyForm, codigoPartida: `EXT-${nextNum}` });
    }
    setIsDialogOpen(true);
  };

  const handleClose = () => { setIsDialogOpen(false); setEditingItem(null); setForm(emptyForm); };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editingItem ? updateMutation.mutate(form) : createMutation.mutate(form);
  };

  const montoTotal = extras?.reduce((s, e) => s + Number(e.montoTotal), 0) ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Obras Extra</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Partidas fuera del contrato original.</p>
        </div>
        <Button onClick={() => handleOpen()} size="sm"><Plus size={16} /> Nueva Obra Extra</Button>
      </div>

      <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-sm text-amber-700 dark:text-amber-400">
        <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
        <p>
          Identificadas con código <code className="px-1 bg-amber-500/20 rounded text-xs">EXT-XXX</code>.
          Se incluyen automáticamente en Valuaciones y en el Cuadro de Cierre.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : extras?.length === 0 ? (
        <div className="p-12 text-center bg-muted/20 border border-dashed border-border rounded-xl text-muted-foreground">
          <p className="font-medium">Sin obras extra registradas</p>
          <p className="text-xs mt-1">Haga clic en "Nueva Obra Extra" para registrar una partida adicional.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-4 py-2.5 text-left">Código</th>
                <th className="px-4 py-2.5 text-left">Descripción</th>
                <th className="px-4 py-2.5 text-center">Unidad</th>
                <th className="px-4 py-2.5 text-right">Cantidad</th>
                <th className="px-4 py-2.5 text-right">P.U.</th>
                <th className="px-4 py-2.5 text-right">Monto</th>
                <th className="px-4 py-2.5 text-left">Motivo</th>
                <th className="px-4 py-2.5 text-left">F. Aprob.</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {extras!.map(item => (
                <tr key={item.id} className="border-b border-border/50 hover:bg-accent/20">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                      {item.codigoPartida}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm max-w-[200px]">
                    <span className="line-clamp-2">{item.descripcion}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{item.unidad ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-mono">{Number(item.cantidad).toLocaleString("es-VE")}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatCurrency(Number(item.precioUnitario), "")}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-primary">
                    {formatCurrency(Number(item.montoTotal), project?.moneda?.simbolo)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[120px] truncate">{item.motivo ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{item.fechaAprobacion ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleOpen(item)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => { if (confirm(`¿Eliminar ${item.codigoPartida}?`)) deleteMutation.mutate(item.id); }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/20 border-t-2 border-border">
                <td colSpan={5} className="px-4 py-3 text-sm font-semibold text-right">TOTAL OBRAS EXTRA</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-primary">
                  {formatCurrency(montoTotal, project?.moneda?.simbolo)}
                </td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <FormDialog
        open={isDialogOpen}
        onOpenChange={(open) => { if (!open) handleClose(); }}
        title={editingItem ? `Editar ${editingItem.codigoPartida}` : "Nueva Obra Extra"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Código EXT</label>
              <input type="text" value={form.codigoPartida} onChange={e => setForm({ ...form, codigoPartida: e.target.value })}
                required placeholder="EXT-001" className="w-full px-3 py-2 border rounded-lg bg-input font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unidad</label>
              <input type="text" value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })}
                placeholder="m2, m3, Und..." className="w-full px-3 py-2 border rounded-lg bg-input" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
              required rows={2} placeholder="Descripción del trabajo adicional..."
              className="w-full px-3 py-2 border rounded-lg bg-input resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cantidad</label>
              <input type="number" step="any" value={form.cantidad} onChange={e => setForm({ ...form, cantidad: e.target.value })}
                required className="w-full px-3 py-2 border rounded-lg bg-input font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Precio Unitario</label>
              <input type="number" step="any" value={form.precioUnitario} onChange={e => setForm({ ...form, precioUnitario: e.target.value })}
                required className="w-full px-3 py-2 border rounded-lg bg-input font-mono" />
            </div>
          </div>

          {form.cantidad && form.precioUnitario && (
            <div className="px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Monto calculado:</span>
              <span className="font-mono font-bold text-primary">
                {formatCurrency(Number(form.cantidad) * Number(form.precioUnitario), project?.moneda?.simbolo)}
              </span>
            </div>
          )}

          {apus && apus.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">Vincular APU <span className="text-muted-foreground font-normal">(opcional)</span></label>
              <select value={form.apuId} onChange={e => setForm({ ...form, apuId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-input">
                <option value="">Sin APU vinculado</option>
                {apus.map((a: any) => (
                  <option key={a.id} value={a.id}>{a.codigo} — {a.descripcion?.substring(0, 50)}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Motivo / Justificación</label>
            <textarea value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })}
              rows={2} placeholder="Razón del trabajo adicional..."
              className="w-full px-3 py-2 border rounded-lg bg-input resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fecha de Aprobación</label>
            <input type="date" value={form.fechaAprobacion} onChange={e => setForm({ ...form, fechaAprobacion: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-input" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {editingItem ? "Guardar Cambios" : "Crear Obra Extra"}
            </Button>
          </div>
        </form>
      </FormDialog>
    </div>
  );
}
