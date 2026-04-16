export type IncidentInput = {
  error: string;
  step: string;
  retryCount: number;
  duration: number;
  frequency: number;
  // Financial Context
  coverageLayer: 'BASE' | 'EXCESS';
  effectiveAvailable: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  // Historical context (Pillar 3)
  history?: Record<string, number>; // map action -> success_rate (0-1)
};

// ... types remain same ...

export function analyzeIncident(input: IncidentInput): DecisionOutput {
  const { error, step, retryCount, frequency, coverageLayer, riskLevel, history } = input;
  const err = error.toLowerCase();

  // Determine Aggressiveness
  const aggressiveness = riskLevel === 'HIGH' || coverageLayer === 'EXCESS' ? 'HIGH' : 'NORMAL';

  // Experience Boost Logic (Adaptive)
  const getBoost = (action: string) => (history?.[action] || 0.5) * 10;

  // 1. External API Timeouts
  if (err.includes('timeout') || err.includes('econnreset')) {
    const isCoverage = step.includes('coverage') || step.includes('provider');
    const baseAction = coverageLayer === 'EXCESS' ? 'SWITCH_PROVIDER' : 'INCREASE_TIMEOUT';
    
    // Adaptive Adjustment: If INCREASE_TIMEOUT has low success rate, suggest RETRY instead
    const actionToTake: HealingAction['type'] = (baseAction === 'INCREASE_TIMEOUT' && (history?.['INCREASE_TIMEOUT'] || 1) < 0.4)
      ? 'RETRY' 
      : baseAction;

    return {
      probableCause: isCoverage ? 'External Coverage API Latency' : 'Network Stability Issue',
      recommendation: coverageLayer === 'EXCESS' 
        ? 'CRITICAL: High priority stabilization required.'
        : `Optimize timeouts (Historical success: ${((history?.[actionToTake] || 0.5) * 100).toFixed(1)}%)`,
      severity: coverageLayer === 'EXCESS' ? 'critical' : 'high',
      confidence: 70 + getBoost(actionToTake),
      action: { 
        type: actionToTake, 
        params: { ms: aggressiveness === 'HIGH' ? 15000 : 10000 },
        aggressiveness
      }
    };
  }

  // 2. Data Consistency
  if (err.includes('invalid') || err.includes('null') || err.includes('not found')) {
    return {
      probableCause: 'Upstream Data Inconsistency',
      recommendation: 'Manual audit required to prevent financial loss.',
      severity: 'high',
      confidence: 90,
      action: { type: 'ESCALATE', aggressiveness: 'NORMAL' }
    };
  }

  // 3. Provider Switching Logic (Aggressive in Excess)
  if (retryCount > 1 && (coverageLayer === 'EXCESS' || aggressiveness === 'HIGH')) {
    return {
      probableCause: 'Provider Instability in Critical Zone',
      recommendation: 'Executing aggressive failover to preserve excess layer integrity.',
      severity: 'critical',
      confidence: 92,
      action: { type: 'SWITCH_PROVIDER', aggressiveness: 'CRITICAL' }
    };
  }

  // 4. Recovery via Retry (Normal Context)
  if (retryCount < 2) {
    return {
      probableCause: 'Transient Execution Glitch',
      recommendation: 'Executing standard bounce retry.',
      severity: 'low',
      confidence: 95,
      action: { type: 'RETRY', aggressiveness: 'NORMAL' }
    };
  }

  return {
    probableCause: 'Undetermined Exception',
    recommendation: 'Monitor next node output.',
    severity: 'medium',
    confidence: 60
  };
}
