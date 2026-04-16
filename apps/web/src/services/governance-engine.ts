import { getSupabaseService } from './supabase';

export type GovernanceContext = {
    runwayDays: number;
    actionType: string;
    aiConfidence: number;
    isCriticalWorkflow: boolean;
};

export type GovernanceDecision = {
    decision: 'ALLOW' | 'BLOCK' | 'REQUIRES_APPROVAL';
    reason: string;
    ruleId?: string;
};

export type GovernanceMode = 'NORMAL' | 'ELEVATED' | 'CONSERVATIVE';

export function getGovernanceMode(anomalies: any[]): GovernanceMode {
    const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
    if (criticalCount > 5) return 'CONSERVATIVE';
    if (criticalCount > 2) return 'ELEVATED';
    return 'NORMAL';
}

export async function checkGovernance(context: GovernanceContext & { mode?: GovernanceMode }): Promise<GovernanceDecision> {
    const { runwayDays, actionType, aiConfidence, isCriticalWorkflow, mode = 'NORMAL' } = context;

    // Adaptive Logic based on Mode
    if (mode === 'CONSERVATIVE' && !isCriticalWorkflow) {
        return {
            decision: 'BLOCK',
            reason: 'System in CONSERVATIVE mode due to high anomaly rate. Non-urgent activities frozen.'
        };
    }

    if (mode === 'ELEVATED' && actionType === 'SWITCH_PROVIDER') {
        return {
            decision: 'REQUIRES_APPROVAL',
            reason: 'Elevated system risk: High-impact actions require manual gate.'
        };
    }

    // Static Rule 1: Financial Lock (Critical Runway)
    if (runwayDays < 10) {
        if (!isCriticalWorkflow) {
            return {
                decision: 'BLOCK',
                reason: 'Resources conserved for critical paths (Runway < 10 days).'
            };
        }
        
        if (actionType === 'SWITCH_PROVIDER') {
            return {
                decision: 'REQUIRES_APPROVAL',
                reason: 'High-cost action in low runway period requires human audit.'
            };
        }
    }

    // Rule 2: Confidence Threshold
    const minConfidence = mode === 'NORMAL' ? 0.75 : 0.85;
    if (aiConfidence < minConfidence) {
        return {
            decision: 'REQUIRES_APPROVAL',
            reason: `AI Confidence (${Math.round(aiConfidence * 100)}%) below threshold for current ${mode} mode.`
        };
    }

    return { decision: 'ALLOW', reason: 'Passed all adaptive governance checks.' };
}

export async function queueForApproval(execution_id: string, workflow_name: string, ai: any) {
    const supabase = getSupabaseService();
    await supabase.from('approval_queue').insert({
        execution_id,
        workflow_name,
        action_type: ai.action?.type || 'UNKNOWN',
        ai_confidence: ai.confidence,
        reason: ai.probableCause,
        status: 'pending'
    });
}
