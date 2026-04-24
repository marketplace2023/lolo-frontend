import React from "react";
import { PrintHeader } from "./PrintHeader";
import { formatCurrency } from "@/utils/cn";

export function ReportAPU({ reportData }: { reportData: any }) {
  if (!reportData || !reportData.project) return null;

  const { project, chapters, apus } = reportData;
  const simbolo = project.moneda?.simbolo || "Bs.";

  const allItems = chapters.flatMap((c: any) => c.partidas);

  return (
    <div className="bg-white p-8 text-black min-h-screen">
      <PrintHeader 
        title="Análisis de Precios Unitarios" 
        project={project} 
        rightLabel="Moneda Base" 
        rightValue={simbolo} 
      />

      <div className="mt-6 space-y-8">
        {allItems.map((item: any) => {
          const apu = apus[item.apuId];
          if (!apu) return null;

          const totalMat = (apu.materiales || []).reduce((s: number, m: any) => s + Number(m.subtotal || 0), 0);
          const totalEq = (apu.equipos || []).reduce((s: number, e: any) => s + Number(e.subtotal || 0), 0);
          const totalMo = (apu.manoDeObra || []).reduce((s: number, mo: any) => s + Number(mo.subtotal || 0), 0);
          const totalDirecto = totalMat + totalEq + totalMo;

          return (
            <div key={item.id} className="border-2 border-black page-break-inside-avoid text-xs mb-8">
              {/* APU Header */}
              <div className="bg-gray-100 p-2 border-b-2 border-black flex flex-col gap-1">
                <div className="flex justify-between font-bold text-sm uppercase">
                  <span>Partida Nº: {item.numeroPar}</span>
                  <span className="font-mono">{item.codigoPartida}</span>
                </div>
                <div className="text-justify font-medium mt-1">
                  {item.descripcion || "Descripción no disponible"}
                </div>
                <div className="flex justify-between mt-2 border-t border-gray-300 pt-1">
                  <span><strong>Unidad:</strong> {item.unidad || apu.unidad}</span>
                  <span><strong>Rendimiento:</strong> {Number(apu.rendimiento).toLocaleString('es-VE')} Und/Día</span>
                </div>
              </div>

              {/* Materiales */}
              <div className="border-b border-black">
                <div className="bg-gray-50 px-2 py-1 font-bold border-b border-gray-300">A. MATERIALES</div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-2 py-1 text-left">Descripción</th>
                      <th className="px-2 py-1 text-center w-16">Unidad</th>
                      <th className="px-2 py-1 text-right w-24">Cantidad</th>
                      <th className="px-2 py-1 text-right w-28">Precio Unit.</th>
                      <th className="px-2 py-1 text-right w-32">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apu.materiales?.map((m: any) => (
                      <tr key={m.id} className="border-b border-gray-100">
                        <td className="px-2 py-1 truncate max-w-[200px]">{m.descripcion || m.insumoId}</td>
                        <td className="px-2 py-1 text-center">{m.unidad || "Und"}</td>
                        <td className="px-2 py-1 text-right">{Number(m.cantidad).toLocaleString('es-VE', { maximumFractionDigits: 4 })}</td>
                        <td className="px-2 py-1 text-right font-mono">{formatCurrency(m.costoUnitario || 0, "")}</td>
                        <td className="px-2 py-1 text-right font-mono">{formatCurrency(m.subtotal || 0, "")}</td>
                      </tr>
                    ))}
                    {(!apu.materiales || apu.materiales.length === 0) && (
                      <tr><td colSpan={5} className="px-2 py-1 text-center text-gray-500 italic">Sin materiales</td></tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-bold">
                      <td colSpan={4} className="px-2 py-1 text-right">TOTAL MATERIALES:</td>
                      <td className="px-2 py-1 text-right font-mono">{formatCurrency(totalMat, "")}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Equipos */}
              <div className="border-b border-black">
                <div className="bg-gray-50 px-2 py-1 font-bold border-b border-gray-300">B. EQUIPOS</div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-2 py-1 text-left">Descripción</th>
                      <th className="px-2 py-1 text-center w-16">Unidad</th>
                      <th className="px-2 py-1 text-right w-24">Cantidad</th>
                      <th className="px-2 py-1 text-right w-28">Tarifa/Día</th>
                      <th className="px-2 py-1 text-right w-32">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apu.equipos?.map((e: any) => (
                      <tr key={e.id} className="border-b border-gray-100">
                        <td className="px-2 py-1 truncate max-w-[200px]">{e.descripcion || e.insumoId}</td>
                        <td className="px-2 py-1 text-center">{e.unidad || "Día"}</td>
                        <td className="px-2 py-1 text-right">{Number(e.cantidad).toLocaleString('es-VE', { maximumFractionDigits: 4 })}</td>
                        <td className="px-2 py-1 text-right font-mono">{formatCurrency(e.costoUnitario || 0, "")}</td>
                        <td className="px-2 py-1 text-right font-mono">{formatCurrency(e.subtotal || 0, "")}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-bold">
                      <td colSpan={4} className="px-2 py-1 text-right">TOTAL EQUIPOS:</td>
                      <td className="px-2 py-1 text-right font-mono">{formatCurrency(totalEq, "")}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Mano de Obra */}
              <div className="border-b border-black">
                <div className="bg-gray-50 px-2 py-1 font-bold border-b border-gray-300">C. MANO DE OBRA</div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-2 py-1 text-left">Descripción</th>
                      <th className="px-2 py-1 text-center w-16">Unidad</th>
                      <th className="px-2 py-1 text-right w-24">Cantidad</th>
                      <th className="px-2 py-1 text-right w-28">Salario/Día</th>
                      <th className="px-2 py-1 text-right w-32">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apu.manoDeObra?.map((mo: any) => (
                      <tr key={mo.id} className="border-b border-gray-100">
                        <td className="px-2 py-1 truncate max-w-[200px]">{mo.descripcion || mo.insumoId}</td>
                        <td className="px-2 py-1 text-center">{mo.unidad || "Día"}</td>
                        <td className="px-2 py-1 text-right">{Number(mo.cantidad).toLocaleString('es-VE', { maximumFractionDigits: 4 })}</td>
                        <td className="px-2 py-1 text-right font-mono">{formatCurrency(mo.costoUnitario || 0, "")}</td>
                        <td className="px-2 py-1 text-right font-mono">{formatCurrency(mo.subtotal || 0, "")}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-bold">
                      <td colSpan={4} className="px-2 py-1 text-right">TOTAL MANO DE OBRA:</td>
                      <td className="px-2 py-1 text-right font-mono">{formatCurrency(totalMo, "")}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Totals */}
              <div className="bg-gray-100 p-2 flex justify-between items-center font-bold text-sm uppercase">
                <span>Total Costo Directo (A + B + C):</span>
                <span className="font-mono text-base">{formatCurrency(totalDirecto, simbolo)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
