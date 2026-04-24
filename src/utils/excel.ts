import * as XLSX from "xlsx";

/**
 * Exports data to an Excel file
 * @param filename Name of the file without extension
 * @param data Array of objects to export
 * @param columns Optional array of column mappings [{ key: "codigo", header: "Código" }]
 */
export function exportToExcel(filename: string, data: any[], columns?: { key: string, header: string }[]) {
  let exportData = data;

  if (columns) {
    exportData = data.map(row => {
      const formattedRow: any = {};
      columns.forEach(col => {
        formattedRow[col.header] = row[col.key];
      });
      return formattedRow;
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Hoja1");

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
