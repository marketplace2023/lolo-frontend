import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";
import { FormDialog } from "@/components/ui/FormDialog";
import { Button } from "@/components/ui/FormPrimitives";
import { Loader2 } from "lucide-react";

interface IMemoriaEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectItemId: string | null;
  codigoPartida: string;
  descripcionPartida: string;
}

export function MemoriaEditorDialog({ open, onOpenChange, projectItemId, codigoPartida, descripcionPartida }: IMemoriaEditorDialogProps) {
  const [texto, setTexto] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["memoria", projectItemId],
    queryFn: () => api.get(`/project-items/${projectItemId}/memoria`).then(r => r.data),
    enabled: !!projectItemId && open,
  });

  useEffect(() => {
    if (data) {
      setTexto(data.texto || "");
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (newTexto: string) => api.put(`/project-items/${projectItemId}/memoria`, { texto: newTexto }),
    onSuccess: () => {
      onOpenChange(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(texto);
  };

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title="Memoria Descriptiva" size="lg">
      <div className="mb-4 text-sm text-muted-foreground">
        <p className="font-mono text-primary font-medium">{codigoPartida}</p>
        <p className="mt-1">{descripcionPartida}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Describa el procedimiento, normas o alcances de esta partida</label>
            <textarea 
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              className="w-full h-64 p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:outline-none resize-none"
              placeholder="Escriba aquí la memoria descriptiva..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" loading={saveMutation.isPending}>Guardar Memoria</Button>
          </div>
        </form>
      )}
    </FormDialog>
  );
}
