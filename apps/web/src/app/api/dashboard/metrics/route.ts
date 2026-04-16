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
            .select('importe');

        const totalConsumed = facturas?.reduce((acc, f) => acc + Number(f.importe), 0) || 0;

        // 2. Fetch Workflow Health
        const { data: executions, error: eError } = await supabase
            .from('workflow_executions')
            .select('status, start_time')
            .order('start_time', { ascending: false })
            .limit(100);

        const successCount = executions?.filter(e => e.status === 'success').length || 0;
        const totalExecs = executions?.length || 0;
        const healthRate = totalExecs > 0 ? (successCount / totalExecs) * 100 : 100;

        // 3. Fetch Active Alerts from System Events
        const { data: alerts, error: aError } = await supabase
            .from('system_events')
            .select('*, workflow_executions(workflow_name)')
            .order('timestamp', { ascending: false })
            .limit(5);

        // 4. Fetch Kanban States from Executions
        const kanban = {
            queued: executions?.filter(e => e.status === 'queued').length || 0,
            processing: executions?.filter(e => e.status === 'processing' || e.status === 'retrying').length || 0,
            completed: executions?.filter(e => e.status === 'success').length || 0,
            error: executions?.filter(e => e.status === 'error').length || 0
        };

        // 5. Fetch Insured Data (Merging with what we had in /api/afectados logic)
        // For simplicity here, we fetch from user_roles as per /api/afectados
        const { data: userRoles } = await supabase.from('user_roles').select('*');

        // Match user consumption (this requires a join or separate query)
        // For the V12 SRE Dashboard, we'll try to group facturas by user_id via siniestros
        const { data: userConsumptionRaw } = await supabase
            .from('facturas')
            .select(`
                importe,
                tramites (
                    siniestros (
                        user_id
                    )
                )
            `);

        const consumptionByUser: Record<string, number> = {};
        userConsumptionRaw?.forEach((item: any) => {
            const userId = item.tramites?.siniestros?.user_id;
            if (userId) {
                consumptionByUser[userId] = (consumptionByUser[userId] || 0) + Number(item.importe);
            }
        });

        const insuredUsers = (userRoles || []).map(u => ({
            id: u.user_id,
            name: u.email.split('@')[0].toUpperCase().replace('.', ' '),
            email: u.email,
            consumed: consumptionByUser[u.user_id] || 0,
            totalLimit: 1000000 // Individual sub-limit
        }));

        // --- 🛡️ TRUST LAYER LOGIC (SRE V2) ---
        
        // 1. Freshness / Status Logic
        // @ts-ignore
        const lastExecutionAt = executions?.[0]?.start_time;
        const now = Date.now();
        const lastSync = lastExecutionAt ? new Date(lastExecutionAt).getTime() : 0;
        const dataLatencyMs = lastSync ? now - lastSync : 999999;

        let status: 'LIVE' | 'DELAYED' | 'STALE' = 'LIVE';
        if (dataLatencyMs > 300000) status = 'STALE'; // 5 mins
        else if (dataLatencyMs > 60000) status = 'DELAYED'; // 1 min

        // 2. Precise Coverage Modeling (SRE V4)
        const baseLimit = 5000000;
        const excessLimit = 100000000; // INF
        const trigger = baseLimit; // Excess activates after base
        const currentConsumed = totalConsumed;
        
        const baseRemaining = Math.max(baseLimit - currentConsumed, 0);
        const excessUsed = Math.max(currentConsumed - trigger, 0);
        const excessRemaining = Math.max(excessLimit - excessUsed, 0);
        const layer = currentConsumed < trigger ? 'BASE' : 'EXCESS';
        
        const effectiveAvailable = layer === 'BASE' 
            ? baseRemaining + excessLimit 
            : excessRemaining;

        const riskMode = layer === 'BASE' && currentConsumed > baseLimit * 0.85 ? 'TRANSITION' : layer;

        // 3. Precise Burn Rate & Runway (FinOps Pillar)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data: recentFacturas } = await supabase
            .from('facturas')
            .select('importe')
            .gte('created_at', sevenDaysAgo);
        
        const sevenDayTotal = recentFacturas?.reduce((acc, f) => acc + Number(f.importe), 0) || 0;
        const dailyBurnRate = sevenDayTotal / 7;
        const runwayDays = dailyBurnRate > 0 ? Math.floor(effectiveAvailable / dailyBurnRate) : 999;

        // Auto-Alerting for Runway
        if (runwayDays < 30) {
            await supabase.from('system_forecast_alerts').insert({
                type: runwayDays < 15 ? 'RUNWAY_CRITICAL' : 'RUNWAY_LOW',
                current_value: runwayDays,
                threshold: 30,
                message: `Coverage expected to exhaust in ${runwayDays} days at current burn rate ($${dailyBurnRate.toLocaleString()}/day)`
            });
        }

        // 4. Learning Loop (Basic Effectiveness Metric)
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

        // 5. Confidence Score calculation (AIOps Logic)
        let confidenceScore = 100;
        const issues: string[] = [];

        if (riskMode === 'TRANSITION') {
            confidenceScore -= 10;
            issues.push('Approaching base coverage limit');
        } else if (riskMode === 'EXCESS') {
            confidenceScore -= 15;
            issues.push('Operating in excess coverage layer');
        }
        
        if (excessRemaining < excessLimit * 0.2) {
            confidenceScore -= 30;
            issues.push('CRITICAL: Excess layer near depletion');
        }

        if (status === 'STALE') {
            confidenceScore -= 40;
            issues.push('System heartbeat lost (STALE)');
        }

        const recentErrors = (executions || []).filter(e => e.status === 'error').length;
        if (recentErrors > 0) {
            confidenceScore -= (recentErrors * 20);
            issues.push(`${recentErrors} critical execution failures detected`);
        }

        confidenceScore = Math.max(0, confidenceScore);

        // 🚨 Fetch Active Anomalies for Intelligence Layer
        const { data: activeAnomalies } = await supabase
            .from('anomalies')
            .select('*')
            .eq('status', 'active');

        // 🧠 Phase 5: Self-Regulation Logic
        const clusters = clusterAnomalies(activeAnomalies || []);
        const copilotInsight = generateCavemanInsight(activeAnomalies || []);
        const governanceMode = getGovernanceMode(activeAnomalies || []);

        // 🔮 Phase 6: Fetch Recent Preventive Actions
        const { data: recentPreventive } = await supabase
            .from('preventive_actions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        return NextResponse.json({
            data: {
                kpis: {
                    baseLimit,
                    excessLimit,
                    consumed: currentConsumed,
                    effectiveAvailable,
                    baseRemaining,
                    excessRemaining,
                    riskMode,
                    layer,
                    healthRate: Math.min(100, Math.max(0, healthRate)),
                    forecast: {
                        dailyBurn: dailyBurnRate,
                        runwayDays,
                        daysToDepleteBase: Math.floor(baseRemaining / (dailyBurnRate || 1)),
                        daysToDepleteTotal: runwayDays
                    },
                    effectiveness: healingEffectiveness,
                    intelligence: {
                        clusters,
                        copilot: copilotInsight,
                        governanceMode,
                        preventive: recentPreventive || []
                    },
                    excessPolicy: {
                        number: "M172 1011",
                        deductible: 2000000,
                        coinsurance: "10%",
                        startDate: "2025-10-01"
                    }
                },
                kanban,
                alerts: (alerts || []).map((a: any) => ({
                    id: a.id,
                    execution_id: a.execution_id,
                    message: a.message,
                    severity: a.severity,
                    timestamp: a.timestamp,
                    impact: a.metadata?.impact,
                    action: a.metadata?.action,
                    workflow_executions: a.workflow_executions
                })),
                insuredUsers,
                executions: (executions || []).map(e => ({
                    id: e.execution_id,
                    status: e.status,
                    name: e.workflow_name,
                    startedAt: e.start_time
                })),
                aiPerformance
            },
            meta: {
                generatedAt: new Date().toISOString(),
                dataLatencyMs,
                recordsAnalyzed: totalExecs
            },
            trust: {
                status,
                confidenceScore,
                issues,
                lastSync: new Date(lastSync).toISOString()
            }
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
