const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Basic sample data with just certificate numbers
const sampleData = [
    { 'Certificate Number': 'IGI10000001' },
    { 'Certificate Number': 'IGI10000002' },
    { 'Report Number': 'GIA20000003' },
    { 'Certificate Number': 'IGI10000004' },
    { 'Certificate Number': 'IGI10000005' }
];

const samplesDir = path.join(__dirname, '..', '..', 'samples');
if (!fs.existsSync(samplesDir)) {
    fs.mkdirSync(samplesDir, { recursive: true });
}

// Generate XLSX
const wb = xlsx.utils.book_new();
const ws = xlsx.utils.json_to_sheet(sampleData);
xlsx.utils.book_append_sheet(wb, ws, 'Certificates');

const filePath = path.join(samplesDir, 'basic_certificates.xlsx');
xlsx.writeFile(wb, filePath);

console.log(`Successfully created: ${filePath}`);
