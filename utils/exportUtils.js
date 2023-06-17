const ExcelJS = require('exceljs');

async function exportToExcel(filename, data) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');

  // header
  const columns = Object.keys(data[0]);
  worksheet.addRow(columns);

  // data rows
  data.forEach((item) => {
    const values = Object.values(item);
    worksheet.addRow(values);
  });

  // Generate the Excel file
  const buffer = await workbook.xlsx.writeBuffer();

  const timestamp = new Date().toISOString().replace(/[-:.]/g, '');

  const fileName = `reports/${filename}_${timestamp}.xlsx`;

  await workbook.xlsx.writeFile(fileName);
}

module.exports = { exportToExcel };
