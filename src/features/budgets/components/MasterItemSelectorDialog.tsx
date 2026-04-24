import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { FormDialog } from "@/components/ui/FormDialog";
import { Button } from "@/components/ui/FormPrimitives";
import { Search, Loader2 } from "lucide-react";
import { formatCurrency } from "@/utils/cn";

interface IMasterItemSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapterId: string | null;
  projectId: string;
}

export function MasterItemSelectorDialog({ open, onOpenChange, chapterId, projectId }: IMasterItemSelectorDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [numeroPar, setNumeroPar] = useState("");
  const [cantidad, setCantidad] = useState("");
  
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["items", search],
    queryFn: () => api.get("/items", { params: { search, limit: 10 } }).then((r) => r.data),
    enabled: open,
  });

  const addMutation = useMutation({
    mutationFn: (payload: any) => api.post(`/chapters/${chapterId}/items`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget", projectId] });
      handleClose();
    }
  });

  const handleClose = () => {
    setSelectedItem(null);
    setCantidad("");
    setNumeroPar("");
    setSearch("");
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem && cantidad && chapterId) {
      addMutation.mutate({
        masterItemId: selectedItem.id,
        numeroPar: numeroPar,
        cantidad: cantidad
      });
    }
  };

  return (
    <FormDialog 
      open={open} 
      onOpenChange={(v) => !v && handleClose()} 
      title="Añadir Partida al Capítulo"
      size="lg"
    >
      {!selectedItem ? (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por código o descripción en el Maestro de Partidas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>

          <div className="h-[300px] overflow-y-auto border border-border rounded-lg bg-muted/10">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground text-sm">Buscando...</div>
            ) : data?.data?.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">No se encontraron resultados</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-3 py-2 text-left font-medium">Código</th>
                    <th className="px-3 py-2 text-left font-medium">Descripción</th>
                    <th className="px-3 py-2 text-left font-medium">Und.</th>
                    <th className="px-3 py-2 text-right font-medium">Precio</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.map((item: any) => (
                    <tr key={item.id} className="border-b border-border/50 hover:bg-accent/30">
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{item.codigo}</td>
                      <td className="px-3 py-2 max-w-[200px] truncate" title={item.descripcion}>{item.descripcion}</td>
                      <td className="px-3 py-2 text-xs">{item.unidad}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatCurrency(item.precioUnitario, "")}</td>
                      <td className="px-3 py-2 text-right">
                        <Button size="sm" onClick={() => setSelectedItem(item)}>Seleccionar</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-muted/30 border border-border rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-mono text-xs text-primary font-medium">{selectedItem.codigo}</p>
                <p className="text-sm font-medium">{selectedItem.descripcion}</p>
              </div>
              <button type="button" onClick={() => setSelectedItem(null)} className="text-xs text-blue-500 hover:underline">Cambiar</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Número de Partida (Ej. 1.1)
              </label>
              <input 
                type="text" 
                value={numeroPar}
                onChange={(e) => setNumeroPar(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Cantidad Inicial
              </label>
              <input 
                type="number" 
                step="any"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" loading={addMutation.isPending}>Añadir al Presupuesto</Button>
          </div>
        </form>
      )}
    </FormDialog>
  );
}
