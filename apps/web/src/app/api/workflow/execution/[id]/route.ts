import { NextResponse } from "next/server";
import { getSupabaseService } from "@/services/supabase";
import { analyzeIncident } from "@/services/ai-engine";
import { checkGovernance, queueForApproval } from "@/services/governance-engine";
import { detectAnomalies, recordAnomalies } from "@/services/anomaly-detector";
import { detectTrends, decidePreventiveAction, recordPreventiveAction } from "@/services/preventive-engine";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const executionId = params.id;
        const supabase = getSupabaseService();

        // 1. Fetch Execution Data
        const { data: execution } = await supabase
            .from('workflow_executions')
            .select('*')
            .eq('execution_id', executionId)
            .single();

        if (!execution) throw new Error("Execution not found");

        // 2. Fetch Steps
        const { data: steps } = await supabase
            .from('workflow_steps')
            .select('*')
            .eq('execution_id', executionId)
            .order('start_time', { ascending: true });

        // Financial Context (Exceso + Runway)
        const { data: facturas } = await supabase.from('facturas').select('importe');
        const consumed = facturas?.reduce((acc, f) => acc + Number(f.importe), 0) || 0;
        const baseLimit = 5000000;
        const effectiveAvailable = consumed < baseLimit ? (baseLimit - consumed) + 100000000 : 100000000 - (consumed - baseLimit);

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data: recentFacturas } = await supabase.from('facturas').select('importe').gte('created_at', sevenDaysAgo);
        const dailyBurn = (recentFacturas?.reduce((acc, f) => acc + Number(f.importe), 0) || 0) / 7;
        const runwayDays = dailyBurn > 0 ? effectiveAvailable / dailyBurn : 999;

        // History
        const { data: historyData } = await supabase.from('decision_outcomes').select('action_taken, result');
        const history: Record<string, number> = {};
        if (historyData) {
            const counts: any = {};
            historyData.forEach(r => {
                if (!counts[r.action_taken]) counts[r.action_taken] = { t: 0, s: 0 };
                counts[r.action_taken].t++;
                if (r.result === 'success') counts[r.action_taken].s++;
            });
            Object.keys(counts).forEach(k => history[k] = counts[k].s / counts[k].t);
        }

        const failedStep = (steps || []).find(s => s.status === 'error' || s.status === 'timeout');

        // 🧠 AI Diagnosis
        const aiDiagnosis = failedStep ? analyzeIncident({
            error: failedStep.event_payload?.error || "Timeout",
            step: failedStep.step_name,
            retryCount: 0, 
            duration: execution.duration_ms || 0,
            frequency: 0,
            coverageLayer: consumed < baseLimit ? 'BASE' : 'EXCESS',
            effectiveAvailable,
            riskLevel: consumed > baseLimit * 0.85 ? 'HIGH' : 'LOW',
            history
        }) : null;

        // 🛡️ Governance Gate
        let governanceDecision = null;
        if (aiDiagnosis?.action) {
            governanceDecision = await checkGovernance({
                runwayDays,
                actionType: aiDiagnosis.action.type,
                aiConfidence: aiDiagnosis.confidence / 100,
                isCriticalWorkflow: execution.workflow_name.includes('Critical')
            });

            if (governanceDecision.decision === 'REQUIRES_APPROVAL') {
                await queueForApproval(executionId, execution.workflow_name, aiDiagnosis);
            }
        }

        // 🚨 Anomaly Detection (Self-Awareness)
        const anomalies = await detectAnomalies(execution.workflow_name, {
            latency: execution.duration_ms || 0,
            hasError: execution.status === 'error'
        });

        if (anomalies.length > 0) {
            await recordAnomalies(anomalies, executionId, execution.workflow_name);
        }

        // 🔮 Preventive Scaling (Anticipatory Control)
        const trends = await detectTrends(execution.workflow_name);
        const preventiveActions = [];

        for (const signal of trends) {
            const decision = decidePreventiveAction(signal);
            if (decision) {
                const gov = await checkGovernance({
                    runwayDays,
                    actionType: 'PREVENTIVE',
                    aiConfidence: decision.confidence,
                    isCriticalWorkflow: execution.workflow_name.includes('Critical')
                });

                await recordPreventiveAction(executionId, execution.workflow_name, signal, decision, gov.decision === 'ALLOW' ? 'executed' : gov.decision.toLowerCase());
                
                preventiveActions.push({
                    ...decision,
                    signal: signal.type,
                    status: gov.decision === 'ALLOW' ? 'executed' : gov.decision
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                execution,
                steps: steps || [],
                ai: aiDiagnosis,
                governance: governanceDecision,
                anomalies,
                preventive: preventiveActions
            }
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }
}
