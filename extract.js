const fs = require('fs');
const pdfParser = require('pdf-parse');

let dataBuffer = fs.readFileSync('Java Roadmap.pdf');

pdfParser(dataBuffer).then(function(data) {
    fs.writeFileSync('pdf_text.txt', data.text);
    console.log("Done");
}).catch(console.error);
