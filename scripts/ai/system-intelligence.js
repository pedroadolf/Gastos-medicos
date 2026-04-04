/**
 * GMM System Intelligence v1.0
 * The "Self-Evolving" brain that analyzes logs and improves workflows.
 * 
 * Features:
 * - Error Fingerprinting: Grouping logs by error patterns.
 * - Fragility Detection: Identifying workflows with high failure rates.
 * - Auto-Refactor Trigger: Using AutoBuilder to fix problematic workflows.
 * - Safe Mode: Proposal-only mode for human-in-the-loop validation.
 */

const { createClient } = require('@supabase/supabase-js');
const AutoBuilder = require('./auto-builder.js');
const { logEvent } = require('../utils/log-event.js');
const SingularityBrain = require('../singularity/brain.js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

class SystemIntelligence {
    constructor(config = {}) {
        this.config = {
            safeMode: config.safeMode !== undefined ? config.safeMode : true,
            refactorThreshold: config.refactorThreshold || 10, // Max 10 same-type errors before refactor
            monitorLimit: config.monitorLimit || 1000,
            builder: new AutoBuilder(),
            brain: new SingularityBrain()
        };
    }

    /**
     * Main Autonomous Loop: Analyze -> Decide -> Improve
     */
    async executeAutonomousCycle() {
        console.log('\n🧬 [Intelligence] Starting Autonomous Evolution Cycle...');
        
        // 1. ANALYSIS: Find patterns in logs
        const patterns = await this.analyzeSystemPatterns();
        console.log(`🔍 [Intelligence] Detected ${patterns.length} significant error patterns.`);

        // 2. DECISION: Determine what to improve
        const plannedActions = this.decideActions(patterns);
        console.log(`⚖️  [Intelligence] Planned ${plannedActions.length} improvements.`);

        // 3. ACTION: Execute refactors or alerts
        const results = [];
        for (const action of plannedActions) {
            const result = await this.executeImprovement(action);
            results.push(result);
        }

        return results;
    }

    /**
     * Layer 1: Analysis - Grouping by fingerprint
     */
    async analyzeSystemPatterns() {
        const { data: logs, error } = await supabase
            .from('system_logs')
            .select('*')
            .not('error_type', 'is', null)
            .order('created_at', { ascending: false })
            .limit(this.config.monitorLimit);

        if (error) throw error;

        const summary = {};
        logs.forEach(log => {
            const key = log.fingerprint || `${log.agent}_${log.node}_${log.error_type}`;
            if (!summary[key]) {
                summary[key] = { 
                    count: 0, 
                    agent: log.agent, 
                    workflow: log.workflow,
                    last_error: log.message 
                };
            }
            summary[key].count++;
        });

        // Filter patterns that exceed safety threshold
        return Object.entries(summary)
            .filter(([_, data]) => data.count >= 3)
            .map(([fingerprint, data]) => ({
                fingerprint,
                ...data
            }));
    }

    /**
     * Layer 2: Decision Engine
     */
    decideActions(patterns) {
        return patterns.map(p => {
            if (p.count >= this.config.refactorThreshold) {
                return {
                    type: 'REFACTOR_WORKFLOW',
                    target: p.workflow,
                    reason: `High fragility detected: ${p.count} failures for pattern ${p.fingerprint}`,
                    context: p
                };
            }
            return {
                type: 'ENHANCE_LOGGING',
                target: p.workflow,
                reason: `Increasing error frequency: ${p.count} issues.`,
                context: p
            };
        });
    }

    /**
     * Layer 3: Action & Evolution
     */
    async executeImprovement(action) {
        console.log(`🔧 [Intelligence] Action: ${action.type} for ${action.target}`);

        if (this.config.safeMode) {
            console.log(`🛡️  [SAFE MODE] Proposal generated only. Review required.`);
            return { status: 'PROPOSED', action };
        }

        try {
            if (action.type === 'REFACTOR_WORKFLOW') {
                const goal = `Add resilience to ${action.target} to handle error: ${action.context.last_error}`;
                
                // 🧠 SINGULARITY STEP: Debate & Refine the goal
                const refinedGoal = await this.config.brain.solve(
                    `Problem: High fragility in ${action.target}`,
                    goal
                );

                const refactor = await this.config.builder.buildFromGoal(refinedGoal);
                
                await logEvent({
                    trace_id: action.context.fingerprint,
                    agent: 'intelligence',
                    node: 'refactor',
                    status: 'EVOLVED',
                    message: `Workflow ${action.target} self-refactored after Singularity Brain debate.`,
                    fingerprint: action.context.fingerprint
                });

                return { status: 'EVOLVED', target: action.target, goal: refinedGoal };
            }
        } catch (err) {
            console.error(`❌ [Intelligence] Action failed: ${err.message}`);
            return { status: 'FAILED', error: err.message };
        }
    }
}

module.exports = SystemIntelligence;

// CLI Execution for manual triggering
if (require.main === module) {
    const intelligence = new SystemIntelligence({ safeMode: true });
    intelligence.executeAutonomousCycle()
        .then(res => {
            console.log('\n--- EVOLUTION REPORT ---');
            console.log(JSON.stringify(res, null, 2));
        })
        .catch(err => console.error(err));
}
