import { useState } from "react";
import { useOutletContext } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { formatCurrency } from "@/utils/cn";
import { Button } from "@/components/ui/FormPrimitives";
import { FormDialog } from "@/components/ui/FormDialog";
import { Loader2, Plus, ArrowLeft } from "lucide-react";

export function VariationPage({ type }: { type: "aumentos" | "disminuciones" }) {
  const { project } = useOutletContext<{ project: any }>();
  const id = project?.id;
  const queryClient = useQueryClient();

  const [activeVariation, setActiveVariation] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newDate, setNewDate] = useState("");

  const label = type === "aumentos" ? "Aumento" : "Disminución";
  const pluralLabel = type === "aumentos" ? "Aumentos" : "Disminuciones";

  // Fetch list
  const { data: variations, isLoading } = useQuery({
    queryKey: [type, id],
    queryFn: () => api.get(`/projects/${id}/${type}`).then(r => r.data),
    enabled: !!id,
  });

  // Fetch details when one is active
  const { data: details, isLoading: loadingDetails } = useQuery({
    queryKey: [type, "details", activeVariation?.id],
    queryFn: () => api.get(`/projects/${id}/${type}/${activeVariation?.id}/details`).then(r => r.data),
    enabled: !!activeVariation?.id, // never fire if id is undefined
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post(`/projects/${id}/${type}`, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [type, id] });
      setIsCreating(false);
      setActiveVariation(res.data); // extract .data from Axios response
    }
  });

  const updateDetailsMutation = useMutation({
    mutationFn: (data: any[]) => api.put(`/projects/${id}/${type}/${activeVariation?.id}/details`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type, "details", activeVariation?.id] });
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      numero: Number(newNumber),
      titulo: newTitle,
      fecha: newDate || new Date().toISOString().split('T')[0]
    });
  };

  const [edits, setEdits] = useState<Record<string, string>>({});

  const handleSaveDetails = () => {
    const payload = Object.entries(edits).map(([itemId, val]) => ({
      id: itemId,
      [type === "aumentos" ? "cantidadAumento" : "cantidadDisminucion"]: val
    }));
    updateDetailsMutation.mutate(payload, {
      onSuccess: () => setEdits({})
    });
  };

  if (!activeVariation) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">{pluralLabel}</h2>
          <Button onClick={() => {
            setNewNumber(String((variations?.length || 0) + 1));
            setNewTitle(`Presupuesto de ${label} Nº ${String((variations?.length || 0) + 1)}`);
            setNewDate(new Date().toISOString().split('T')[0]);
            setIsCreating(true);
          }} size="sm">
            <Plus size={16} /> Crear {label}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : variations?.length === 0 ? (
          <div className="p-8 text-center bg-muted/20 border border-dashed border-border rounded-xl text-muted-foreground">
            No hay {pluralLabel.toLowerCase()} registrados.
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="px-4 py-2 text-left">Número</th>
                  <th className="px-4 py-2 text-left">Título</th>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {variations.map((v: any) => (
                  <tr key={v.id} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="px-4 py-3">{v.numero}</td>
                    <td className="px-4 py-3 font-medium">{v.titulo}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.fecha}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="secondary" size="sm" onClick={() => setActiveVariation(v)}>
                        Editar Detalles
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <FormDialog open={isCreating} onOpenChange={setIsCreating} title={`Nuevo ${label}`}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Número</label>
              <input type="number" value={newNumber} onChange={e => setNewNumber(e.target.value)} required className="w-full px-3 py-2 border rounded-lg bg-input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Título</label>
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} required className="w-full px-3 py-2 border rounded-lg bg-input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha</label>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} required className="w-full px-3 py-2 border rounded-lg bg-input" />
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

  // Active variation details
  const fieldName = type === "aumentos" ? "cantidadAumento" : "cantidadDisminucion";
  
  let totalVariation = 0;
  if (details) {
    details.forEach((d: any) => {
      const q = Number(edits[d.id] ?? d[fieldName]);
      const pu = Number(d.precioUnitario);
      totalVariation += (q * pu);
    });
  }

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => { setActiveVariation(null); setEdits({}); }} className="p-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/80">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-lg font-bold">{activeVariation.titulo}</h2>
            <p className="text-sm text-muted-foreground">{label} Nº {activeVariation.numero} · Fecha: {activeVariation.fecha}</p>
          </div>
        </div>
        <div className="text-right flex items-center gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Monto Base {label}</p>
            <p className="text-xl font-mono font-bold text-primary">{formatCurrency(totalVariation, project?.moneda?.simbolo)}</p>
          </div>
          {Object.keys(edits).length > 0 && (
            <Button onClick={handleSaveDetails} loading={updateDetailsMutation.isPending}>
              Guardar Cambios
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loadingDetails ? (
           <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-4 py-2 text-left">Nº</th>
                <th className="px-4 py-2 text-left">Código</th>
                <th className="px-4 py-2 text-right">Cant. Original</th>
                <th className="px-4 py-2 text-right">P.U.</th>
                <th className="px-4 py-2 text-right">Cant. {label}</th>
                <th className="px-4 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {details.map((d: any) => {
                const q = edits[d.id] ?? d[fieldName];
                const pu = Number(d.precioUnitario);
                const sub = Number(q) * pu;

                return (
                  <tr key={d.id} className="border-b border-border/50 hover:bg-accent/20">
                    <td className="px-4 py-2 text-muted-foreground">{d.numeroPar}</td>
                    <td className="px-4 py-2 font-mono text-primary">{d.codigoPartida}</td>
                    <td className="px-4 py-2 text-right font-mono">{Number(d.cantidadOriginal).toLocaleString("es-VE")}</td>
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
