// import ExcelJS from 'exceljs';
import * as ExcelJS from 'exceljs';

export async function exportToExcel(
  filename: string,
  data: Record<string, any>
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');

  // header
  const columns = Object.keys(data[0]);
  worksheet.addRow(columns);

  // data rows
  data.forEach((item: Record<string, any>) => {
    const values = Object.values(item);
    worksheet.addRow(values);
  });

  // Generate the Excel file
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '');

  const fileName = `reports/${filename}_${timestamp}.xlsx`;

  await workbook.xlsx.writeFile(fileName);
}
