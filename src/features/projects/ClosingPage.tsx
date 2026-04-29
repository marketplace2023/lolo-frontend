import { useOutletContext } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { formatCurrency } from "@/utils/cn";
import { Loader2, TrendingUp, TrendingDown, Layers, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/FormPrimitives";

export function ClosingPage() {
  const { project } = useOutletContext<{ project: any }>();
  const id = project?.id;

  const { data: cierre, isLoading } = useQuery({
    queryKey: ["cierre", id],
    queryFn: () => api.get(`/projects/${id}/reports/cierre`).then(r => r.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-muted-foreground">
        <Loader2 className="animate-spin" size={32} />
        <p>Calculando liquidación final...</p>
      </div>
    );
  }

  if (!cierre) return null;

  const { lineItems, extraLineItems, totals } = cierre;

  // Group original items by chapter
  const byChapter: Record<string, { descripcion: string; items: typeof lineItems }> = {};
  for (const item of lineItems) {
    const key = item.chapterId ?? "sin-capitulo";
    if (!byChapter[key]) byChapter[key] = { descripcion: item.chapterDescripcion ?? "Sin Capítulo", items: [] };
    byChapter[key].items.push(item);
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Cuadro de Cierre de Obra</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Liquidación final del contrato — Original ± Variaciones + Extras = Monto Final
          </p>
        </div>
        <Button onClick={() => window.print()} variant="secondary" size="sm">
          Imprimir / PDF
        </Button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Monto Base Original</p>
          <p className="text-lg font-bold font-mono mt-1 text-foreground">
            {formatCurrency(totals.montoBase, project?.moneda?.simbolo)}
          </p>
        </div>
        <div className="bg-card border border-amber-500/30 rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Total Obras Extra</p>
          <p className="text-lg font-bold font-mono mt-1 text-amber-500">
            {formatCurrency(totals.montoExtras, project?.moneda?.simbolo)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Subtotal Actualizado</p>
          <p className="text-lg font-bold font-mono mt-1 text-primary">
            {formatCurrency(totals.montoTotal, project?.moneda?.simbolo)}
          </p>
        </div>
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
          <p className="text-xs text-muted-foreground">MONTO NETO A PAGAR</p>
          <p className="text-xl font-bold font-mono mt-1 text-primary">
            {formatCurrency(totals.montoNeto, project?.moneda?.simbolo)}
          </p>
          {totals.montoImpuesto > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Incl. {totals.porcentajeImpuesto}% IVA ({formatCurrency(totals.montoImpuesto, "")})
            </p>
          )}
        </div>
      </div>

      {/* Main table */}
      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-xs min-w-[900px]">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <th className="px-3 py-2.5 text-left font-medium">Nº / Código</th>
              <th className="px-3 py-2.5 text-left font-medium">Descripción</th>
              <th className="px-3 py-2.5 text-center font-medium">Und</th>
              <th className="px-3 py-2.5 text-right font-medium">Cant. Orig.</th>
              <th className="px-3 py-2.5 text-right font-medium text-emerald-600">Aumentos</th>
              <th className="px-3 py-2.5 text-right font-medium text-red-500">Disminuciones</th>
              <th className="px-3 py-2.5 text-right font-medium text-amber-500">Obras Extra</th>
              <th className="px-3 py-2.5 text-right font-medium">Cant. Final</th>
              <th className="px-3 py-2.5 text-right font-medium">P.U.</th>
              <th className="px-3 py-2.5 text-right font-medium">Monto Final</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(byChapter).map(([key, chapter]) => (
              <>
                {/* Chapter header */}
                <tr key={`cap-${key}`} className="bg-muted/20 border-b border-border">
                  <td colSpan={10} className="px-3 py-2 font-semibold text-foreground">
                    {chapter.descripcion}
                  </td>
                </tr>

                {chapter.items.map(item => {
                  const hasAumento = item.totalAumentos > 0;
                  const hasDisminucion = item.totalDisminuciones > 0;
                  const isComplete = item.pendiente === 0;

                  return (
                    <tr key={item.id} className="border-b border-border/40 hover:bg-accent/10">
                      <td className="px-3 py-2.5 font-mono text-primary font-medium">{item.codigoPartida}</td>
                      <td className="px-3 py-2.5 max-w-[180px]">
                        <div className="flex items-center gap-1.5">
                          {isComplete
                            ? <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
                            : <AlertCircle size={12} className="text-amber-500 flex-shrink-0" />
                          }
                          <span className="truncate">{item.codigoPartida}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center text-muted-foreground">{item.unidad ?? "—"}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-muted-foreground">
                        {item.cantOriginal.toLocaleString("es-VE", { maximumFractionDigits: 4 })}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono">
                        {hasAumento
                          ? <span className="flex items-center justify-end gap-1 text-emerald-600">
                              <TrendingUp size={11} /> +{item.totalAumentos.toLocaleString("es-VE", { maximumFractionDigits: 4 })}
                            </span>
                          : <span className="text-muted-foreground/40">—</span>
                        }
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono">
                        {hasDisminucion
                          ? <span className="flex items-center justify-end gap-1 text-red-500">
                              <TrendingDown size={11} /> -{item.totalDisminuciones.toLocaleString("es-VE", { maximumFractionDigits: 4 })}
                            </span>
                          : <span className="text-muted-foreground/40">—</span>
                        }
                      </td>
                      <td className="px-3 py-2.5 text-center text-muted-foreground/40">—</td>
                      <td className="px-3 py-2.5 text-right font-mono font-semibold">
                        {item.cantFinal.toLocaleString("es-VE", { maximumFractionDigits: 4 })}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-muted-foreground">
                        {formatCurrency(item.precioUnitario, "")}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-semibold text-primary">
                        {formatCurrency(item.montoFinal, "")}
                      </td>
                    </tr>
                  );
                })}
              </>
            ))}

            {/* Obras Extra section */}
            {extraLineItems.length > 0 && (
              <>
                <tr className="bg-amber-500/10 border-b border-amber-500/30">
                  <td colSpan={10} className="px-3 py-2 font-semibold text-amber-600 dark:text-amber-400">
                    OBRAS EXTRA
                  </td>
                </tr>
                {extraLineItems.map((item: any) => (
                  <tr key={item.id} className="border-b border-border/40 hover:bg-accent/10">
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-xs px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded font-semibold">
                        {item.codigoPartida}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 truncate max-w-[180px]">{item.descripcion}</td>
                    <td className="px-3 py-2.5 text-center text-muted-foreground">{item.unidad ?? "—"}</td>
                    <td className="px-3 py-2.5 text-center text-muted-foreground/40">—</td>
                    <td className="px-3 py-2.5 text-center text-muted-foreground/40">—</td>
                    <td className="px-3 py-2.5 text-center text-muted-foreground/40">—</td>
                    <td className="px-3 py-2.5 text-right font-mono text-amber-500">
                      <span className="flex items-center justify-end gap-1">
                        <Layers size={11} /> {Number(item.cantFinal).toLocaleString("es-VE", { maximumFractionDigits: 4 })}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold">
                      {Number(item.cantFinal).toLocaleString("es-VE", { maximumFractionDigits: 4 })}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-muted-foreground">
                      {formatCurrency(item.precioUnitario, "")}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold text-primary">
                      {formatCurrency(item.montoFinal, "")}
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>

          {/* Totals footer */}
          <tfoot>
            <tr className="bg-muted/30 border-t-2 border-border">
              <td colSpan={9} className="px-3 py-3 text-right font-semibold">TOTAL CONTRATO ACTUALIZADO</td>
              <td className="px-3 py-3 text-right font-mono font-bold text-primary text-sm">
                {formatCurrency(totals.montoTotal, project?.moneda?.simbolo)}
              </td>
            </tr>
            {totals.montoImpuesto > 0 && (
              <tr className="bg-muted/20 border-t border-border">
                <td colSpan={9} className="px-3 py-2.5 text-right text-muted-foreground">
                  IVA ({totals.porcentajeImpuesto}%)
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-muted-foreground">
                  {formatCurrency(totals.montoImpuesto, project?.moneda?.simbolo)}
                </td>
              </tr>
            )}
            <tr className="bg-primary/10 border-t-2 border-primary/30">
              <td colSpan={9} className="px-3 py-3 text-right font-bold text-primary">MONTO NETO A PAGAR</td>
              <td className="px-3 py-3 text-right font-mono font-bold text-primary text-base">
                {formatCurrency(totals.montoNeto, project?.moneda?.simbolo)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
