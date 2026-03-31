import { NextResponse } from "next/server";
import { getGoogleSheetsClient } from "@/lib/googleSheets";

// Sin caché — datos en tiempo real desde Google Sheets
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const sheetId = process.env.GOOGLE_SHEET_ID || "1aHust80ArTzLxr_n1s9XSFdTvNopCYRmvoU75MJmsHA";

        const sheets = await getGoogleSheetsClient();

        // Row 1 = Encabezados técnicos (2_Case_Management_*, 3_Carta_Remesa_*, 4_SRGMM_*, ...)
        // Row 2+ = Datos reales de asegurados
        const dbData = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: "Asegurados!A1:ZZ",
        });

        const rows = dbData.data.values || [];
        if (rows.length < 2) {
            return NextResponse.json({ success: false, msg: "Faltan datos en la hoja Asegurados" });
        }

        // headers = Row 1 (índice 0) — conservamos el caso original para matching
        const headers = rows[0].map((h: any) => (h || "").toString().trim());
        console.log(`✅ [SHEETS] ${headers.length} columnas detectadas (Row 1).`);

        // Helper: busca el índice por coincidencia exacta primero, luego parcial (case-insensitive)
        const getIdx = (nameMatches: string[]): number => {
            for (const match of nameMatches) {
                const idx = headers.findIndex((h: string) => h.toLowerCase() === match.toLowerCase());
                if (idx !== -1) return idx;
            }
            for (const match of nameMatches) {
                const idx = headers.findIndex((h: string) => h.toLowerCase().includes(match.toLowerCase()));
                if (idx !== -1) return idx;
            }
            return -1;
        };

        const val = (row: any[], nameMatches: string[]): string => {
            const idx = getIdx(nameMatches);
            return idx !== -1 ? (row[idx] ?? "").toString().trim() : "";
        };

        // Filas de datos = a partir de Row 2 (índice 1)
        const dataRows = rows.slice(1);

        const asegurados = dataRows.map((row: any[]) => {
            // Nombre completo del afectado desde columnas SRGMM
            const nombres = val(row, ["4_SRGMM_Afec_Nombres"]);
            const apPat   = val(row, ["4_SRGMM_Afec_Appaterno"]);
            const apMat   = val(row, ["4_SRGMM_Afec_Apmaterno"]);
            const nombre  = `${nombres} ${apPat} ${apMat}`.trim();

            // RFC del titular como ID único por persona
            const rfc = val(row, ["4_SRGMM_Titular_Rfc_1"]) || val(row, ["4_SRGMM_Afec_Rfc"]);

            // Tipo de trámite
            const esInicial = val(row, ["3_Carta_Remesa_Inicial"]) === "✔";
            const esCompl   = val(row, ["3_Carta_Remesa_Complemento"]) === "✔";

            // Motivo de atención
            const esEnfermedad = val(row, ["4_SRGMM_Motivo_Atencion_Enfermedad"]) === "✔";
            const esAccidente  = val(row, ["4_SRGMM_Motivo_Atencion_Accidente"])  === "✔";
            const esEmbarazo   = val(row, ["4_SRGMM_Motivo_Atencion_Embarazo"])   === "✔";

            return {
                id: rfc || nombre,

                // Póliza & empresa
                poliza:      val(row, ["4_SRGMM_Poliza"]),
                certificado: val(row, ["4_SRGMM_Poliza"]),
                empresa:     val(row, ["4_SRGMM_Razon_Social", "3_Carta_Remesa_Empresa"]),
                aseguradora: val(row, ["3_Carta_Remesa_Aseguradora"]),

                // Afectado
                nombre: nombre || val(row, ["3_Carta_Remesa_Nombre_Afectado"]),
                rfc,
                sexo:         val(row, ["4_SRGMM_Afec_Sexo"]),
                ocupacion:    val(row, ["4_SRGMM_Afec_Ocupacion"]),
                nacionalidad: val(row, ["4_SRGMM_Afec_Nacionalidad", "4_SRGMM_Titular_Nacionalidad"]),
                parentesco:   val(row, ["4_SRGMM_Parentesco", "3_Carta_Remesa_Parentesco"]),
                fechaNac: [
                    val(row, ["4_SRGMM_Afec_Fecha_Nac_Year"]),
                    val(row, ["4_SRGMM_Afec_Fecha_Nac_Month"]).padStart(2, "0"),
                    val(row, ["4_SRGMM_Afec_Fecha_Nac_Day"]).padStart(2, "0"),
                ].join("-"),
                estadoNac: val(row, ["4_SRGMM_Titular_Estado_Nac"]),
                paisNac:   val(row, ["4_SRGMM_Titular_Pais_Nac"]),

                // Titular
                titular: val(row, ["3_Carta_Remesa_Nombre_Titular"]),
                titularParsed: {
                    nombre:    val(row, ["4_SRGMM_Titular_Nombres"]),
                    apellidoP: val(row, ["4_SRGMM_Titular_Appaterno"]),
                    apellidoM: val(row, ["4_SRGMM_Titular_Apmaterno"]),
                },

                // Dirección
                calle:       val(row, ["4_SRGMM_Calle"]) || val(row, ["2_Case_Management_Calle_Numero"]),
                noExt:       val(row, ["4_SRGMM_No_Ext"]),
                noInt:       val(row, ["4_SRGMM_No_Int"]),
                colonia:     val(row, ["4_SRGMM_Colonia", "2_Case_Management_Colonia"]),
                cp:          val(row, ["4_SRGMM_Cp",      "2_Case_Management_Cp"]),
                municipio:   val(row, ["4_SRGMM_Municipio","2_Case_Management_Municipio"]),
                estado:      val(row, ["4_SRGMM_Estado",   "2_Case_Management_Estado"]),
                ciudad:      val(row, ["4_SRGMM_Ciudad"]),
                paisContacto:val(row, ["4_SRGMM_Pais"]),

                // Contacto
                telefono: val(row, ["2_Case_Management_Telefono", "4_SRGMM_Celular_1"]),
                email:    val(row, ["From email", "TO Email"]),

                // Banco
                banco: val(row, ["4_SRGMM_Banco"]),
                clabe: val(row, ["4_SRGMM_Clabe_1"]),

                // ── Siniestro / Trámite ──
                siniestroNum: val(row, [
                    "2_Case_Management_Numero_Siniestro",
                    "4_SRGMM_Siniestro",
                    "3_Carta_Remesa_No_Siniestro",
                    "4_SRGMM_Reclamo_Subsecuente_Siniestro",
                ]),
                padecimiento: val(row, ["3_Carta_Remesa_Padecimiento", "4_SRGMM_Describir_Sintomas"]),
                hospital:     val(row, ["3_Carta_Remesa_Hospital"]),

                tipoTramite: esInicial ? "Inicial" : esCompl ? "Complemento" : "Inicial",
                tipoPago:    val(row, ["3_Carta_Remesa_Tipo_Reclamacion"]) || "Reembolso",
                naturaleza:  esEnfermedad ? "Enfermedad" : esAccidente ? "Accidente" : esEmbarazo ? "Embarazo" : "Enfermedad",

                montoReclamado: val(row, ["3_Carta_Remesa_Monto_Total_Facturas", "4_SRGMM_Total_Reclamo"]) || "0",
                cantidadFacturas: val(row, ["3_Carta_Remesa_No_Facturas_Reclamar"]) || "1",

                // Declaración jurada (5_Declaracion-Jurada_*)
                sectorHospitalario:  "Privado",
                mostrarPadecimiento: "SI",
                hospEleccionPropia:  val(row, ["5_Declaracion-Jurada_1"]) || "SI",
                detalleHosp:         "",
                medEleccionPropia:   val(row, ["5_Declaracion-Jurada_2"]) || "SI",
                detalleMed:          "",
                huboAsesoria:        val(row, ["5_Declaracion-Jurada_3"]) || "NO",
                detalleAsesoria:     "",
                huboDescuento:       val(row, ["5_Declaracion-Jurada_4"]) || "NO",
                detalleDescuento:    "",

                // Extras para el dashboard
                variables:    val(row, ["Variables"]),
                statusProceso:val(row, ["STATUS_PROCESO"]),
                fromEmail:    val(row, ["From email"]),
                toEmail:      val(row, ["TO Email"]),
            };
        }).filter((a: any) => a.nombre.length > 2);

        const siniestros = dataRows.map((row: any[], index: number) => {
            const sNum = val(row, ["2_Case_Management_Numero_Siniestro", "4_SRGMM_Siniestro"]) || `SIN-${index + 1}`;
            const rfc  = val(row, ["4_SRGMM_Titular_Rfc_1", "4_SRGMM_Afec_Rfc"]);
            let pad = val(row, ["3_Carta_Remesa_Padecimiento"]);
            if (!pad) {
                const rawVar = val(row, ["Variables"]);
                pad = rawVar.includes("/") ? rawVar.split("/").pop()?.trim() || "" : rawVar;
            }

            return {
                id: `${sNum}-${index}`,
                aseguradoId: rfc,
                titulo: pad || "Trámite Médico",
                numeroSiniestro: sNum,
                hospital: val(row, ["3_Carta_Remesa_Hospital"]),
                fecha: new Date().toISOString().split("T")[0],
                estado: val(row, ["STATUS_PROCESO"]) || "Activo",
            };
        }).filter((s: any) => s.aseguradoId !== "");

        console.log(`✅ [SHEETS-SYNC] ${asegurados.length} asegurados, ${siniestros.length} siniestros cargados.`);

        return NextResponse.json({ success: true, asegurados, siniestros });

    } catch (error: any) {
        console.error("❌ Error Google Sheets:", error);
        return NextResponse.json({ ...mockDataForDevs(), error: error.message }, { status: 200 });
    }
}

// ─── Fallback de emergencia (sin credenciales o error de red) ────────────────
function mockDataForDevs() {
    return {
        success: false,
        msg: "Fallback Modo Offline — revisa GOOGLE_SHEET_ID y credenciales",
        asegurados: [
            {
                id: "FOAC641226",
                nombre: "Pedro Adolfo Soto Hernandez",
                poliza: "02001M2012432",
                certificado: "02001M2012432",
                empresa: "Colgate Palmolive SA de CV",
                aseguradora: "MetLife Mexico SA de CV",
                rfc: "FOAC641226",
                email: "pash.mx@gmail.com",
                parentesco: "Conyuge",
                ocupacion: "Empleado",
                clabe: "012180004605010135",
                banco: "BBVA Bancomer SA",
                calle: "Jesus del Monte", noExt: "300", noInt: "4-GH3",
                colonia: "Jesus del Monte", cp: "52764",
                municipio: "Huixquilucan", estado: "Mexico", ciudad: "Huixquilucan",
                telefono: "5534559519",
                siniestroNum: "03230261780-009",
                padecimiento: "Diabetes Mellitus Tipo 2",
                tipoTramite: "Inicial", tipoPago: "Reembolso", naturaleza: "Enfermedad",
                montoReclamado: "0", cantidadFacturas: "1",
                sectorHospitalario: "Privado", mostrarPadecimiento: "SI",
                hospEleccionPropia: "SI", detalleHosp: "",
                medEleccionPropia: "SI", detalleMed: "",
                huboAsesoria: "NO", detalleAsesoria: "",
                huboDescuento: "NO", detalleDescuento: "",
            }
        ],
        siniestros: [
            { id: "03230261780-009-0", aseguradoId: "FOAC641226", titulo: "Diabetes Mellitus Tipo 2", fecha: "2026-03-26", estado: "Activo", hospital: "" }
        ]
    };
}
