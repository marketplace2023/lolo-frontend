import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Loader2 } from "lucide-react";

export function FamiliesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["families"],
    queryFn: () => api.get("/families").then((r) => r.data.data),
  });

  const grouped = (data ?? []).reduce((acc: Record<string, unknown[]>, f: Record<string, unknown>) => {
    const tipo = String(f.tipo);
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(f);
    return acc;
  }, {});

  const tipoLabel: Record<string, string> = {
    material: "Materiales",
    equipo: "Equipos",
    manoDeObra: "Mano de Obra",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Familias BCV</h1>
        <p className="text-xs text-muted-foreground mt-1">Clasificación BCV para índices de precios</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(grouped).map(([tipo, fams]) => (
            <div key={tipo} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/20">
                <h2 className="text-sm font-semibold text-foreground">{tipoLabel[tipo] ?? tipo}</h2>
                <p className="text-xs text-muted-foreground">{(fams as unknown[]).length} familias</p>
              </div>
              <div className="divide-y divide-border/50">
                {(fams as Record<string, unknown>[]).map((f) => (
                  <div key={String(f.id)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/20">
                    <span className="w-6 h-6 rounded bg-primary/10 text-primary text-xs font-mono flex items-center justify-center">{String(f.codigo)}</span>
                    <span className="text-xs text-foreground flex-1">{String(f.descripcion)}</span>
                    {f.referencia && <span className="text-[10px] text-muted-foreground">{String(f.referencia)}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
