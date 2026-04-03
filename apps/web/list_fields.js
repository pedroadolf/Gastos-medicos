const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function listFields(pdfPath) {
    try {
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        console.log(`\n--- Fields for ${pdfPath} ---`);
        fields.forEach(f => {
            console.log(`- ${f.getName()} (${f.constructor.name})`);
        });
    } catch (e) {
        console.error(`Error loading ${pdfPath}: ${e.message}`);
    }
}

async function run() {
    await listFields('public/plantillas/3_Carta-Remesa-Marsh-Mar26.pdf');
    await listFields('public/plantillas/4_SRGMM-Mar26.pdf');
    await listFields('public/plantillas/5_Declaración-jurada-Mar26.pdf');
}

run();
