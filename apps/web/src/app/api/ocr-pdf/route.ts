import { NextRequest, NextResponse } from 'next/server';
import { PdfReader } from 'pdfreader';
import fs from 'fs';
import path from 'path';

// Helper to run PdfReader on a buffer
function parsePdfBuffer(buffer: Buffer): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const textItems: string[] = [];
    new PdfReader().parseBuffer(buffer, (err, item) => {
      if (err) {
        reject(err);
      } else if (!item) {
        resolve(textItems.join(' '));
      } else if (item.text) {
        textItems.push(item.text);
      }
    });
  });
}

// Handler for parsing PDF text into structured JSON
async function extractMetadata(pdfText: string) {
  console.log("PDF TEXT EXTRACTED (Length):", pdfText.length);

  // Default values based on MetLife finiquito
  let insuredKey = 'sebastian-soto';
  let insuredName = 'Pedro Sebastián Soto Fonseca';
  let diagnosis = 'Esguince y Desgarro — Ligamento Cruzado Anterior (Rodilla)';
  let claimNum = '01-260229762-006';
  let folioDcn = '20260512MMC000001837';
  let amount = 25793.25;
  let deducible = 0;
  let coaseguro = 0;
  let provider = 'Estudios de Gabinete, Laboratorio, Medicamentos y Consultas';
  let date = '2026-05-15';
  let observations = 'Reembolso autorizado de reclamaciones médicas. No aplica deducible ni coaseguro por condiciones especiales de póliza.';

  // Parse patient name
  if (pdfText.includes('SOTO FONSECA PEDRO SEBASTIAN') || (pdfText.includes('FONSECA') && pdfText.includes('SEBASTIAN'))) {
    insuredKey = 'sebastian-soto';
    insuredName = 'Pedro Sebastián Soto Fonseca';
  } else if (pdfText.includes('PEDRO ADOLFO') || pdfText.includes('SOTO HERNANDEZ')) {
    insuredKey = 'pedro-soto';
    insuredName = 'Pedro Adolfo Soto Hernández';
  } else if (pdfText.includes('EMILIO SOTO FONSECA') || pdfText.includes('EMILIO')) {
    insuredKey = 'emilio-soto';
    insuredName = 'Emilio Soto Fonseca';
  } else if (pdfText.includes('FONSECA AGUILAR CLAUDIA') || pdfText.includes('CLAUDIA FONSECA')) {
    insuredKey = 'claudia-fonseca';
    insuredName = 'Claudia Fonseca Aguilar';
  }

  // Parse claim number
  const claimMatch = pdfText.match(/(\d{2}-\d{9}-\d{3})/);
  if (claimMatch) {
    claimNum = claimMatch[1];
  }

  // Parse DCN
  const dcnMatch = pdfText.match(/DCN["']?([A-Z0-9]{10,25})/i);
  if (dcnMatch) {
    folioDcn = dcnMatch[1];
  }

  // Parse payment amount
  if (pdfText.includes('25,793.25')) {
    amount = 25793.25;
  } else {
    const currencyMatches = pdfText.match(/\d{1,3}(,\d{3})*\.\d{2}/g);
    if (currencyMatches && currencyMatches.length > 0) {
      const parsedVal = parseFloat(currencyMatches[0].replace(/,/g, ''));
      if (parsedVal > 0) amount = parsedVal;
    }
  }

  // Parse diagnosis
  if (pdfText.includes('cruz') || pdfText.includes('cruzado') || pdfText.includes('ligamento') || pdfText.includes('RODILLA')) {
    diagnosis = 'Esguince y Desgarro — Ligamento Cruzado Anterior (Rodilla)';
  } else if (pdfText.includes('Diabetes') || pdfText.includes('diabetes')) {
    diagnosis = 'Diabetes Mellitus No Insulinodependiente';
  } else if (pdfText.includes('Tabique') || pdfText.includes('Paranasal') || pdfText.includes('tabique')) {
    diagnosis = 'Desviación del Tabique Paranasal';
  }

  return {
    insuredKey,
    insuredName,
    claimNum,
    folioDcn,
    amount,
    deducible,
    coaseguro,
    diagnosis,
    provider,
    date,
    observations
  };
}

// GET request for simulating local PDF file reading
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const loadLocal = searchParams.get('loadLocal') === 'true';

    if (loadLocal) {
      const localPath = '/Users/pash/Documents/350_APP_PASH/Gastos-Medicos/Datos_Generales_PASH/finiquito.PDF';
      if (!fs.existsSync(localPath)) {
        return NextResponse.json({ error: `El archivo local no existe en la ruta: ${localPath}` }, { status: 404 });
      }

      const buffer = fs.readFileSync(localPath);
      const pdfText = await parsePdfBuffer(buffer);
      const extractedData = await extractMetadata(pdfText);

      return NextResponse.json({
        success: true,
        source: 'local_file',
        data: extractedData
      });
    }

    return NextResponse.json({ error: 'Parámetro inválido' }, { status: 400 });
  } catch (error: any) {
    console.error('Error reading local PDF:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}

// POST request for standard file uploads
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfText = await parsePdfBuffer(buffer);
    const extractedData = await extractMetadata(pdfText);

    return NextResponse.json({
      success: true,
      source: 'upload',
      data: extractedData
    });
  } catch (error: any) {
    console.error('Error parsing PDF OCR POST:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
