export function PrintHeader({ title, project, rightLabel, rightValue }: { title: string, project: any, rightLabel?: string, rightValue?: string }) {
  return (
    <div className="border-b-2 border-black pb-4 mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">Constructora LULO</h1>
          <p className="text-sm font-medium text-gray-600 uppercase mt-1">{title}</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-semibold">Proyecto: {project?.codigo}</p>
          <p className="text-gray-600">Fecha Impresión: {new Date().toLocaleDateString('es-VE')}</p>
          {rightLabel && (
            <p className="text-gray-600 mt-1">{rightLabel}: <span className="font-semibold">{rightValue}</span></p>
          )}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-300">
        <p className="text-sm"><strong>Obra:</strong> {project?.descripcion}</p>
      </div>
    </div>
  );
}
