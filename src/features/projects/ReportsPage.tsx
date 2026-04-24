import { useState } from "react";
import { useOutletContext } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Button } from "@/components/ui/FormPrimitives";
import { FileText, Printer, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { ReportPresupuesto } from "./components/ReportPresupuesto";
import { ReportAPU } from "./components/ReportAPU";
import { exportToExcel } from "@/utils/excel";

export function ReportsPage() {
  const { project } = useOutletContext<{ project: any }>();
  const id = project?.id;
  
  const [activeReport, setActiveReport] = useState<"presupuesto" | "apu" | null>(null);

  // We use the APU report endpoint because it contains all the budget info + all APUs.
  const { data: reportData, isLoading } = useQuery({
    queryKey: ["reports", id],
    queryFn: () => api.get(`/projects/${id}/reports/apu`).then(r => r.data),
    enabled: !!activeReport, // Only fetch when a report is selected
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!reportData) return;

    if (activeReport === "presupuesto") {
      const exportData: any[] = [];
      reportData.chapters.forEach((cap: any) => {
        exportData.push({
          Capitulo: cap.numero,
          Codigo: "",
          Descripcion: cap.descripcion,
          Cantidad: "",
          Unidad: "",
          PrecioUnitario: "",
          Total: ""
        });
        cap.partidas.forEach((p: any) => {
          exportData.push({
            Capitulo: "",
            Codigo: p.codigoPartida,
            Descripcion: p.descripcion,
            Cantidad: Number(p.cantidad),
            Unidad: p.unidad || "Und",
            PrecioUnitario: Number(p.precioUnitario),
            Total: Number(p.montoTotal)
          });
        });
      });
      
      exportToExcel(`Presupuesto_${project.codigo}`, exportData);
    } 
    else if (activeReport === "apu") {
      const exportData: any[] = [];
      const allItems = reportData.chapters.flatMap((c: any) => c.partidas);
      
      allItems.forEach((item: any) => {
        const apu = reportData.apus[item.apuId];
        if (!apu) return;

        exportData.push({
          Partida: item.codigoPartida,
          Descripcion: item.descripcion,
          Rendimiento: apu.rendimiento,
          TipoInsumo: "",
          Insumo: "",
          Cantidad: "",
          Costo: "",
          Total: ""
        });

        const pushInsumos = (tipoLabel: string, insumos: any[]) => {
          insumos?.forEach(ins => {
            exportData.push({
              Partida: "",
              Descripcion: "",
              Rendimiento: "",
              TipoInsumo: tipoLabel,
              Insumo: ins.descripcion,
              Cantidad: Number(ins.cantidad),
              Costo: Number(ins.costo),
              Total: Number(ins.subtotal)
            });
          });
        };

        pushInsumos("MATERIALES", apu.materiales);
        pushInsumos("EQUIPOS", apu.equipos);
        pushInsumos("MANO DE OBRA", apu.manoDeObra);
        
        // Blank row to separate
        exportData.push({});
      });

      exportToExcel(`APU_${project.codigo}`, exportData);
    }
  };

  if (!activeReport) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <h2 className="text-lg font-semibold">Reportes del Proyecto</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={() => setActiveReport("presupuesto")}
            className="flex flex-col items-center justify-center gap-3 p-8 bg-card border border-border rounded-xl hover:border-primary/50 hover:bg-accent/30 transition-colors"
          >
            <div className="p-4 bg-primary/10 text-primary rounded-full">
              <FileText size={32} />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-foreground">Presupuesto Base</h3>
              <p className="text-xs text-muted-foreground mt-1">Generar el presupuesto consolidado por capítulos.</p>
            </div>
          </button>

          <button 
            onClick={() => setActiveReport("apu")}
            className="flex flex-col items-center justify-center gap-3 p-8 bg-card border border-border rounded-xl hover:border-primary/50 hover:bg-accent/30 transition-colors"
          >
            <div className="p-4 bg-primary/10 text-primary rounded-full">
              <FileSpreadsheet size={32} />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-foreground">Libro de APU</h3>
              <p className="text-xs text-muted-foreground mt-1">Imprimir los análisis de precios unitarios de todas las partidas.</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Bar - Hidden during print */}
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border no-print">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => setActiveReport(null)}>Volver</Button>
          <h2 className="text-lg font-semibold capitalize">Reporte: {activeReport}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleExportExcel} disabled={isLoading} className="bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20">
            <Download size={16} className="mr-2" /> Excel
          </Button>
          <Button onClick={handlePrint} disabled={isLoading}>
            <Printer size={16} className="mr-2" /> Imprimir / PDF
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="bg-muted p-4 rounded-xl overflow-x-auto no-print shadow-inner flex justify-center">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="animate-spin" size={32} />
            <p>Generando reporte, esto puede tomar unos segundos...</p>
          </div>
        ) : (
          <div className="w-full max-w-[21cm] shadow-xl border border-border bg-white" style={{ minHeight: '29.7cm' }}>
            {activeReport === "presupuesto" && <ReportPresupuesto reportData={reportData} />}
            {activeReport === "apu" && <ReportAPU reportData={reportData} />}
          </div>
        )}
      </div>

      {/* Actual Print Area - Only visible when printing */}
      <div className="hidden print:block w-full">
        {!isLoading && activeReport === "presupuesto" && <ReportPresupuesto reportData={reportData} />}
        {!isLoading && activeReport === "apu" && <ReportAPU reportData={reportData} />}
      </div>
    </div>
  );
}
