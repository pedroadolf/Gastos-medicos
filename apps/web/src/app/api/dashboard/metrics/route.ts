import { NextResponse } from "next/server";
import { getSupabaseService } from "@/services/supabase";
import { clusterAnomalies, generateCavemanInsight } from "@/services/anomaly-detector";
import { getGovernanceMode } from "@/services/governance-engine";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = getSupabaseService();

        // 1. Fetch Real Consumption from Facturas
        const { data: facturas, error: fError } = await supabase
            .from('facturas')
            .select('monto_total');

        if (fError) console.warn("⚠️ Error fetching facturas:", fError.message);
        const totalConsumed = facturas?.reduce((acc, f) => acc + Number(f.monto_total), 0) || 0;

        // 2. Fetch Workflow Health
        const { data: executions, error: eError } = await supabase
            .from('workflow_executions')
            .select('*')
            .order('start_time', { ascending: false })
            .limit(100);

        if (eError) console.warn("⚠️ Error fetching executions:", eError.message);
        const successCount = executions?.filter(e => e.status === 'success').length || 0;
        const totalExecs = executions?.length || 0;
        const healthRate = totalExecs > 0 ? (successCount / totalExecs) * 100 : 100;

        // 3. Fetch Active Alerts from System Events
        const { data: alerts, error: aError } = await supabase
            .from('system_events')
            .select('*, workflow_executions(workflow_name)')
            .order('timestamp', { ascending: false })
            .limit(5);

        if (aError) console.warn("⚠️ Error fetching system_events:", aError.message);

        // 4. Fetch Kanban States from Executions
        const kanban = {
            queued: executions?.filter(e => e.status === 'queued').length || 0,
            processing: executions?.filter(e => e.status === 'processing' || e.status === 'retrying').length || 0,
            completed: executions?.filter(e => e.status === 'success').length || 0,
            error: executions?.filter(e => e.status === 'error').length || 0
        };

        // 5. Fetch Insured Data
        const { data: userRoles, error: urError } = await supabase.from('user_roles').select('*');
        if (urError) console.warn("⚠️ Error fetching user_roles:", urError.message);

        const { data: userConsumptionRaw, error: ucError } = await supabase
            .from('facturas')
            .select(`
                monto_total,
                tramites (
                    siniestros (
                        user_id
                    )
                )
            `);
        
        if (ucError) console.warn("⚠️ Error fetching user consumption:", ucError.message);

        const consumptionByUser: Record<string, number> = {};
        userConsumptionRaw?.forEach((item: any) => {
            const userId = item.tramites?.siniestros?.user_id;
            if (userId) {
                consumptionByUser[userId] = (consumptionByUser[userId] || 0) + Number(item.monto_total);
            }
        });

        const insuredUsers = (userRoles || []).map(u => ({
            id: u.user_id,
            name: u.email?.split('@')[0].toUpperCase().replace('.', ' ') || 'UNKNOWN',
            email: u.email,
            consumed: consumptionByUser[u.user_id] || 0,
            totalLimit: 1000000
        }));

        // --- 🛡️ TRUST LAYER LOGIC (SRE V2) ---
        const lastExecutionAt = executions?.[0]?.start_time;
        const now = Date.now();
        const lastSync = lastExecutionAt ? new Date(lastExecutionAt).getTime() : 0;
        const dataLatencyMs = lastSync ? now - lastSync : 999999;

        let status: 'LIVE' | 'DELAYED' | 'STALE' = 'LIVE';
        if (dataLatencyMs > 300000) status = 'STALE'; 
        else if (dataLatencyMs > 60000) status = 'DELAYED';

        const baseLimit = 5000000;
        const excessLimit = 100000000;
        const trigger = baseLimit;
        const currentConsumed = totalConsumed;
        
        const baseRemaining = Math.max(baseLimit - currentConsumed, 0);
        const excessUsed = Math.max(currentConsumed - trigger, 0);
        const excessRemaining = Math.max(excessLimit - excessUsed, 0);
        const layer = currentConsumed < trigger ? 'BASE' : 'EXCESS';
        
        const effectiveAvailable = layer === 'BASE' 
            ? baseRemaining + excessLimit 
            : excessRemaining;

        const riskMode = layer === 'BASE' && currentConsumed > baseLimit * 0.85 ? 'TRANSITION' : layer;

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data: recentFacturas } = await supabase
            .from('facturas')
            .select('monto_total')
            .gte('created_at', sevenDaysAgo);
        
        const sevenDayTotal = recentFacturas?.reduce((acc, f) => acc + Number(f.monto_total), 0) || 0;
        const dailyBurnRate = sevenDayTotal / 7;
        const runwayDays = dailyBurnRate > 0 ? Math.floor(effectiveAvailable / dailyBurnRate) : 999;

        const { data: performanceData } = await supabase
            .from('decision_outcomes')
            .select('action_taken, result, improvement_score');
        
        const aiPerformance: any[] = [];
        if (performanceData) {
            const stats: Record<string, { total: number, successes: number, sumScore: number }> = {};
            performanceData.forEach(d => {
                if (!stats[d.action_taken]) stats[d.action_taken] = { total: 0, successes: 0, sumScore: 0 };
                stats[d.action_taken].total++;
                if (d.result === 'success') stats[d.action_taken].successes++;
                stats[d.action_taken].sumScore += d.improvement_score || 0;
            });
            Object.keys(stats).forEach(action => {
                aiPerformance.push({
                    action,
                    successRate: stats[action].successes / stats[action].total,
                    avgScore: stats[action].sumScore / stats[action].total,
                    totalCount: stats[action].total
                });
            });
        }
        
        const healingEffectiveness = aiPerformance.length > 0 
            ? (aiPerformance.reduce((acc, p) => acc + p.successRate, 0) / aiPerformance.length) * 100 
            : 0;

        let confidenceScore = 100;
        const issues: string[] = [];
        if (riskMode === 'TRANSITION') issues.push('Approaching base coverage limit');
        if (status === 'STALE') issues.push('System heartbeat lost (STALE)');

        const recentErrors = (executions || []).filter(e => e.status === 'error').length;
        if (recentErrors > 0) issues.push(`${recentErrors} critical execution failures detected`);

        const { data: activeAnomalies } = await supabase
            .from('anomalies')
            .select('*')
            .eq('status', 'active');

        const clusters = clusterAnomalies(activeAnomalies || []);
        const copilotInsight = generateCavemanInsight(activeAnomalies || []);
        const governanceMode = getGovernanceMode(activeAnomalies || []);

        const { data: recentPreventive } = await supabase
            .from('preventive_actions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        return NextResponse.json({
            data: {
                kpis: {
                    baseLimit,
                    consumed: currentConsumed,
                    effectiveAvailable,
                    baseRemaining,
                    excessRemaining,
                    riskMode,
                    layer,
                    healthRate: Math.min(100, Math.max(0, healthRate)),
                    forecast: { dailyBurn: dailyBurnRate, runwayDays },
                    effectiveness: healingEffectiveness,
                    intelligence: { clusters, copilot: copilotInsight, governanceMode, preventive: recentPreventive || [] }
                },
                kanban,
                alerts: (alerts || []).map((a: any) => ({
                    id: a.id, execution_id: a.execution_id, message: a.message, severity: a.severity, timestamp: a.timestamp
                })),
                insuredUsers,
                insured: insuredUsers, // Legacy support
                executions: (executions || []).map(e => ({
                    id: e.execution_id || e.id, status: e.status, name: e.workflow_name, startedAt: e.start_time
                })),
                aiPerformance
            },
            meta: { generatedAt: new Date().toISOString(), dataLatencyMs, recordsAnalyzed: totalExecs },
            trust: { status, confidenceScore, issues, lastSync: new Date(lastSync).toISOString() }
        });

    } catch (error: any) {
        console.error("❌ Error Metrics API:", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            trust: {
                status: 'STALE',
                confidenceScore: 0
            }
        }, { status: 500 });
    }
}
