const XLSX = require('xlsx');
const path = require('path');

// Mock IDs from 1001 to 1050 are "valid" in the seeder.
const data = [
    { "Report Number": "IGI1001", "Carat": 1.5, "Color": "D", "Clarity": "IF", "Polish": "EX", "Symmetry": "EX", "Fluorescence": "NONE", "Measurement": "7.30 x 7.35 x 4.50 mm" },
    { "Report Number": "IGI1002", "Carat": 1.2, "Color": "E", "Clarity": "VVS1", "Polish": "EX", "Symmetry": "VG", "Fluorescence": "FAINT", "Measurement": "6.80 x 6.85 x 4.10 mm" },
    { "Report Number": "IGI1003", "Carat": 0.8, "Color": "F", "Clarity": "VS1", "Polish": "VG", "Symmetry": "VG", "Fluorescence": "NONE", "Measurement": "5.90 x 5.95 x 3.60 mm" },
    { "Report Number": "IGI9999", "Carat": 2.0, "Color": "G", "Clarity": "SI1", "Polish": "G", "Symmetry": "G", "Fluorescence": "MED", "Measurement": "8.10 x 8.15 x 5.00 mm" }, // WRONG ID
    { "Report Number": "FAKE-ID-001", "Carat": 1.1, "Color": "H", "Clarity": "VS2", "Polish": "VG", "Symmetry": "EX", "Fluorescence": "NONE", "Measurement": "6.50 x 6.55 x 4.00 mm" }, // WRONG ID
    { "Report Number": "IGI1010", "Carat": 0.9, "Color": "D", "Clarity": "VVS2", "Polish": "EX", "Symmetry": "EX", "Fluorescence": "FAINT", "Measurement": "6.20 x 6.25 x 3.80 mm" },
    { "Report Number": "INVALID_X", "Carat": 1.4, "Color": "E", "Clarity": "IF", "Polish": "EX", "Symmetry": "EX", "Fluorescence": "NONE", "Measurement": "7.10 x 7.15 x 4.40 mm" }, // WRONG ID
    { "Report Number": "IGI1050", "Carat": 2.5, "Color": "F", "Clarity": "VVS1", "Polish": "EX", "Symmetry": "EX", "Fluorescence": "NONE", "Measurement": "8.70 x 8.75 x 5.30 mm" },
    { "Report Number": "HELLO_WORLD", "Carat": 0.5, "Color": "G", "Clarity": "SI2" } // WRONG ID
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Certificates");

const filePath = path.join(__dirname, 'test_certificates_rich_data.xlsx');
XLSX.writeFile(wb, filePath);

console.log('Successfully generated: ' + filePath);
console.log('This file contains 5 Valid IDs and 4 Invalid IDs for testing.');
