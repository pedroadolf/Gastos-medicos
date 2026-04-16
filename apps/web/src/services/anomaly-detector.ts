import { getSupabaseService } from './supabase';

export type MetricType = 'latency_spike' | 'error_rate_spike' | 'burn_rate_spike';

export type Anomaly = {
    type: MetricType;
    severity: 'warning' | 'critical';
    metricValue: number;
    baselineValue: number;
    deviation: number;
    message: string;
};

export async function detectAnomalies(
    workflowName: string, 
    current: { latency: number; hasError: boolean }
): Promise<Anomaly[]> {
    const supabase = getSupabaseService();
    const anomalies: Anomaly[] = [];

    // 1. Fetch Baseline
    const { data: baseline } = await supabase
        .from('baseline_metrics')
        .select('*')
        .eq('workflow_name', workflowName)
        .single();

    if (!baseline) return []; // No baseline to compare

    // 🔴 Latency Spike (1.8x deviation)
    const latencyDeviation = current.latency / (baseline.avg_latency || 1);
    if (latencyDeviation > 1.8) {
        anomalies.push({
            type: 'latency_spike',
            severity: latencyDeviation > 3 ? 'critical' : 'warning',
            metricValue: current.latency,
            baselineValue: baseline.avg_latency,
            deviation: latencyDeviation,
            message: `Latencia ${Math.round(latencyDeviation * 100)}% por encima de lo habitual (${Math.round(current.latency)}ms vs ${Math.round(baseline.avg_latency)}ms).`
        });
    }

    // 🔴 Error Rate Spike
    if (current.hasError && baseline.error_rate < 0.05) {
        // If system is usually stable and fails, it's an anomaly
        anomalies.push({
            type: 'error_rate_spike',
            severity: 'critical',
            metricValue: 1,
            baselineValue: baseline.error_rate,
            deviation: 1 / (baseline.error_rate || 0.01),
            message: `Fallo detectado en workflow usualmente estable (Error rate baseline: ${Math.round(baseline.error_rate * 100)}%).`
        });
    }

    return anomalies;
}

export async function recordAnomalies(anomalies: Anomaly[], executionId: string, workflowName: string) {
    const supabase = getSupabaseService();
    const payload = anomalies.map(a => ({
        type: a.type,
        severity: a.severity,
        execution_id: executionId,
        workflow_name: workflowName,
        metric_value: a.metricValue,
        baseline_value: a.baselineValue,
        deviation: a.deviation,
        message: a.message
    }));

    if (payload.length > 0) {
        await supabase.from('anomalies').insert(payload);
    }
}

export function clusterAnomalies(anomalies: any[]) {
    const clusters: Record<string, any[]> = {};
    anomalies.forEach(a => {
        if (!clusters[a.type]) clusters[a.type] = [];
        clusters[a.type].push(a);
    });

    return Object.entries(clusters).map(([type, items]) => ({
        type,
        count: items.length,
        maxDeviation: Math.max(...items.map(i => i.deviation || 0)),
        severity: items.some(i => i.severity === 'critical') ? 'critical' : 'warning'
    }));
}

export function generateCavemanInsight(anomalies: any[]) {
    if (anomalies.length === 0) return { message: 'Normal.', cause: 'None.', action: 'Continue.' };

    const types = new Set(anomalies.map(a => a.type));
    const isCritical = anomalies.some(a => a.severity === 'critical');

    if (types.has('latency_spike') && types.has('error_rate_spike')) {
        return {
            message: 'System slow. Many errors.',
            cause: 'Provider dead or struggling.',
            action: 'Switch to backup provider now.'
        };
    }

    if (types.has('latency_spike')) {
        return {
            message: 'System slow.',
            cause: 'High traffic or network delay.',
            action: 'Monitor. Increase timeouts.'
        };
    }

    if (types.has('error_rate_spike')) {
        return {
            message: 'Errors high.',
            cause: 'Logic failure or bad data.',
            action: 'Review workflow logs. Stop non-urgent.'
        };
    }

    return {
        message: 'Something weird.',
        cause: 'Unclear anomaly mix.',
        action: 'Manual audit needed.'
    };
}
