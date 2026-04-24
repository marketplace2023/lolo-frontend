import React from "react";
import { PrintHeader } from "./PrintHeader";
import { formatCurrency } from "@/utils/cn";

export function ReportPresupuesto({ reportData }: { reportData: any }) {
  if (!reportData || !reportData.project) return null;

  const project = reportData.project;
  const simbolo = project.moneda?.simbolo || "Bs.";
  
  let totalPresupuesto = 0;
  reportData.chapters.forEach((cap: any) => {
    cap.partidas.forEach((p: any) => {
      totalPresupuesto += Number(p.montoTotal);
    });
  });

  return (
    <div className="bg-white p-8 text-black min-h-screen">
      <PrintHeader 
        title="Presupuesto Base" 
        project={project} 
        rightLabel="Moneda Base" 
        rightValue={simbolo} 
      />

      <div className="mt-6">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-2 px-2 text-left w-16">Partida</th>
              <th className="py-2 px-2 text-left w-24">Código</th>
              <th className="py-2 px-2 text-left">Descripción</th>
              <th className="py-2 px-2 text-right w-24">Cantidad</th>
              <th className="py-2 px-2 text-right w-28">Precio Unit.</th>
              <th className="py-2 px-2 text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody>
            {reportData.chapters.map((cap: any) => {
              let capTotal = 0;
              cap.partidas.forEach((p: any) => capTotal += Number(p.montoTotal));

              return (
                <React.Fragment key={cap.id}>
                  {/* Chapter Header */}
                  <tr className="bg-gray-100 border-b border-gray-300 page-break-inside-avoid">
                    <td colSpan={5} className="py-2 px-2 font-bold uppercase">
                      Capítulo {cap.numero}: {cap.descripcion}
                    </td>
                    <td className="py-2 px-2 font-bold text-right">
                      {formatCurrency(capTotal, simbolo)}
                    </td>
                  </tr>
                  
                  {/* Items */}
                  {cap.partidas.map((item: any) => (
                    <tr key={item.id} className="border-b border-gray-200 page-break-inside-avoid">
                      <td className="py-2 px-2 align-top">{item.numeroPar}</td>
                      <td className="py-2 px-2 align-top font-mono">{item.codigoPartida}</td>
                      <td className="py-2 px-2 align-top text-justify pr-4">{item.descripcion || "Sin descripción"}</td>
                      <td className="py-2 px-2 align-top text-right">{Number(item.cantidad).toLocaleString('es-VE')}</td>
                      <td className="py-2 px-2 align-top text-right font-mono">{formatCurrency(item.precioUnitario, "")}</td>
                      <td className="py-2 px-2 align-top text-right font-mono font-medium">{formatCurrency(item.montoTotal, "")}</td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {/* Totals Summary */}
        <div className="mt-8 flex justify-end page-break-inside-avoid">
          <div className="w-80 border border-black p-4 bg-gray-50">
            <h3 className="font-bold text-sm mb-2 uppercase border-b border-gray-300 pb-1">Resumen del Presupuesto</h3>
            <div className="flex justify-between text-sm py-1">
              <span>Costo Directo:</span>
              <span className="font-mono">{formatCurrency(totalPresupuesto, simbolo)}</span>
            </div>
            {project.costoIndirecto && project.costoIndirecto.administracion > 0 && (
              <div className="flex justify-between text-sm py-1">
                <span>{project.costoIndirecto.titAdm || "% Administración"}:</span>
                <span className="font-mono">{formatCurrency(totalPresupuesto * (project.costoIndirecto.administracion / 100), simbolo)}</span>
              </div>
            )}
            {/* Simple math for display */}
            <div className="flex justify-between text-sm py-1 font-bold border-t border-black mt-2 pt-2">
              <span>TOTAL GENERAL:</span>
              <span className="font-mono">{formatCurrency(
                totalPresupuesto * (1 + ((project.costoIndirecto?.administracion || 0)/100)) * (1 + ((project.costoIndirecto?.utilidad || 0)/100)), 
                simbolo
              )}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
