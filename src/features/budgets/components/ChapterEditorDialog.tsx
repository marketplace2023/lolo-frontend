import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { FormDialog } from "@/components/ui/FormDialog";
import { Button } from "@/components/ui/FormPrimitives";

interface IChapterEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  chapter?: any; // If editing, pass chapter object
}

export function ChapterEditorDialog({ open, onOpenChange, projectId, chapter }: IChapterEditorDialogProps) {
  const [numero, setNumero] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      if (chapter) {
        setNumero(String(chapter.numero));
        setDescripcion(chapter.descripcion);
      } else {
        setNumero("");
        setDescripcion("");
      }
    }
  }, [open, chapter]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (chapter) return api.put(`/chapters/${chapter.id}`, data);
      return api.post(`/projects/${projectId}/chapters`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget", projectId] });
      onOpenChange(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ numero, descripcion });
  };

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={chapter ? "Editar Capítulo" : "Nuevo Capítulo"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Número de Capítulo (Orden)</label>
          <input 
            type="number" 
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg bg-input focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <input 
            type="text" 
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            placeholder="Ej: Obras Preliminares"
            className="w-full px-3 py-2 border rounded-lg bg-input focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="submit" loading={saveMutation.isPending}>Guardar</Button>
        </div>
      </form>
    </FormDialog>
  );
}
