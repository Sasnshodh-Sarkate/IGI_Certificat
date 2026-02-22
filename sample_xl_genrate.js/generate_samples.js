const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const sampleData = [
    { 'Certificate Number': 'IGI10000001' },
    { 'Certificate Number': 'IGI10000002' },
    { 'Report Number': 'GIA20000003' },
    { 'certificate_number': 'IGI10000004' },
    { 'Certificate Number': 'IGI10000005' },
    { 'Certificate Number': 'INVALID_ID_TEST' }
];

const samplesDir = path.join(__dirname, '..', '..', 'samples');
if (!fs.existsSync(samplesDir)) {
    fs.mkdirSync(samplesDir, { recursive: true });
}

// 1. Generate XLSX
const wbXlsx = xlsx.utils.book_new();
const wsXlsx = xlsx.utils.json_to_sheet(sampleData);
xlsx.utils.book_append_sheet(wbXlsx, wsXlsx, 'Samples');
const xlsxPath = path.join(samplesDir, 'sample_certificates.xlsx');
xlsx.writeFile(wbXlsx, xlsxPath);
console.log(`Created: ${xlsxPath}`);

// 2. Generate XLS
const wbXls = xlsx.utils.book_new();
const wsXls = xlsx.utils.json_to_sheet(sampleData);
xlsx.utils.book_append_sheet(wbXls, wsXls, 'Samples');
const xlsPath = path.join(samplesDir, 'sample_certificates.xls');
xlsx.writeFile(wbXls, xlsPath, { bookType: 'xls' });
console.log(`Created: ${xlsPath}`);

// 3. Generate CSV
const wsCsv = xlsx.utils.json_to_sheet(sampleData);
const csvContent = xlsx.utils.sheet_to_csv(wsCsv);
const csvPath = path.join(samplesDir, 'sample_certificates.csv');
fs.writeFileSync(csvPath, csvContent);
console.log(`Created: ${csvPath}`);

console.log('All sample files generated successfully in the /samples folder.');
