import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function inspectForm() {
    const pdfPath = path.join(process.cwd(), 'public/plantillas/4_SRGMM-Mar26.pdf');
    if (!fs.existsSync(pdfPath)) {
        console.error('File not found:', pdfPath);
        return;
    }
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    console.log('--- FORM FIELDS REPORT ---');
    fields.forEach(field => {
        const type = field.constructor.name;
        const name = field.getName();
        console.log(`[${type}] ${name}`);
    });
}

inspectForm().catch(console.error);
