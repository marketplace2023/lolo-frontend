import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router";
import { useState } from "react";
import { api } from "@/services/api";
import { Loader2, BookOpen, Trash2, Edit2, Plus, PenTool } from "lucide-react";
import { formatCurrency } from "@/utils/cn";
import { Button } from "@/components/ui/FormPrimitives";
import { MemoriaEditorDialog } from "./components/MemoriaEditorDialog";
import { ChapterEditorDialog } from "./components/ChapterEditorDialog";
import { MasterItemSelectorDialog } from "./components/MasterItemSelectorDialog";

export function BudgetPage() {
  const { project } = useOutletContext<{ project: any }>();
  const id = project?.id;
  const queryClient = useQueryClient();

  const [isEditMode, setIsEditMode] = useState(false);
  
  // Modals state
  const [memoriaItem, setMemoriaItem] = useState<{id: string, cod: string, desc: string} | null>(null);
  const [chapterModal, setChapterModal] = useState<{open: boolean, chapter?: any}>({ open: false });
  const [itemSelectorChapterId, setItemSelectorChapterId] = useState<string | null>(null);

  const deleteChapterMutation = useMutation({
    mutationFn: (chapterId: string) => api.delete(`/chapters/${chapterId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budget", id] })
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => api.delete(`/project-items/${itemId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budget", id] })
  });

  const { data: budget, isLoading } = useQuery({
    queryKey: ["budget", id],
    queryFn: () => api.get(`/projects/${id}/budget`).then((r) => r.data),
    enabled: !!id,
  });

  const simbolo = project?.moneda?.simbolo ?? "Bs.";
  const ci = project?.costoIndirecto;

  const calcSubtotal = (monto: number) => {
    if (!ci) return monto;
    const adm = monto * (ci.administracion / 100);
    const util = (monto + adm) * (ci.utilidad / 100);
    const fin = (monto + adm + util) * (ci.financiamiento / 100);
    return monto + adm + util + fin;
  };

  const rawTotal = Number(budget?.totals?.montoTotal ?? 0);
  const totalConIndirectos = calcSubtotal(rawTotal);
  const iva = project?.aplicaImpuesto ? totalConIndirectos * (project.porcentajeImpuesto / 100) : 0;

  return (
    <div className="space-y-4 relative">
      <div className="flex justify-end mb-2">
        <Button 
          variant={isEditMode ? "primary" : "secondary"} 
          onClick={() => setIsEditMode(!isEditMode)}
          className={isEditMode ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}
        >
          <PenTool size={16} className="mr-2" />
          {isEditMode ? "Salir de Modo Edición" : "Modo Edición"}
        </Button>
      </div>

      {isEditMode && (
        <div className="flex justify-end">
           <Button onClick={() => setChapterModal({ open: true })} size="sm">
             <Plus size={14} className="mr-1" /> Añadir Capítulo
           </Button>
        </div>
      )}

      {/* Budget table */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-3">
          {(budget?.capitulos ?? []).map((cap: Record<string, unknown>) => (
            <div key={String(cap.id)} className={`bg-card border ${isEditMode ? 'border-amber-500/50' : 'border-border'} rounded-xl overflow-hidden transition-colors`}>
              <div className="px-4 py-2.5 bg-muted/20 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">Capítulo {String(cap.numero)}: {String(cap.descripcion)}</span>
                  {isEditMode && (
                    <>
                      <button onClick={() => setChapterModal({ open: true, chapter: cap })} className="p-1 text-muted-foreground hover:text-amber-600"><Edit2 size={14}/></button>
                      <button onClick={() => { if(confirm("Eliminar capítulo y TODAS sus partidas?")) deleteChapterMutation.mutate(String(cap.id)); }} className="p-1 text-muted-foreground hover:text-red-600"><Trash2 size={14}/></button>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">{(cap.partidas as unknown[]).length} partidas</span>
                  {isEditMode && (
                    <Button variant="secondary" size="sm" className="h-7 text-xs" onClick={() => setItemSelectorChapterId(String(cap.id))}>
                      <Plus size={12} className="mr-1" /> Añadir Partida
                    </Button>
                  )}
                </div>
              </div>
              {(cap.partidas as Record<string, unknown>[]).length > 0 ? (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground">
                      <th className="text-left px-4 py-2">Nº</th>
                      <th className="text-left px-4 py-2">Código</th>
                      <th className="text-right px-4 py-2">Cantidad</th>
                      <th className="text-right px-4 py-2">P.U.</th>
                      <th className="text-right px-4 py-2">Total</th>
                      <th className="text-right px-4 py-2 w-16">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(cap.partidas as Record<string, unknown>[]).map((item: any) => (
                      <tr key={String(item.id)} className="border-b border-border/30 hover:bg-accent/20">
                        <td className="px-4 py-2 text-muted-foreground">{String(item.numeroPar)}</td>
                        <td className="px-4 py-2 font-mono text-primary" title={String(item.descripcion)}>{String(item.codigoPartida)}</td>
                        <td className="px-4 py-2 text-right font-mono">{Number(item.cantidad).toLocaleString("es-VE", { maximumFractionDigits: 4 })}</td>
                        <td className="px-4 py-2 text-right font-mono">{formatCurrency(item.precioUnitario as string, simbolo)}</td>
                        <td className="px-4 py-2 text-right font-mono font-medium">{formatCurrency(item.montoTotal as string, simbolo)}</td>
                        <td className="px-4 py-2 text-right flex justify-end gap-2">
                          <button 
                            title="Memoria Descriptiva" 
                            onClick={() => setMemoriaItem({ id: item.id, cod: item.codigoPartida, desc: item.descripcion || "Memoria Descriptiva" })}
                            className="p-1.5 rounded bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors"
                          >
                            <BookOpen size={14} />
                          </button>
                          {isEditMode && (
                            <button 
                              title="Eliminar partida"
                              onClick={() => { if(confirm("Eliminar partida del presupuesto?")) deleteItemMutation.mutate(item.id); }}
                              className="p-1.5 rounded bg-muted text-muted-foreground hover:bg-red-500/20 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="px-4 py-3 text-xs text-muted-foreground italic">Sin partidas</p>
              )}
            </div>
          ))}

          {/* Summary */}
          {budget?.totals && (
            <div className="bg-card border border-primary/20 rounded-xl p-4 ml-auto max-w-sm">
              <h3 className="text-sm font-semibold text-foreground mb-3">Resumen del Presupuesto</h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Costo Directo:</span>
                  <span className="font-mono">{formatCurrency(rawTotal, simbolo)}</span>
                </div>
                {ci && ci.administracion > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{ci.titAdm ?? "% Administración"}:</span>
                    <span className="font-mono">{formatCurrency(rawTotal * (ci.administracion / 100), simbolo)}</span>
                  </div>
                )}
                {ci && ci.utilidad > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{ci.titUti ?? "% Utilidad"}:</span>
                    <span className="font-mono">{formatCurrency((rawTotal + rawTotal * (ci.administracion / 100)) * (ci.utilidad / 100), simbolo)}</span>
                  </div>
                )}
                {iva > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IVA {project?.porcentajeImpuesto}%:</span>
                    <span className="font-mono">{formatCurrency(iva, simbolo)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-foreground border-t border-border pt-1.5 mt-1.5">
                  <span>Total:</span>
                  <span className="font-mono text-primary">{formatCurrency(totalConIndirectos + iva, simbolo)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <MemoriaEditorDialog 
        open={!!memoriaItem} 
        onOpenChange={(v) => !v && setMemoriaItem(null)}
        projectItemId={memoriaItem?.id || null}
        codigoPartida={memoriaItem?.cod || ""}
        descripcionPartida={memoriaItem?.desc || ""}
      />

      <ChapterEditorDialog
        open={chapterModal.open}
        onOpenChange={(v) => setChapterModal({ open: v, chapter: undefined })}
        projectId={id}
        chapter={chapterModal.chapter}
      />

      <MasterItemSelectorDialog
        open={!!itemSelectorChapterId}
        onOpenChange={(v) => !v && setItemSelectorChapterId(null)}
        projectId={id}
        chapterId={itemSelectorChapterId}
      />
    </div>
  );
}
