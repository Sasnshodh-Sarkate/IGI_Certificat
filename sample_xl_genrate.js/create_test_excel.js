const xlsx = require('xlsx');

const data = [
    { "id": 1, "certificateNumber": "IGI10000001", "shape": "ROUND", "carat": "1.02", "color": "D", "clarity": "VVS1", "cut": "EX", "polish": "EX", "symmetry": "EX", "fluorescence": "NONE", "measurement": "6.45 x 6.48 x 3.95", "location": "SURAT", "stock_ID": 900000001 },
    { "id": 2, "certificateNumber": "IGI10000002", "shape": "OVAL", "carat": "0.95", "color": "E", "clarity": "VS1", "cut": "VG", "polish": "EX", "symmetry": "VG", "fluorescence": "FAINT", "measurement": "7.20 x 5.10 x 3.20", "location": "MUMBAI", "stock_ID": 900000002 },
    { "id": 3, "certificateNumber": "GIA20000003", "shape": "PRINCESS", "carat": "1.20", "color": "F", "clarity": "VS2", "cut": "EX", "polish": "VG", "symmetry": "VG", "fluorescence": "NONE", "measurement": "5.90 x 5.85 x 4.10", "location": "SURAT", "stock_ID": 900000003 },
    { "id": 4, "certificateNumber": "IGI10000004", "shape": "PEAR", "carat": "0.88", "color": "G", "clarity": "SI1", "cut": "VG", "polish": "VG", "symmetry": "G", "fluorescence": "MEDIUM", "measurement": "7.60 x 4.90 x 3.10", "location": "JAIPUR", "stock_ID": 900000004 },
    { "id": 5, "certificateNumber": "IGI10000005", "shape": "CUSHION", "carat": "1.35", "color": "H", "clarity": "SI2", "cut": "G", "polish": "VG", "symmetry": "VG", "fluorescence": "NONE", "measurement": "6.10 x 6.00 x 4.20", "location": "SURAT", "stock_ID": 900000005 },
    { "id": 6, "certificateNumber": "IGI10000006", "shape": "EMERALD", "carat": "2.01", "color": "D", "clarity": "IF", "cut": "EX", "polish": "EX", "symmetry": "EX", "fluorescence": "NONE", "measurement": "8.10 x 5.60 x 3.90", "location": "MUMBAI", "stock_ID": 900000006 },
    { "id": 7, "certificateNumber": "IGI10000007", "shape": "RADIANT", "carat": "1.11", "color": "E", "clarity": "VVS2", "cut": "EX", "polish": "EX", "symmetry": "VG", "fluorescence": "FAINT", "measurement": "6.70 x 5.30 x 3.60", "location": "SURAT", "stock_ID": 900000007 },
    { "id": 8, "certificateNumber": "GIA20000008", "shape": "MARQUISE", "carat": "0.76", "color": "F", "clarity": "VS1", "cut": "VG", "polish": "VG", "symmetry": "VG", "fluorescence": "NONE", "measurement": "9.20 x 4.00 x 2.70", "location": "SURAT", "stock_ID": 900000008 },
    { "id": 9, "certificateNumber": "IGI10000009", "shape": "HEART", "carat": "1.42", "color": "G", "clarity": "VS2", "cut": "VG", "polish": "VG", "symmetry": "VG", "fluorescence": "NONE", "measurement": "7.10 x 7.30 x 4.20", "location": "JAIPUR", "stock_ID": 900000009 },
    { "id": 10, "certificateNumber": "IGI10000010", "shape": "ROUND", "carat": "0.70", "color": "H", "clarity": "SI1", "cut": "EX", "polish": "VG", "symmetry": "VG", "fluorescence": "FAINT", "measurement": "5.70 x 5.72 x 3.45", "location": "SURAT", "stock_ID": 900000010 },
    { "id": 11, "certificateNumber": "IGI10000011", "shape": "ROUND", "carat": "1.50", "color": "I", "clarity": "SI2", "cut": "VG", "polish": "EX", "symmetry": "EX", "fluorescence": "STRONG", "measurement": "7.30 x 7.35 x 4.50", "location": "MUMBAI", "stock_ID": 900000011 },
    { "id": 12, "certificateNumber": "GIA20000012", "shape": "OVAL", "carat": "1.10", "color": "D", "clarity": "VVS1", "cut": "EX", "polish": "EX", "symmetry": "EX", "fluorescence": "NONE", "measurement": "8.00 x 5.50 x 3.40", "location": "SURAT", "stock_ID": 900000012 },
    { "id": 13, "certificateNumber": "IGI10000013", "shape": "PEAR", "carat": "2.05", "color": "E", "clarity": "VS2", "cut": "VG", "polish": "VG", "symmetry": "G", "fluorescence": "FAINT", "measurement": "10.10 x 6.50 x 4.00", "location": "JAIPUR", "stock_ID": 900000013 },
    { "id": 14, "certificateNumber": "IGI10000014", "shape": "EMERALD", "carat": "3.00", "color": "F", "clarity": "IF", "cut": "EX", "polish": "EX", "symmetry": "EX", "fluorescence": "NONE", "measurement": "9.50 x 7.00 x 4.50", "location": "SURAT", "stock_ID": 900000014 },
    { "id": 15, "certificateNumber": "GIA20000015", "shape": "CUSHION", "carat": "1.01", "color": "G", "clarity": "VVS2", "cut": "VG", "polish": "EX", "symmetry": "VG", "fluorescence": "NONE", "measurement": "5.90 x 5.80 x 3.90", "location": "MUMBAI", "stock_ID": 900000015 },
    { "id": 16, "certificateNumber": "IGI10000016", "shape": "RADIANT", "carat": "1.80", "color": "H", "clarity": "VS1", "cut": "EX", "polish": "EX", "symmetry": "VG", "fluorescence": "MEDIUM", "measurement": "7.50 x 5.50 x 3.80", "location": "SURAT", "stock_ID": 900000016 },
    { "id": 17, "certificateNumber": "IGI10000017", "shape": "PRINCESS", "carat": "0.90", "color": "I", "clarity": "SI1", "cut": "VG", "polish": "VG", "symmetry": "G", "fluorescence": "NONE", "measurement": "5.40 x 5.40 x 3.80", "location": "JAIPUR", "stock_ID": 900000017 },
    { "id": 18, "certificateNumber": "GIA20000018", "shape": "MARQUISE", "carat": "1.25", "color": "J", "clarity": "SI2", "cut": "VG", "polish": "VG", "symmetry": "VG", "fluorescence": "STRONG", "measurement": "10.50 x 5.20 x 3.10", "location": "SURAT", "stock_ID": 900000018 },
    { "id": 19, "certificateNumber": "IGI10000019", "shape": "HEART", "carat": "1.50", "color": "D", "clarity": "VVS1", "cut": "EX", "polish": "EX", "symmetry": "EX", "fluorescence": "NONE", "measurement": "7.50 x 7.60 x 4.50", "location": "MUMBAI", "stock_ID": 900000019 },
    { "id": 20, "certificateNumber": "IGI10000020", "shape": "ROUND", "carat": "5.01", "color": "E", "clarity": "FL", "cut": "EX", "polish": "EX", "symmetry": "EX", "fluorescence": "NONE", "measurement": "11.00 x 11.05 x 6.80", "location": "SURAT", "stock_ID": 900000020 },
    { "id": 21, "certificateNumber": "GIA20000021", "shape": "OVAL", "carat": "2.10", "color": "F", "clarity": "VVS2", "cut": "EX", "polish": "EX", "symmetry": "VG", "fluorescence": "FAINT", "measurement": "9.50 x 6.80 x 4.20", "location": "JAIPUR", "stock_ID": 900000021 },
    { "id": 22, "certificateNumber": "IGI10000022", "shape": "PEAR", "carat": "1.15", "color": "G", "clarity": "VS1", "cut": "VG", "polish": "VG", "symmetry": "VG", "fluorescence": "NONE", "measurement": "8.50 x 5.50 x 3.50", "location": "SURAT", "stock_ID": 900000022 },
    { "id": 23, "certificateNumber": "IGI10000023", "shape": "EMERALD", "carat": "0.99", "color": "H", "clarity": "SI1", "cut": "VG", "polish": "VG", "symmetry": "G", "fluorescence": "MEDIUM", "measurement": "6.50 x 4.50 x 3.00", "location": "MUMBAI", "stock_ID": 900000023 },
    { "id": 24, "certificateNumber": "GIA2000000023300", "shape": "CUSHION", "carat": "1.75", "color": "I", "clarity": "VS2", "cut": "EX", "polish": "EX", "symmetry": "EX", "fluorescence": "NONE", "measurement": "7.00 x 6.90 x 4.50", "location": "SURAT", "stock_ID": 900000024 },
    { "id": 25, "certificateNumber": "IGI100000000012", "shape": "RADIANT", "carat": "2.50", "color": "J", "clarity": "SI2", "cut": "VG", "polish": "VG", "symmetry": "VG", "fluorescence": "STRONG", "measurement": "8.20 x 6.00 x 4.10", "location": "JAIPUR", "stock_ID": 900000025 }
];

// Map format to spreadsheet friendly headers
const excelData = data.map(item => ({
    "Stock ID": item.stock_ID,
    "Certificate Number": item.certificateNumber,
    "Shape": item.shape,
    "Weight": item.carat,
    "Color": item.color,
    "Clarity": item.clarity,
    "Cut": item.cut,
    "Polish": item.polish,
    "Symmetry": item.symmetry,
    "Fluorescence": item.fluorescence,
    "Measurement": item.measurement,
    "Location": item.location,
    "Lab": item.certificateNumber.startsWith('IGI') ? 'IGI' : (item.certificateNumber.startsWith('GIA') ? 'GIA' : 'Other'),
    "No. of Stones": 1
}));

const wb = xlsx.utils.book_new();
const ws = xlsx.utils.json_to_sheet(excelData);

// Set column widths
ws['!cols'] = [
    { wch: 15 }, // Stock ID
    { wch: 20 }, // Certificate Number
    { wch: 12 }, // Shape
    { wch: 10 }, // Weight
    { wch: 8 },  // Color
    { wch: 8 },  // Clarity
    { wch: 10 }, // Cut
    { wch: 10 }, // Polish
    { wch: 10 }, // Symmetry
    { wch: 15 }, // Fluorescence
    { wch: 20 }, // Measurement
    { wch: 15 }, // Location
    { wch: 10 }, // Lab
    { wch: 12 }  // No. of Stones
];

xlsx.utils.book_append_sheet(wb, ws, "Stock Data");
xlsx.writeFile(wb, "test_stock_data.xlsx");

console.log("Created test_stock_data.xlsx with 25 records.");
