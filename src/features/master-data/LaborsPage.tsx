import { MasterDataTable } from "@/components/data-table/MasterDataTable";
import { formatCurrency } from "@/utils/cn";

interface ILabor {
  id: string;
  codigo: string;
  codigoFamilia: string;
  descripcion: string;
  unidad: string;
  precio: string | number;
  salarioBase: string | number;
  supervisor: boolean;
  importado: boolean;
  porcentajeNacional: string | number;
  fechaActualizacion: string | null;
}

export function LaborsPage() {
  return (
    <MasterDataTable<ILabor>
      title="Mano de Obra"
      queryKey="labors"
      endpoint="/labors"
      searchPlaceholder="Buscar por código o descripción..."
      formFields={[
        { key: "codigo",             label: "Código",              required: true, placeholder: "MOB001" },
        { key: "descripcion",        label: "Descripción / Cargo", required: true, placeholder: "ALBAÑIL DE 1ra." },
        { key: "unidad",             label: "Unidad",              placeholder: "Hr, Día, Mes..." },
        { key: "precio",             label: "Precio/Hora",         type: "number", placeholder: "0.0000" },
        { key: "salarioBase",        label: "Salario Base",        type: "number", placeholder: "0.0000" },
        { key: "porcentajeNacional", label: "% Nacional",          type: "number", placeholder: "100" },
        { key: "supervisor",         label: "¿Es supervisor?",     type: "checkbox" },
        { key: "importado",          label: "¿Es importado?",      type: "checkbox" },
        { key: "fechaActualizacion", label: "Fecha Actualización", type: "date" },
      ]}
      columns={[
        { key: "codigo",             label: "Código" },
        { key: "codigoFamilia",      label: "Flia." },
        { key: "descripcion",        label: "Descripción", render: (r) => <span className="max-w-sm truncate block" title={r.descripcion}>{r.descripcion}</span> },
        { key: "unidad",             label: "Unidad" },
        { key: "salarioBase",        label: "Salario Base", render: (r) => <span className="font-mono">{formatCurrency(r.salarioBase, "")}</span> },
        { key: "fechaActualizacion", label: "Fecha",        render: (r) => r.fechaActualizacion ? new Date(r.fechaActualizacion).toLocaleDateString("es-VE") : "—" },
        { key: "supervisor",         label: "Superv.",      render: (r) => r.supervisor ? <span className="text-blue-400 font-semibold">SÍ</span> : <span className="text-muted-foreground">NO</span> },
        { key: "importado",          label: "Imp.",         render: (r) => r.importado ? <span className="text-yellow-400 font-semibold">SÍ</span> : <span className="text-muted-foreground">NO</span> },
      ]}
    />
  );
}
