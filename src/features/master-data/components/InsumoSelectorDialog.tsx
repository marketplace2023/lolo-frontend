import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { FormDialog } from "@/components/ui/FormDialog";
import { Button } from "@/components/ui/FormPrimitives";
import { Search } from "lucide-react";
import { formatCurrency } from "@/utils/cn";

interface IInsumoSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipo: "materiales" | "equipos" | "manoDeObra";
  onSelect: (insumoId: string, tipo: string, cantidad: string, insumoData?: any) => void;
  isSubmitting: boolean;
}

export function InsumoSelectorDialog({ open, onOpenChange, tipo, onSelect, isSubmitting }: IInsumoSelectorDialogProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedInsumo, setSelectedInsumo] = useState<any>(null);
  const [cantidad, setCantidad] = useState("");

  const endpointMap = {
    materiales: "/materials",
    equipos: "/equipments",
    manoDeObra: "/labors",
  };

  const tipoBackendMap = {
    materiales: "material",
    equipos: "equipo",
    manoDeObra: "manoDeObra",
  };

  const endpoint = endpointMap[tipo];

  const { data, isLoading } = useQuery({
    queryKey: [endpoint, search, page],
    queryFn: () => api.get(endpoint, { params: { search, limit: 20, page } }).then((r) => r.data),
    enabled: open,
  });

  const handleClose = () => {
    setSelectedInsumo(null);
    setCantidad("");
    setSearch("");
    setPage(1);
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInsumo && cantidad) {
      onSelect(selectedInsumo.id, tipoBackendMap[tipo], cantidad, selectedInsumo);
      handleClose();
    }
  };

  return (
    <FormDialog 
      open={open} 
      onOpenChange={(v) => !v && handleClose()} 
      title={`Añadir ${tipo === "materiales" ? "Material" : tipo === "equipos" ? "Equipo" : "Mano de Obra"}`}
      size="lg"
    >
      {!selectedInsumo ? (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por código o descripción..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
                      <td className="px-3 py-2 text-right font-mono">
                        {formatCurrency(item.precio ?? item.salarioBase ?? item.costoHorario, "")}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Button size="sm" onClick={() => setSelectedInsumo(item)}>Seleccionar</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {data?.pagination && data.pagination.pages > 1 && !selectedInsumo && (
            <div className="flex items-center justify-between px-2 pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Página {data.pagination.page} de {data.pagination.pages}
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  disabled={page === 1} 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Anterior
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  disabled={page === data.pagination.pages} 
                  onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-muted/30 border border-border rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-mono text-xs text-primary font-medium">{selectedInsumo.codigo}</p>
                <p className="text-sm font-medium">{selectedInsumo.descripcion}</p>
              </div>
              <button type="button" onClick={() => setSelectedInsumo(null)} className="text-xs text-blue-500 hover:underline">Cambiar</button>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground mt-4">
              <p>Unidad: <span className="font-medium text-foreground">{selectedInsumo.unidad}</span></p>
              <p>Precio Ref: <span className="font-mono text-foreground">{formatCurrency(selectedInsumo.precio ?? selectedInsumo.salarioBase ?? selectedInsumo.costoHorario)}</span></p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Cantidad a utilizar
            </label>
            <input 
              type="number" 
              step="any"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="Ej: 1.5"
              required
              className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring focus:outline-none"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" loading={isSubmitting}>Agregar al APU</Button>
          </div>
        </form>
      )}
    </FormDialog>
  );
}
