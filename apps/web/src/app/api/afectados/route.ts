import { NextResponse } from "next/server";
import { getGoogleSheetsClient } from "@/services/googleSheets";
import { getSupabaseService } from "@/services/supabase";

// Sin caché — datos en tiempo real
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = getSupabaseService();
        
        // 1. Intentar obtener datos de Supabase (Nueva Fuente de Verdad)
        // Obtenemos siniestros y roles de usuario
        const { data: dbSiniestros, error: sError } = await supabase
            .from('siniestros')
            .select(`
                id,
                numero_siniestro,
                nombre_siniestro,
                user_id,
                fecha_apertura
            `);

        const { data: dbRoles, error: uError } = await supabase
            .from('user_roles')
            .select('*');

        // Mapear asegurados desde user_roles
        const dbAsegurados = (dbRoles || []).map(u => ({
            id: u.user_id || u.email, // Preferimos UUID si existe
            nombre: u.email.split('@')[0].toUpperCase().replace('.', ' '), 
            email: u.email,
            rfc: "RFC-PENDIENTE", 
            poliza: "PÓLIZA-SUPABASE",
            aseguradora: "METLIFE",
            empresa: "GMM PRO"
        }));

        // Mapear siniestros desde la tabla siniestros
        const siniestros = (dbSiniestros || []).map(s => ({
            id: s.id,
            aseguradoId: s.user_id, // Este debe ser un UUID que coincida con user_roles.user_id
            titulo: s.nombre_siniestro,
            numeroSiniestro: s.numero_siniestro,
            fecha: s.fecha_apertura?.split('T')[0] || new Date().toISOString().split('T')[0],
            estado: "Activo"
        }));

        // 2. Obtener datos de Google Sheets (Siempre para completar info o fallback)
        const sheetId = process.env.GOOGLE_SHEET_ID || "1aHust80ArTzLxr_n1s9XSFdTvNopCYRmvoU75MJmsHA";
        let sheetAsegurados: any[] = [];
        let sheetSiniestros: any[] = [];

        try {
            const sheets = await getGoogleSheetsClient();
            const dbData = await sheets.spreadsheets.values.get({
                spreadsheetId: sheetId,
                range: "Asegurados!A1:ZZ",
            });

            const rows = dbData.data.values || [];
            if (rows && rows.length >= 2) {
                const headers = rows[0].map((h: any) => (h || "").toString().trim());
                const getIdx = (nameMatches: string[]): number => {
                    for (const match of nameMatches) {
                        const idx = headers.findIndex((h: string) => h.toLowerCase() === match.toLowerCase());
                        if (idx !== -1) return idx;
                    }
                    return -1;
                };

                const val = (row: any[], nameMatches: string[]): string => {
                    const idx = getIdx(nameMatches);
                    return idx !== -1 ? (row[idx] ?? "").toString().trim() : "";
                };

                const dataRows = rows.slice(1);
                sheetAsegurados = dataRows.map((row: any[]) => {
                    const nombres = val(row, ["4_SRGMM_Afec_Nombres"]);
                    const apPat   = val(row, ["4_SRGMM_Afec_Appaterno"]);
                    const apMat   = val(row, ["4_SRGMM_Afec_Apmaterno"]);
                    const nombre  = `${nombres} ${apPat} ${apMat}`.trim();
                    const rfc = val(row, ["4_SRGMM_Titular_Rfc_1", "4_SRGMM_Afec_Rfc"]);

                    return {
                        id: rfc || nombre,
                        nombre: nombre || val(row, ["3_Carta_Remesa_Nombre_Afectado"]),
                        rfc,
                        poliza: val(row, ["4_SRGMM_Poliza"]),
                        empresa: val(row, ["4_SRGMM_Razon_Social"]),
                        aseguradora: val(row, ["3_Carta_Remesa_Aseguradora"]),
                        email: val(row, ["From email", "TO Email"]),
                    };
                }).filter((a: any) => a.nombre.length > 2);

                sheetSiniestros = dataRows.map((row: any[], index: number) => {
                    const sNum = val(row, ["2_Case_Management_Numero_Siniestro", "4_SRGMM_Siniestro", "3_Carta_Remesa_No_Siniestro"]) || `SIN-${index + 1}`;
                    const rfc  = val(row, ["4_SRGMM_Titular_Rfc_1", "4_SRGMM_Afec_Rfc"]);
                    const pad = val(row, ["3_Carta_Remesa_Padecimiento", "4_SRGMM_Describir_Sintomas"]);

                    return {
                        id: `${sNum}-${index}`,
                        aseguradoId: rfc,
                        titulo: pad || "Trámite Médico",
                        numeroSiniestro: sNum,
                        fecha: new Date().toISOString().split("T")[0],
                        estado: "Activo",
                    };
                }).filter((s: any) => s.aseguradoId !== "");
            }
        } catch (sheetsError) {
            console.warn("⚠️ Error al leer de Google Sheets:", sheetsError);
        }

        // Combinar datos: Supabase tiene prioridad, pero Sheets completa el catálogo
        // Unificamos asegurados para evitar duplicados por email
        const allAseguradosMap = new Map();
        
        // Primero Sheets (para tener RFCs y Nombres reales)
        sheetAsegurados.forEach(a => allAseguradosMap.set(a.email?.toLowerCase() || a.id, a));
        
        // Luego Supabase (si el usuario ya está en Supabase, respetamos su UUID como ID principal)
        dbAsegurados.forEach(a => {
            const key = a.email?.toLowerCase();
            if (allAseguradosMap.has(key)) {
                const existing = allAseguradosMap.get(key);
                allAseguradosMap.set(key, { ...existing, ...a }); // Merged, Supabase 'id' (UUID) over Sheets 'id' (RFC)
            } else {
                allAseguradosMap.set(key, a);
            }
        });

        // Combinar Siniestros
        const allSiniestros = [...siniestros, ...sheetSiniestros];

        return NextResponse.json({ 
            success: true, 
            asegurados: Array.from(allAseguradosMap.values()), 
            siniestros: allSiniestros,
            debug: { supabaseCount: siniestros.length, sheetsCount: sheetSiniestros.length }
        });

    } catch (error: any) {
        console.error("❌ Error Afectados API:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
