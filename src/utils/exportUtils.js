const ExcelJS = require('exceljs');

async function exportToExcel(filename, sheetsData) {
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

  // Generate the Excel file

  const timestamp = new Date().toISOString().replace(/[-:.]/g, '');

  const fileName = `reports/${filename}_${timestamp}.xlsx`;

  await workbook.xlsx.writeFile(fileName);
}

module.exports = { exportToExcel };
