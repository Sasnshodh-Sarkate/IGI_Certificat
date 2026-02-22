const xlsx = require('xlsx');
const workbook = xlsx.readFile('sample_diamond_certificates.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const headers = [];
const range = xlsx.utils.decode_range(sheet['!ref']);
for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell = sheet[xlsx.utils.encode_cell({ r: 0, c: C })];
    if (cell && cell.v) headers.push(cell.v);
}
console.log('Headers:', headers);
