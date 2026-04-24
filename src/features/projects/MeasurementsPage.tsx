import { useState } from "react";
import { useOutletContext } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { formatCurrency } from "@/utils/cn";
import { Button } from "@/components/ui/FormPrimitives";
import { FormDialog } from "@/components/ui/FormDialog";
import { Loader2, Plus, ArrowLeft, Trash2, CheckCircle2 } from "lucide-react";

export function MeasurementsPage() {
  const { project } = useOutletContext<{ project: any }>();
  const id = project?.id;
  const queryClient = useQueryClient();

  const [activeMeasurement, setActiveMeasurement] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newType, setNewType] = useState("medicion");

  const { data: measurements, isLoading } = useQuery({
    queryKey: ["measurements", id],
    queryFn: () => api.get(`/projects/${id}/measurements`).then(r => r.data),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post(`/projects/${id}/measurements`, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["measurements", id] });
      setIsCreating(false);
      setActiveMeasurement(res.data); // extract .data from Axios response
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      numero: Number(newNumber),
      fecha: newDate || new Date().toISOString().split('T')[0],
      tipo: newType,
    });
  };

  if (!activeMeasurement) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Cómputos Métricos / Mediciones</h2>
          <Button onClick={() => {
            setNewNumber(String((measurements?.length || 0) + 1));
            setNewDate(new Date().toISOString().split('T')[0]);
            setIsCreating(true);
          }} size="sm">
            <Plus size={16} /> Crear Cómputo
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : measurements?.length === 0 ? (
          <div className="p-8 text-center bg-muted/20 border border-dashed border-border rounded-xl text-muted-foreground">
            No hay cómputos métricos registrados.
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="px-4 py-2 text-left">Número</th>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-left">Tipo</th>
                  <th className="px-4 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m: any) => (
                  <tr key={m.id} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="px-4 py-3 font-medium">Cómputo Nº {m.numero}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.fecha}</td>
                    <td className="px-4 py-3 capitalize">{m.tipo}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="secondary" size="sm" onClick={() => setActiveMeasurement(m)}>
                        Abrir Detalles
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <FormDialog open={isCreating} onOpenChange={setIsCreating} title="Nuevo Cómputo Métrico">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Número</label>
              <input type="number" value={newNumber} onChange={e => setNewNumber(e.target.value)} required className="w-full px-3 py-2 border rounded-lg bg-input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha</label>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-input">
                <option value="medicion">Medición Inicial</option>
                <option value="recalculo">Recálculo</option>
                <option value="ajuste">Ajuste / Cierre</option>
              </select>
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

  return (
    <MeasurementDetails 
      measurement={activeMeasurement} 
      projectId={id}
      onBack={() => setActiveMeasurement(null)}
    />
  );
}

// ----------------------------------------
// MeasurementDetails Component
// ----------------------------------------

function MeasurementDetails({ measurement, projectId, onBack }: { measurement: any, projectId: string, onBack: () => void }) {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [isAddingLine, setIsAddingLine] = useState(false);
  const [newLine, setNewLine] = useState({ descripcion: "", iguales: "1", largo: "", ancho: "", alto: "" });

  const { data: budget } = useQuery({
    queryKey: ["budget", projectId],
    queryFn: () => api.get(`/projects/${projectId}/budget`).then(r => r.data),
  });

  const allProjectItems = budget?.capitulos?.flatMap((c: any) => c.partidas) || [];

  const { data: details, isLoading } = useQuery({
    queryKey: ["measurements", "details", measurement.id],
    queryFn: () => api.get(`/projects/${projectId}/measurements/${measurement.id}/details`).then(r => r.data),
    enabled: !!measurement?.id, // never fire if id is undefined
  });

  const addLineMutation = useMutation({
    mutationFn: (data: any) => api.post(`/projects/${projectId}/measurements/${measurement.id}/details`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements", "details", measurement.id] });
      setIsAddingLine(false);
      setNewLine({ descripcion: "", iguales: "1", largo: "", ancho: "", alto: "" });
    }
  });

  const deleteLineMutation = useMutation({
    mutationFn: (detailId: string) => api.delete(`/projects/${projectId}/measurements/${measurement.id}/details/${detailId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["measurements", "details", measurement.id] })
  });

  const applyMutation = useMutation({
    mutationFn: () => api.post(`/projects/${projectId}/measurements/${measurement.id}/apply`),
    onSuccess: () => {
      alert("Cantidades del presupuesto actualizadas correctamente.");
      queryClient.invalidateQueries({ queryKey: ["budget", projectId] });
    }
  });

  const handleAddLine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    addLineMutation.mutate({
      projectItemId: selectedItem,
      ...newLine
    });
  };

  // Group details by project item
  const grouped = details?.reduce((acc: any, curr: any) => {
    if (!acc[curr.projectItemId]) acc[curr.projectItemId] = { item: curr, lines: [], total: 0 };
    acc[curr.projectItemId].lines.push(curr);
    acc[curr.projectItemId].total += Number(curr.total);
    return acc;
  }, {});

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/80">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-lg font-bold">Cómputo Nº {measurement.numero}</h2>
            <p className="text-sm text-muted-foreground">Fecha: {measurement.fecha}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsAddingLine(true)}>
            <Plus size={16} /> Añadir Línea
          </Button>
          <Button onClick={() => {
            if(confirm("¿Está seguro de sobrescribir las cantidades del presupuesto base con los totales de este cómputo?")) {
              applyMutation.mutate();
            }
          }} loading={applyMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <CheckCircle2 size={16} /> Actualizar Presupuesto
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : Object.keys(grouped || {}).length === 0 ? (
        <div className="p-8 text-center bg-muted/20 border border-dashed border-border rounded-xl text-muted-foreground">
          No hay líneas de cálculo. Haga clic en "Añadir Línea".
        </div>
      ) : (
        <div className="space-y-6">
          {Object.values(grouped).map((group: any) => (
            <div key={group.item.projectItemId} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex justify-between items-center">
                <span className="font-mono text-primary font-medium">{group.item.codigoPartida}</span>
                <span className="text-sm font-bold text-emerald-600">Total: {formatCurrency(group.total, "")}</span>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground bg-muted/10">
                    <th className="px-4 py-2 text-left">Descripción / Ubicación</th>
                    <th className="px-4 py-2 text-right">Iguales</th>
                    <th className="px-4 py-2 text-right">Largo</th>
                    <th className="px-4 py-2 text-right">Ancho</th>
                    <th className="px-4 py-2 text-right">Alto</th>
                    <th className="px-4 py-2 text-right font-bold text-foreground">Total Línea</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {group.lines.map((line: any) => (
                    <tr key={line.id} className="border-b border-border/30 hover:bg-accent/20">
                      <td className="px-4 py-2 text-muted-foreground">{line.descripcion || "-"}</td>
                      <td className="px-4 py-2 text-right">{Number(line.iguales)}</td>
                      <td className="px-4 py-2 text-right">{line.largo ? Number(line.largo) : "-"}</td>
                      <td className="px-4 py-2 text-right">{line.ancho ? Number(line.ancho) : "-"}</td>
                      <td className="px-4 py-2 text-right">{line.alto ? Number(line.alto) : "-"}</td>
                      <td className="px-4 py-2 text-right font-mono font-medium">{formatCurrency(line.total, "")}</td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={() => deleteLineMutation.mutate(line.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      <FormDialog open={isAddingLine} onOpenChange={setIsAddingLine} title="Añadir Línea de Cálculo">
        <form onSubmit={handleAddLine} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Partida del Presupuesto</label>
            <select value={selectedItem} onChange={e => setSelectedItem(e.target.value)} required className="w-full px-3 py-2 border rounded-lg bg-input">
              <option value="">Seleccione una partida...</option>
              {allProjectItems.map((p: any) => (
                <option key={p.id} value={p.id}>{p.codigoPartida} - {p.descripcion?.substring(0, 50)}...</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción / Ubicación (Opcional)</label>
            <input type="text" value={newLine.descripcion} onChange={e => setNewLine({...newLine, descripcion: e.target.value})} placeholder="Ej: Eje A-B" className="w-full px-3 py-2 border rounded-lg bg-input" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium mb-1">Iguales</label>
              <input type="number" step="any" value={newLine.iguales} onChange={e => setNewLine({...newLine, iguales: e.target.value})} required className="w-full px-2 py-2 border rounded-lg bg-input" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Largo</label>
              <input type="number" step="any" value={newLine.largo} onChange={e => setNewLine({...newLine, largo: e.target.value})} className="w-full px-2 py-2 border rounded-lg bg-input" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Ancho</label>
              <input type="number" step="any" value={newLine.ancho} onChange={e => setNewLine({...newLine, ancho: e.target.value})} className="w-full px-2 py-2 border rounded-lg bg-input" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Alto</label>
              <input type="number" step="any" value={newLine.alto} onChange={e => setNewLine({...newLine, alto: e.target.value})} className="w-full px-2 py-2 border rounded-lg bg-input" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsAddingLine(false)}>Cancelar</Button>
            <Button type="submit" loading={addLineMutation.isPending}>Añadir</Button>
          </div>
        </form>
      </FormDialog>
    </div>
  );
}
