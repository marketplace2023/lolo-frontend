import { formatCurrency } from "@/utils/cn";

export function ReportInsumos({ reportData, type }: { reportData: any, type: "material" | "equipo" | "manoDeObra" }) {
  const { project, chapters, apus } = reportData;

  // Aggregate insumos
  const map = new Map<string, any>();

  chapters.forEach((cap: any) => {
    cap.partidas.forEach((item: any) => {
      const apu = apus[item.apuId];
      if (!apu) return;

      const cantidadPartida = Number(item.cantidad ?? 0);
      let insumosList: any[] = [];
      if (type === "material") insumosList = apu.materiales || [];
      else if (type === "equipo") insumosList = apu.equipos || [];
      else if (type === "manoDeObra") insumosList = apu.manoDeObra || [];

      insumosList.forEach((ins: any) => {
        // Para materiales: cant requerida = (cant en APU / rendimiento APU) * cant Partida
        // Wait, 'cantidad' inside ins is usually the amount per APU unit, already factoring rendimiento?
        // Let's assume ins.cantidad is per 1 unit of APU. So total required is ins.cantidad * cantidadPartida
        const totalReq = Number(ins.cantidad) * cantidadPartida;
        const totalCosto = Number(ins.costo) * totalReq; // wait, ins.costo is unit price, totalCosto is the total amount

        if (map.has(ins.insumoId)) {
          const current = map.get(ins.insumoId);
          current.totalReq += totalReq;
          current.totalCosto += Number(ins.costo) * totalReq;
        } else {
          map.set(ins.insumoId, {
            id: ins.insumoId,
            descripcion: ins.descripcion,
            unidad: ins.unidad,
            costoUnitario: Number(ins.costo),
            totalReq: totalReq,
            totalCosto: Number(ins.costo) * totalReq
          });
        }
      });
    });
  });

  const insumos = Array.from(map.values()).sort((a, b) => a.descripcion.localeCompare(b.descripcion));
  const granTotal = insumos.reduce((sum, item) => sum + item.totalCosto, 0);

  const title = type === "material" ? "Resumen de Materiales" : type === "equipo" ? "Resumen de Equipos" : "Resumen de Mano de Obra";

  return (
    <div className="p-8 bg-white text-black min-h-[29.7cm]">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold uppercase">{project.nombre}</h1>
        <h2 className="text-xl text-gray-700 mt-2">{title}</h2>
      </div>

      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-100 border-y-2 border-black">
            <th className="py-2 px-2 text-left font-bold">Descripción</th>
            <th className="py-2 px-2 text-center font-bold">Unidad</th>
            <th className="py-2 px-2 text-right font-bold">Cant. Total</th>
            <th className="py-2 px-2 text-right font-bold">Costo Unit.</th>
            <th className="py-2 px-2 text-right font-bold">Costo Total</th>
          </tr>
        </thead>
        <tbody>
          {insumos.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-200">
              <td className="py-1.5 px-2 uppercase">{item.descripcion}</td>
              <td className="py-1.5 px-2 text-center text-gray-600">{item.unidad || "Und"}</td>
              <td className="py-1.5 px-2 text-right font-mono">{item.totalReq.toLocaleString("es-VE", { maximumFractionDigits: 4 })}</td>
              <td className="py-1.5 px-2 text-right font-mono text-gray-600">{formatCurrency(item.costoUnitario, "")}</td>
              <td className="py-1.5 px-2 text-right font-mono font-bold">{formatCurrency(item.totalCosto, "")}</td>
            </tr>
          ))}
          {insumos.length === 0 && (
            <tr>
              <td colSpan={5} className="py-4 text-center text-gray-500">No se encontraron registros.</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-black bg-gray-50">
            <td colSpan={4} className="py-2 px-2 text-right font-bold">TOTAL:</td>
            <td className="py-2 px-2 text-right font-mono font-bold text-sm">{formatCurrency(granTotal, project?.moneda?.simbolo)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
