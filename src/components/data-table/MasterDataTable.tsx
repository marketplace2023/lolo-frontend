import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Search, ChevronLeft, ChevronRight, Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { FormDialog } from "@/components/ui/FormDialog";
import { Button } from "@/components/ui/FormPrimitives";

export interface IColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface IFormField {
  key: string;
  label: string;
  type?: "text" | "number" | "email" | "date" | "select" | "checkbox";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  hint?: string;
}

interface IDataTableProps<T> {
  title: string;
  queryKey: string;
  endpoint: string;
  columns: IColumn<T>[];
  formFields?: IFormField[];
  searchPlaceholder?: string;
  /** If false, hide create/edit/delete buttons. Default true. */
  editable?: boolean;
}

function FormBody({
  fields,
  values,
  onChange,
}: {
  fields: IFormField[];
  values: Record<string, string | boolean>;
  onChange: (key: string, val: string | boolean) => void;
}) {
  return (
    <div className="space-y-3">
      {fields.map((f) => (
        <div key={f.key} className="space-y-1">
          <label className="block text-xs font-medium text-muted-foreground">
            {f.label}{f.required && <span className="text-destructive ml-0.5">*</span>}
          </label>
          {f.type === "select" ? (
            <select
              value={String(values[f.key] ?? "")}
              onChange={(e) => onChange(f.key, e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">-- seleccione --</option>
              {f.options?.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          ) : f.type === "checkbox" ? (
            <input
              type="checkbox"
              checked={Boolean(values[f.key])}
              onChange={(e) => onChange(f.key, e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
            />
          ) : (
            <input
              type={f.type ?? "text"}
              value={String(values[f.key] ?? "")}
              onChange={(e) => onChange(f.key, e.target.value)}
              placeholder={f.placeholder}
              required={f.required}
              className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          )}
          {f.hint && <p className="text-[11px] text-muted-foreground">{f.hint}</p>}
        </div>
      ))}
    </div>
  );
}

export function MasterDataTable<T extends Record<string, unknown>>({
  title, queryKey, endpoint, columns, formFields = [], searchPlaceholder = "Buscar...", editable = true,
}: IDataTableProps<T>) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState<T | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | boolean>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: [queryKey, page, search],
    queryFn: () => api.get(endpoint, { params: { page, limit: 50, search } }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post(endpoint, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [queryKey] }); setDialogOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.put(`${endpoint}/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [queryKey] }); setDialogOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`${endpoint}/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [queryKey] }); setDeleteId(null); },
  });

  const rows: T[] = data?.data ?? [];
  const pagination = data?.pagination;

  const openCreate = () => {
    setEditRow(null);
    setFormValues({});
    setDialogOpen(true);
  };

  const openEdit = (row: T) => {
    setEditRow(row);
    const vals: Record<string, string | boolean> = {};
    formFields.forEach((f) => {
      const v = row[f.key as keyof T];
      vals[f.key] = f.type === "checkbox" ? Boolean(v) : String(v ?? "");
    });
    setFormValues(vals);
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body: Record<string, unknown> = {};
    formFields.forEach((f) => {
      if (f.type === "number") body[f.key] = Number(formValues[f.key]) || 0;
      else if (f.type === "checkbox") body[f.key] = Boolean(formValues[f.key]);
      else body[f.key] = formValues[f.key] ?? null;
    });
    if (editRow) {
      updateMutation.mutate({ id: String(editRow.id), body });
    } else {
      createMutation.mutate(body);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(inputValue);
    setPage(1);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          {pagination && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {Number(pagination.total).toLocaleString()} registros
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring w-56"
              />
            </div>
            <button type="submit" className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-sm hover:bg-accent transition-colors">
              Buscar
            </button>
            {search && (
              <button type="button" onClick={() => { setSearch(""); setInputValue(""); setPage(1); }}
                className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-accent transition-colors text-muted-foreground">
                ✕
              </button>
            )}
          </form>
          {editable && formFields.length > 0 && (
            <button onClick={openCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors">
              <Plus size={14} /> Nuevo
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {columns.map((col) => (
                  <th key={String(col.key)} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
                {editable && formFields.length > 0 && (
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-12 text-center">
                    <Loader2 size={20} className="animate-spin mx-auto text-muted-foreground" />
                  </td>
                </tr>
              ) : isError ? (
                <tr><td colSpan={columns.length + 1} className="py-8 text-center text-destructive text-sm">Error cargando datos</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={columns.length + 1} className="py-8 text-center text-muted-foreground text-sm">No hay registros</td></tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    {columns.map((col) => (
                      <td key={String(col.key)} className="px-4 py-2 text-xs text-foreground">
                        {col.render ? col.render(row) : String(row[col.key as keyof T] ?? "")}
                      </td>
                    ))}
                    {editable && formFields.length > 0 && (
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(row)}
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => setDeleteId(String(row.id))}
                            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/10">
            <p className="text-xs text-muted-foreground">
              Página {pagination.page} de {pagination.pages}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1 rounded hover:bg-accent disabled:opacity-30 transition-colors">
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs px-2">{page}</span>
              <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                className="p-1 rounded hover:bg-accent disabled:opacity-30 transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editRow ? `Editar ${title.slice(0, -1)}` : `Nuevo ${title.slice(0, -1)}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormBody
            fields={formFields}
            values={formValues}
            onChange={(k, v) => setFormValues((prev) => ({ ...prev, [k]: v }))}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {editRow ? "Guardar cambios" : "Crear"}
            </Button>
          </div>
        </form>
      </FormDialog>

      {/* Delete Confirm Dialog */}
      <FormDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Confirmar eliminación"
        size="sm"
      >
        <p className="text-sm text-muted-foreground mb-4">
          ¿Está seguro de eliminar este registro? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button
            variant="destructive"
            loading={deleteMutation.isPending}
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
          >
            Eliminar
          </Button>
        </div>
      </FormDialog>
    </div>
  );
}
