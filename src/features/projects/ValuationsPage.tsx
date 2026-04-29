import { useState } from "react";
import { useOutletContext } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { formatCurrency } from "@/utils/cn";
import { Button } from "@/components/ui/FormPrimitives";
import { FormDialog } from "@/components/ui/FormDialog";
import { Loader2, Plus, ArrowLeft } from "lucide-react";

export function ValuationsPage() {
  const { project } = useOutletContext<{ project: any }>();
  const id = project?.id;
  const queryClient = useQueryClient();

  const [activeValuation, setActiveValuation] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [newDateFrom, setNewDateFrom] = useState("");
  const [newDateTo, setNewDateTo] = useState("");

  const { data: valuations, isLoading } = useQuery({
    queryKey: ["valuations", id],
    queryFn: () => api.get(`/projects/${id}/valuations`).then(r => r.data),
    enabled: !!id,
  });

  const { data: details, isLoading: loadingDetails } = useQuery({
    queryKey: ["valuations", "details", activeValuation?.id],
    queryFn: () => api.get(`/projects/${id}/valuations/${activeValuation?.id}/details`).then(r => r.data),
    enabled: !!activeValuation?.id, // never fire if id is undefined
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post(`/projects/${id}/valuations`, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["valuations", id] });
      setIsCreating(false);
      setActiveValuation(res.data); // extract .data from Axios response
    }
  });

  const updateDetailsMutation = useMutation({
    mutationFn: (data: any[]) => api.put(`/projects/${id}/valuations/${activeValuation?.id}/details`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["valuations", "details", activeValuation?.id] });
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      numero: Number(newNumber),
      fechaDesde: newDateFrom || null,
      fechaHasta: newDateTo || null,
      estatus: "borrador"
    });
  };

  const [edits, setEdits] = useState<Record<string, string>>({});

  const handleSaveDetails = () => {
    const payload = Object.entries(edits).map(([itemId, val]) => ({
      id: itemId,
      cantidadValuada: val
    }));
    updateDetailsMutation.mutate(payload, {
      onSuccess: () => setEdits({})
    });
  };

  if (!activeValuation) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Valuaciones de Obra</h2>
          <Button onClick={() => {
            setNewNumber(String((valuations?.length || 0) + 1));
            setIsCreating(true);
          }} size="sm">
            <Plus size={16} /> Crear Valuación
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : valuations?.length === 0 ? (
          <div className="p-8 text-center bg-muted/20 border border-dashed border-border rounded-xl text-muted-foreground">
            No hay valuaciones registradas.
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="px-4 py-2 text-left">Número</th>
                  <th className="px-4 py-2 text-left">Periodo</th>
                  <th className="px-4 py-2 text-left">Estatus</th>
                  <th className="px-4 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {valuations.map((v: any) => (
                  <tr key={v.id} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="px-4 py-3 font-medium">Valuación Nº {v.numero}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {v.fechaDesde ? v.fechaDesde : "Inicio"} - {v.fechaHasta ? v.fechaHasta : "Fin"}
                    </td>
                    <td className="px-4 py-3 capitalize">{v.estatus}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="secondary" size="sm" onClick={() => setActiveValuation(v)}>
                        Editar Detalles
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <FormDialog open={isCreating} onOpenChange={setIsCreating} title="Nueva Valuación">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Número de Valuación</label>
              <input type="number" value={newNumber} onChange={e => setNewNumber(e.target.value)} required className="w-full px-3 py-2 border rounded-lg bg-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fecha Desde</label>
                <input type="date" value={newDateFrom} onChange={e => setNewDateFrom(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha Hasta</label>
                <input type="date" value={newDateTo} onChange={e => setNewDateTo(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-input" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setIsCreating(false)}>Cancelar</Button>
              <Button type="submit" loading={createMutation.isPending}>Crear</Button>
            </div>
          </form>
        </FormDialog>
      </div>
    );
  }

  // Active valuation details
  let totalMontoValuado = 0;
  if (details) {
    details.forEach((d: any) => {
      const q = Number(edits[d.id] ?? d.cantidadValuada);
      const pu = Number(d.precioUnitario);
      totalMontoValuado += (q * pu);
    });
  }

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => { setActiveValuation(null); setEdits({}); }} className="p-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/80">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-lg font-bold">Valuación Nº {activeValuation.numero}</h2>
            <p className="text-sm text-muted-foreground capitalize">Estatus: {activeValuation.estatus}</p>
          </div>
        </div>
        <div className="text-right flex items-center gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Monto Facturado (Base)</p>
            <p className="text-xl font-mono font-bold text-primary">{formatCurrency(totalMontoValuado, project?.moneda?.simbolo)}</p>
          </div>
          {Object.keys(edits).length > 0 && (
            <Button onClick={handleSaveDetails} loading={updateDetailsMutation.isPending}>
              Guardar Cambios
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        {loadingDetails ? (
           <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : (
          <table className="w-full text-xs min-w-[800px]">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-4 py-2 text-left">Nº</th>
                <th className="px-4 py-2 text-left">Código</th>
                <th className="px-4 py-2 text-right">Cant. Orig.</th>
                <th className="px-4 py-2 text-right">Acum. Ant.</th>
                <th className="px-4 py-2 text-right">P.U.</th>
                <th className="px-4 py-2 text-right">Esta Valuación</th>
                <th className="px-4 py-2 text-right">Acum. Total</th>
                <th className="px-4 py-2 text-right">Pendiente</th>
                <th className="px-4 py-2 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {details.map((d: any) => {
                  const q = edits[d.id] ?? d.cantidadValuada;
                  const pu = Number(d.precioUnitario);
                  const sub = Number(q) * pu;
                  const orig = Number(d.cantidadOriginal ?? 0);
                  const prevAcum = Number(d.cantidadAcumulada ?? 0);
                  const newAcum = prevAcum - Number(d.cantidadValuada ?? 0) + Number(q);
                  const pendiente = orig - newAcum;
                  const isOverrun = newAcum > orig + 0.0001;
                  const isComplete = Math.abs(pendiente) < 0.0001;

                  return (
                    <tr key={d.id} className="border-b border-border/50 hover:bg-accent/20">
                      <td className="px-4 py-2 text-muted-foreground">{d.numeroPar}</td>
                      <td className="px-4 py-2 font-mono text-primary">{d.codigoPartida}</td>
                      <td className="px-4 py-2 text-right font-mono text-muted-foreground">{Number(d.cantidadOriginal).toLocaleString("es-VE")}</td>
                      <td className="px-4 py-2 text-right font-mono text-muted-foreground">{prevAcum.toLocaleString("es-VE")}</td>
                      <td className="px-4 py-2 text-right font-mono">{formatCurrency(pu, "")}</td>
                      <td className="px-4 py-2 text-right">
                        <input
                          type="number"
                          className="w-24 px-2 py-1 text-right font-mono bg-input border border-border rounded focus:ring-1 focus:ring-primary"
                          value={q}
                          onChange={e => setEdits({ ...edits, [d.id]: e.target.value })}
                          step="any"
                        />
                      </td>
                      <td className={`px-4 py-2 text-right font-mono text-xs ${
                        isComplete ? 'text-emerald-500 font-semibold' :
                        isOverrun  ? 'text-red-500 font-semibold' :
                        'text-muted-foreground'
                      }`}>
                        {isComplete ? '✓ Completa' :
                         isOverrun  ? `▲ +${Math.abs(pendiente).toLocaleString('es-VE', { maximumFractionDigits: 4 })}` :
                         pendiente.toLocaleString('es-VE', { maximumFractionDigits: 4 })
                        }
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-xs text-muted-foreground">
                        {newAcum.toLocaleString('es-VE', { maximumFractionDigits: 4 })}
                      </td>
                      <td className="px-4 py-2 text-right font-mono font-medium">{formatCurrency(sub, "")}</td>
                    </tr>
                  );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
