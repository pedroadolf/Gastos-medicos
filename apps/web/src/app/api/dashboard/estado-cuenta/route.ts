import { NextResponse } from "next/server";
import { getSupabaseService } from "@/services/supabase";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = getSupabaseService();

        // 1. Fetch all user_roles (insured persons)
        const { data: userRoles, error: urError } = await supabase
            .from('user_roles')
            .select('*');
        if (urError) console.warn("⚠️ user_roles:", urError.message);

        // 2. Fetch siniestros with tramites and facturas
        const { data: siniestros, error: sError } = await supabase
            .from('siniestros')
            .select(`
                id,
                numero_siniestro,
                user_id,
                nombre_siniestro,
                descripcion,
                fecha_apertura,
                tramites (
                    id,
                    tipo,
                    status,
                    paciente_nombre,
                    facturas ( monto_total, tipo )
                )
            `)
            .order('fecha_apertura', { ascending: false });
        if (sError) console.warn("⚠️ siniestros:", sError.message);

        // 3. Fetch tramites for kanban view
        const { data: tramites, error: tError } = await supabase
            .from('tramites')
            .select('id, tipo, status, paciente_nombre, created_at, siniestro_id')
            .order('created_at', { ascending: false })
            .limit(50);
        if (tError) console.warn("⚠️ tramites:", tError.message);

        // 4. Fetch facturas for financial breakdown
        const { data: facturas, error: fError } = await supabase
            .from('facturas')
            .select('tramite_id, monto_total, tipo');
        if (fError) console.warn("⚠️ facturas:", fError.message);

        // === Build insured cards ===
        const siniestrosByUser: Record<string, any[]> = {};
        (siniestros || []).forEach(s => {
            if (!s.user_id) return;
            if (!siniestrosByUser[s.user_id]) siniestrosByUser[s.user_id] = [];
            siniestrosByUser[s.user_id].push(s);
        });

        const insuredCards = (userRoles || []).map(u => {
            const userSiniestros = siniestrosByUser[u.user_id] || [];
            const openSiniestros = userSiniestros.filter(s =>
                (s.tramites || []).some((t: any) =>
                    ['pending', 'processing', 'borrador', 'en_revision'].includes(t.status)
                )
            );

            // Total consumed per user
            let consumed = 0;
            userSiniestros.forEach(s => {
                (s.tramites || []).forEach((t: any) => {
                    (t.facturas || []).forEach((f: any) => {
                        consumed += Number(f.monto_total || f.importe || 0);
                    });
                });
            });

            // Active condition (first siniestro name)
            const activeSiniestro = userSiniestros[0];
            const padecimiento = activeSiniestro?.nombre_siniestro || 'Sin siniestros activos';
            const descripcion = activeSiniestro?.descripcion || '';

            return {
                userId: u.user_id,
                email: u.email,
                name: u.email?.split('@')[0].replace('.', ' ').toUpperCase() || 'ASEGURADO',
                role: u.role,
                consumed,
                totalLimit: 5_000_000,
                sublimit: 1_000_000,
                openSiniestrosCount: openSiniestros.length,
                padecimiento,
                descripcion,
                deducibleStatus: consumed > 0 ? 'cumplido' : 'pendiente',
                siniestros: userSiniestros.map(s => ({
                    id: s.id,
                    numero: s.numero_siniestro,
                    nombre: s.nombre_siniestro,
                    fecha: s.fecha_apertura,
                }))
            };
        });

        // === Build kanban ===
        const kanban = {
            en_tramite: (tramites || []).filter(t =>
                ['pending', 'borrador', 'en_revision'].includes(t.status)
            ).map(t => ({ id: t.id, nombre: t.paciente_nombre || 'Sin nombre', tipo: t.tipo, fecha: t.created_at })),
            pre_autorizados: (tramites || []).filter(t => t.status === 'audited')
                .map(t => ({ id: t.id, nombre: t.paciente_nombre || 'Sin nombre', tipo: t.tipo, fecha: t.created_at })),
            en_pago: (tramites || []).filter(t => t.status === 'processing')
                .map(t => ({ id: t.id, nombre: t.paciente_nombre || 'Sin nombre', tipo: t.tipo, fecha: t.created_at })),
            rechazados: (tramites || []).filter(t => t.status === 'error' || t.status === 'rechazado')
                .map(t => ({ id: t.id, nombre: t.paciente_nombre || 'Sin nombre', tipo: t.tipo, fecha: t.created_at })),
        };

        // === Financial breakdown by gasto type ===
        const gastoTotals = { H: 0, M: 0, F: 0, O: 0 };
        (facturas || []).forEach(f => {
            const tipo = (f.tipo || 'O') as 'H' | 'M' | 'F' | 'O';
            if (gastoTotals[tipo] !== undefined) {
                gastoTotals[tipo] += Number(f.monto_total || 0);
            } else {
                gastoTotals['O'] += Number(f.monto_total || 0);
            }
        });

        return NextResponse.json({
            insuredCards,
            kanban,
            gastoDesglose: {
                hospitalizacion: gastoTotals.H,
                medicamentos: gastoTotals.M,
                honorarios: gastoTotals.F,
                otros: gastoTotals.O,
            },
            totalTramites: tramites?.length || 0,
        });

    } catch (error: any) {
        console.error("❌ Estado cuenta API:", error);
        return NextResponse.json({ insuredCards: [], kanban: {}, gastoDesglose: {} }, { status: 500 });
    }
}
