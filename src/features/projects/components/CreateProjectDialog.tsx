import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { FormDialog } from "@/components/ui/FormDialog";
import { Button } from "@/components/ui/FormPrimitives";

interface ICreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({ open, onOpenChange }: ICreateProjectDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    codigo: "",
    descripcion: "",
    status: "N", // N: Normal, S: Activo
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => api.post("/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onOpenChange(false);
      setFormData({ codigo: "", descripcion: "", status: "N" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title="Crear Nuevo Proyecto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Código del Proyecto</label>
          <input 
            type="text" 
            value={formData.codigo}
            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
            required
            placeholder="Ej. EDIFICAC-2026"
            className="w-full px-3 py-2 border rounded-lg bg-input focus:ring-2 focus:ring-ring focus:outline-none uppercase font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descripción / Nombre</label>
          <input 
            type="text" 
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            required
            placeholder="Ej. Construcción de Módulo 3"
            className="w-full px-3 py-2 border rounded-lg bg-input focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select 
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg bg-input focus:ring-2 focus:ring-ring focus:outline-none"
          >
            <option value="N">Normal (Planificación)</option>
            <option value="S">Activo (Ejecución)</option>
          </select>
        </div>
        
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="submit" loading={createMutation.isPending}>Crear Proyecto</Button>
        </div>
      </form>
    </FormDialog>
  );
}
