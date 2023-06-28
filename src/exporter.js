import ExcelJS from 'exceljs';

export class Exporter {
  async _exportToExcel(filename, sheetsData) {
    const workbook = new ExcelJS.Workbook();

    for (const { sheetName, data } of sheetsData) {
      const worksheet = workbook.addWorksheet(sheetName);

      // header
      const columns = Object.keys(data[0]);
      worksheet.addRow(columns);

      // data rows
      data.forEach((item) => {
        const values = Object.values(item);
        worksheet.addRow(values);
      });
    }

    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const fileName = `reports/${filename}_${timestamp}.xlsx`;

    await workbook.xlsx.writeFile(fileName);
  }

  exportToExcel(fileName, data) {
    this._exportToExcel(fileName, data)
      .then(() => {
        console.log('Data exported to Excel successfully');
      })
      .catch((error) => {
        throw new Error(`Error exporting data to Excel: ${error}`);
      });
  }
}
