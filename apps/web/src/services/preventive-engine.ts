import { getSupabaseService } from './supabase';

export type TrendSignal = {
    type: 'latency_trend' | 'error_trend' | 'burn_trend';
    strength: number;
    workflowName: string;
};

export type PreventiveActionDecision = {
    action: 'INCREASE_TIMEOUT' | 'SWITCH_PROVIDER' | 'LIMIT_RETRIES' | 'ENABLE_CONSERVATIVE_MODE';
    confidence: number;
    reason: string;
};

export async function detectTrends(workflowName: string): Promise<TrendSignal[]> {
    const supabase = getSupabaseService();
    const signals: TrendSignal[] = [];

    // Fetch last 5 execution durations for this workflow
    const { data: series } = await supabase
        .from('recent_performance_series')
        .select('duration_ms, status')
        .eq('workflow_name', workflowName)
        .lte('recency', 5)
        .order('start_time', { ascending: true });

    if (!series || series.length < 3) return [];

    const durations = series.map(s => s.duration_ms);
    
    // 📈 Latency Trend Check
    const strength = getTrendStrength(durations);
    if (strength > 0.6) {
        signals.push({
            type: 'latency_trend',
            strength,
            workflowName
        });
    }

    // 📈 Error Rate Trend Check
    const errorCount = series.filter(s => s.status === 'error').length;
    if (errorCount >= 2) {
        signals.push({
            type: 'error_trend',
            strength: errorCount / series.length,
            workflowName
        });
    }

    return signals;
}

function getTrendStrength(values: number[]): number {
    if (values.length < 3) return 0;
    const last = values.slice(-3);
    // Simple slope check: is it consistently increasing?
    if (last[2] > last[1] && last[1] > last[0]) return 1;
    if (last[2] > last[1]) return 0.6;
    return 0;
}

export function decidePreventiveAction(signal: TrendSignal): PreventiveActionDecision | null {
    if (signal.type === 'latency_trend') {
        return {
            action: 'INCREASE_TIMEOUT',
            confidence: 0.85,
            reason: `Rising latency trend (${Math.round(signal.strength * 100)}% slope) detected in pre-failure phase.`
        };
    }

    if (signal.type === 'error_trend') {
        return {
            action: 'SWITCH_PROVIDER',
            confidence: 0.75,
            reason: `Instability pattern detected (${Math.round(signal.strength * 100)}% window failure rate). Switching to backup preemptively.`
        };
    }

    return null;
}

export async function recordPreventiveAction(executionId: string, workflowName: string, signal: TrendSignal, decision: PreventiveActionDecision, status: string) {
    const supabase = getSupabaseService();
    await supabase.from('preventive_actions').insert({
        execution_scope: workflowName,
        trigger_type: signal.type,
        trend_strength: signal.strength,
        action: decision.action,
        ai_confidence: decision.confidence,
        reason: decision.reason,
        status
    });
}
