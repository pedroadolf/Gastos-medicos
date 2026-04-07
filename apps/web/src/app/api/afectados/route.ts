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
            user_id: s.user_id, 
            nombre_siniestro: s.nombre_siniestro,
            numero_siniestro: s.numero_siniestro,
            fecha_apertura: s.fecha_apertura?.split('T')[0] || new Date().toISOString().split('T')[0],
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
                        user_id: rfc,
                        nombre_siniestro: pad || "Trámite Médico",
                        numero_siniestro: sNum,
                        fecha_apertura: new Date().toISOString().split("T")[0],
                        estado: "Activo",
                    };
                }).filter((s: any) => s.user_id !== "");
            }
        } catch (sheetsError) {
            console.warn("⚠️ Error al leer de Google Sheets:", sheetsError);
        }

        // 3. Unificar asegurados y crear mapeo para siniestros
        const allAseguradosMap = new Map();
        const rfcToUuidMap = new Map();
        const emailToUuidMap = new Map();
        
        // Primero Sheets (para tener RFCs y Nombres reales)
        sheetAsegurados.forEach(a => {
            allAseguradosMap.set(a.email?.toLowerCase() || a.id, a);
            if (a.rfc) rfcToUuidMap.set(a.rfc, a.id);
            if (a.email) emailToUuidMap.set(a.email.toLowerCase(), a.id);
        });
        
        // Luego Supabase (prioridad de ID UUID)
        dbAsegurados.forEach(a => {
            const key = a.email?.toLowerCase();
            if (allAseguradosMap.has(key)) {
                const existing = allAseguradosMap.get(key);
                const updated = { ...existing, ...a };
                allAseguradosMap.set(key, updated);
                // Mapeo robusto
                if (existing.rfc) rfcToUuidMap.set(existing.rfc, a.id);
                emailToUuidMap.set(key, a.id);
            } else {
                allAseguradosMap.set(key, a);
                emailToUuidMap.set(key, a.id);
            }
        });

        // 4. Mapear Siniestros de Sheets a los IDs finales (UUIDs si existen)
        const mappedSheetSiniestros = sheetSiniestros.map(s => {
            const finalUserId = rfcToUuidMap.get(s.user_id) || emailToUuidMap.get(s.user_id?.toLowerCase()) || s.user_id;
            return {
                ...s,
                user_id: finalUserId
            };
        });

        // Combinar Siniestros
        const allSiniestros = [...siniestros, ...mappedSheetSiniestros];
        console.log(`[API AFECTADOS] Total Siniestros: ${allSiniestros.length} (DB: ${siniestros.length}, Sheets: ${mappedSheetSiniestros.length})`);

        return NextResponse.json({ 
            success: true, 
            asegurados: Array.from(allAseguradosMap.values()), 
            siniestros: allSiniestros,
            debug: { 
                supabaseCount: siniestros.length, 
                sheetsCount: sheetSiniestros.length,
                totalAsegurados: allAseguradosMap.size
            }
        });

    } catch (error: any) {
        console.error("❌ Error Afectados API:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
