import { NextResponse } from "next/server";
import { getGoogleSheetsClient } from "@/lib/googleSheets";

// Deshabilitamos la caché de Next.js para esta ruta (Queremos ver los cambios en tiempo real si modificas el Excel)
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const sheetId = process.env.GOOGLE_SHEET_ID || "1aHust80ArTzLxr_n1s9XSFdTvNopCYRmvoU75MJmsHA";

        if (!sheetId && false) {
            console.warn("⚠️ [WARN] GOOGLE_SHEET_ID no configurado. Entregando datos Mockeados para Desarrollo UI.");
            return NextResponse.json(mockDataForDevs());
        }

        const sheets = await getGoogleSheetsClient();

        // 1. Extraemos todo de la Pestaña
        const dbData = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: "Asegurados!A1:ZZ",
        });

        const rows = dbData.data.values || [];
        if (rows.length < 3) {
            return NextResponse.json({ success: false, msg: "Faltan datos o encabezados" });
        }

        // Fila 2 contiene los encabezados reales (Variables)
        const headers = rows[1].map(h => (h || "").trim().toLowerCase());
        console.log("Headers detected in Sheet Row 2:", headers);

        // Helper para obtener index dinámicamente
        const getIdx = (nameMatches: string[]) => {
            // Prioridad 1: Coicidencia EXACTA
            for (const match of nameMatches) {
                const idx = headers.findIndex(h => h === match.toLowerCase());
                if (idx !== -1) return idx;
            }
            // Prioridad 2: Incluye la palabra (pero si es un número solo, forzamos casi exacta)
            for (const match of nameMatches) {
                const idx = headers.findIndex(h => {
                    if (match.length <= 1) return h === match; // Evitar que "1" coincida con "rfc_1"
                    return h.includes(match.toLowerCase());
                });
                if (idx !== -1) return idx;
            }
            return -1;
        };

        const val = (row: any[], nameMatches: string[]) => {
            const idx = getIdx(nameMatches);
            return idx !== -1 ? (row[idx] || "").trim() : "";
        };

        const dataRows = rows.slice(2);

        // Mapeo seguro limpiando strings y armando el objeto Frontend
        const asegurados = dataRows.map((row) => ({
            id: val(row, ["titular_rfc", "rfc_titular"]),
            // Como fallback de ID usaremos el RFC o la fila

            poliza: val(row, ["tipo_poliza", "poliza"]),
            certificado: val(row, ["certificado"]),
            empresa: val(row, ["empresa", "razon_social"]),
            aseguradora: val(row, ["aseguradora"]),

            nombre: `${val(row, ["afec_nombres", "nombre_afectado"])} ${val(row, ["afec_appaterno"])} ${val(row, ["afec_apmaterno"])}`.trim(),
            parentesco: val(row, ["afect_parentesco", "parentesco"]),

            titular: `${val(row, ["titular_nombres", "nombre_titular"])} ${val(row, ["titular_appaterno"])} ${val(row, ["titular_apmaterno"])}`.trim(),
            titularParsed: {
                nombre: val(row, ["titular_nombres", "nombre_titular"]),
                apellidoP: val(row, ["titular_appaterno"]),
                apellidoM: val(row, ["titular_apmaterno"])
            },

            fechaNac: val(row, ["afec_fecha_nac", "fecha_nacimiento"]),
            estadoNac: val(row, ["afec_estado_nac", "estado_nacimiento"]),
            paisNac: val(row, ["afec_pais_nac", "pais_nacimiento"]),
            nacionalidad: val(row, ["titular_nacionalidad"]), // Asumimos del titular
            rfc: val(row, ["titular_rfc_1", "rfc"]),
            ocupacion: val(row, ["afec_ocupacion", "ocupacion"]),

            calle: val(row, ["calle"]),
            noExt: val(row, ["no_ext"]),
            noInt: val(row, ["no_int"]),
            colonia: val(row, ["colonia"]),
            cp: val(row, ["cp"]),
            municipio: val(row, ["municipio"]),
            estado: val(row, ["estado"]),
            ciudad: val(row, ["ciudad"]),
            paisContacto: val(row, ["pais"]),

            telefono: val(row, ["celular_1", "telefono_1", "telefono"]),
            email: val(row, ["email", "correo"]),
            banco: val(row, ["banco"]),
            clabe: val(row, ["clabe_1", "clabe"]),

            // DATOS NUEVOS EXTRA (Siniestro, Naturaleza, Jurada, etc)
            siniestroNum: val(row, ["num_siniestro", "no_siniestro", "numero_siniestro"]),
            padecimiento: val(row, ["padecimiento", "diagnostico"]),
            hospital: val(row, ["hospital"]),
            tipoTramite: val(row, ["tramite", "tipo_tramite"]) || "Inicial",
            tipoPago: val(row, ["solicito_pago_por", "tipo_pago"]) || "Reembolso",
            naturaleza: val(row, ["motivo_atencion"]) || "Enfermedad",

            montoReclamado: val(row, ["importe", "monto_total_facturas", "total_reclamo"]) || "0",
            cantidadFacturas: val(row, ["no_facturas_reclamar"]) || "1",

            sectorHospitalario: val(row, ["sector"]) || "Privado",
            mostrarPadecimiento: val(row, ["elija_si_desea_se_incluya_padecimiento"]) ? "SI" : "NO", // SI/NO

            hospEleccionPropia: val(row, ["1"]), // SI/NO
            detalleHosp: val(row, ["2", "detalle_hosp"]),
            medEleccionPropia: val(row, ["3", "medico"]), // SI/NO
            detalleMed: val(row, ["4", "detalle_med"]),
            huboAsesoria: val(row, ["huboasesoria", "asesoria"]), // SI/NO
            detalleAsesoria: val(row, ["detalleasesoria"]),
            huboDescuento: val(row, ["descuento"]), // SI/NO
            detalleDescuento: val(row, ["detalledescuento"]),
        })).filter(a => a.nombre.length > 2); // Excluir vacios

        const siniestros = dataRows.map((row, index) => {
            const sNum = val(row, ["num_siniestro", "no_siniestro", "numero_siniestro"]) || "SIN-01";
            const rfc = val(row, ["titular_rfc_1", "rfc"]);
            const variables = val(row, ["variables"]); // Columna A
            const pad = val(row, ["padecimiento", "diagnostico"]);

            return {
                id: `${sNum}-${index}`, // Unicidad física
                aseguradoId: rfc,
                titulo: variables || pad || "Tratamiento / Consulta",
                hospital: val(row, ["hospital"]),
                fecha: new Date().toISOString().split('T')[0],
                estado: "Activo",
            };
        }).filter(s => s.aseguradoId !== "");

        console.log(`✅ [SHEETS-SYNC] Obtenidos ${asegurados.length} clientes únicos y ${siniestros.length} expedientes.`);

        return NextResponse.json({ success: true, asegurados, siniestros });

    } catch (error: any) {
        console.error("❌ Error de comunicación con Google Sheets:", error);
        return NextResponse.json({ ...mockDataForDevs(), error: error.message }, { status: 200 });
    }
}

// ============================================
// DATA DE EMERGENCIA O DESARROLLO SIN API KEY
// ============================================
function mockDataForDevs() {
    return {
        success: false,
        msg: "Fallback Modo Offline UI",
        asegurados: [
            {
                id: "FOAC2902105X6",
                nombre: "Pedro Adolfo Soto Hernandez",
                poliza: "02001M2012432",
                certificado: "00000 13200645",
                empresa: "Colgate Palmolive SA de CV",
                aseguradora: "MetLife Mexico SA de CV",
                rfc: "FOAC2902105X6",
                email: "claudia_fonseca@colpal.com",
                parentesco: "Conyuge",
                ocupacion: "Empresario",
                clabe: "012180004435412740",
                banco: "BBVA Bancome SA",
                calle: "Jesus del Monte",
                noExt: "300",
                noInt: "4 - GH3",
                colonia: "Jesus del Monte",
                cp: "52764",
                municipio: "Huixquilucan",
                estado: "Mexico",
                ciudad: "Huixquilucan",
                telefono: "5534559519",

                siniestroNum: "03230261780-009",
                padecimiento: "Diabetes",
                tipoTramite: "Inicial",
                tipoPago: "Reembolso",
                naturaleza: "Enfermedad",
                montoReclamado: "0",
                cantidadFacturas: "1",
                sectorHospitalario: "Privado",
                mostrarPadecimiento: "SI",
                hospEleccionPropia: "SI",
                detalleHosp: "",
                medEleccionPropia: "SI",
                detalleMed: "",
                huboAsesoria: "NO",
                detalleAsesoria: "",
                huboDescuento: "NO",
                detalleDescuento: ""
            },
            {
                id: "FOAC2902105X6-2",
                nombre: "Pedro Adolfo Soto Hernandez",
                poliza: "02001M2012432",
                certificado: "01210200485-018",
                empresa: "Colgate Palmolive SA de CV",
                aseguradora: "MetLife Mexico SA de CV",
                rfc: "FOAC2902105X6",
                email: "claudia_fonseca@colpal.com",
                parentesco: "Conyuge",
                ocupacion: "Empresario",
                clabe: "012180004435412740",
                banco: "BBVA Bancome SA",
                calle: "Jesus del Monte",
                noExt: "300",
                noInt: "4 - GH3",
                colonia: "Jesus del Monte",
                cp: "52764",
                municipio: "Huixquilucan",
                estado: "Mexico",
                ciudad: "Huixquilucan",
                telefono: "5534559519",

                siniestroNum: "03230261780-010",
                padecimiento: "Infección Respiratoria",
                tipoTramite: "Complemento",
                tipoPago: "Reembolso",
                naturaleza: "Enfermedad",
                montoReclamado: "0",
                cantidadFacturas: "1",
                sectorHospitalario: "Privado",
                mostrarPadecimiento: "SI",
                hospEleccionPropia: "SI",
                detalleHosp: "",
                medEleccionPropia: "SI",
                detalleMed: "",
                huboAsesoria: "NO",
                detalleAsesoria: "",
                huboDescuento: "NO",
                detalleDescuento: ""
            }
        ],
        siniestros: [
            { id: "03230261780-009", aseguradoId: "FOAC2902105X6", titulo: "Diabetes", fecha: "2024-10-06", estado: "Abierto", hospital: "Hospital ABC" },
            { id: "03230261780-010", aseguradoId: "FOAC2902105X6-2", titulo: "Infección Respiratoria", fecha: "2025-01-10", estado: "Abierto", hospital: "Hospital Angeles" }
        ]
    };
}
