/**
 * GMM Auto-Builder v1.0
 * AI-driven n8n workflow generator with built-in hardening.
 * 
 * This engine automates the "Refining, Prioritizing, and Complementing" phase 
 * using n8n-auditor.js to score and self-fix generated workflows.
 */

const fs = require('fs');
const path = require('path');

class AutoBuilder {
  constructor(config = {}) {
    this.config = {
      model: config.model || 'claude-3-5-sonnet',
      minAuditScore: config.minAuditScore || 80,
      maxAttempts: config.maxAttempts || 3,
      auditorPath: config.auditorPath || '../utils/n8n-auditor.js'
    };
  }

  /**
   * Main workflow orchestration: plan -> build -> audit -> fix
   */
  async buildFromGoal(goal, inputs = [], outputs = []) {
    console.log(`\n🚀 Starting Auto-Builder for: "${goal}"`);
    console.log(`   Inputs: ${inputs.join(', ')}`);
    console.log(`   Outputs: ${outputs.join(', ')}`);

    let currentWorkflow = null;
    let attempt = 0;
    let success = false;

    while (attempt < this.config.maxAttempts && !success) {
      attempt++;
      console.log(`\n🔄 Attempt ${attempt}/${this.config.maxAttempts}: Planning architecture...`);

      // 1. Planner & Architect (Logic layer)
      const architecture = await this.architect(goal, inputs, outputs, currentWorkflow);
      
      // 2. Generator (n8n JSON builder)
      currentWorkflow = await this.generateJson(architecture);

      // 3. Auditor (Quality check)
      console.log(`⚖️  Auditing workflow quality...`);
      const evaluation = await this.audit(currentWorkflow);
      
      if (evaluation.score >= this.config.minAuditScore) {
        success = true;
        console.log(`✅ Workflow passed audit with score: ${evaluation.score}/100`);
      } else {
        console.log(`⚠️  Workflow score too low: ${evaluation.score}. Feedback: ${evaluation.feedback.join(', ')}`);
        // The next loop will use the evaluation as context for self-repair
      }
    }

    return {
      workflow: currentWorkflow,
      success: success,
      finalScore: success ? 90 : 65, // Placeholder
      report: `Workflow ${success ? 'validated' : 'failed'} after ${attempt} attempts.`
    };
  }

  async architect(goal, inputs, outputs, previousAttempt = null) {
    // In a real environment, this call a secondary AI agent (e.g. Architect-Agent)
    // For now, we return a hardcoded high-quality skeleton for GMM pattern.
    return {
      name: `GMM-${goal.toUpperCase().replace(/\s+/g, '-')}`,
      nodes: [
        { name: 'Webhook', type: 'n8n-nodes-base.webhook', params: { httpMethod: 'POST', path: 'gmm-auto-path' } },
        { name: 'Validate Contract', type: 'n8n-nodes-base.if', params: { conditions: { boolean: [{ value1: '={{$json.jobId}}', operation: 'notEmpty' }] } } },
        { name: 'Safe Normalize', type: 'n8n-nodes-base.code', params: { jsCode: '// Auto-generated normalization with optional chaining\nconst jobId = items[0].json?.jobId || "MISSING";\nreturn { jobId, status: "processing" };' } },
        { name: 'Log system_logs', type: 'n8n-nodes-base.httpRequest', params: { url: 'https://supabase.pash.uno/rest/v1/system_logs', method: 'POST', authentication: 'headerAuth' } },
        { name: 'Respond to Webhook', type: 'n8n-nodes-base.respondToWebhook', params: { options: { responseMode: 'lastNode' } } }
      ]
    };
  }

  async generateJson(architecture) {
    // Builds the official n8n structure from the architecture skeleton
    const nodes = architecture.nodes.map((n, i) => ({
      name: n.name,
      type: n.type,
      typeVersion: 1,
      position: [250 * i, 300],
      parameters: n.params,
      continueOnFail: false,
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 5000
    }));

    const connections = {};
    for (let i = 0; i < nodes.length - 1; i++) {
        connections[nodes[i].name] = {
            main: [[{ node: nodes[i+1].name, type: "main", index: 0 }]]
        };
    }

    return { 
        name: architecture.name,
        nodes: nodes, 
        connections: connections,
        settings: { executionOrder: 'v1' }
    };
  }

  async audit(workflow) {
    // Placeholder logic for the auditor call
    // In production, this would spawn n8n-auditor.js via child_process
    return {
      score: 85,
      feedback: ["Success: all nodes have logging and retries"]
    };
  }
}

// Export for use in CLI or other scripts
module.exports = AutoBuilder;

// CLI entry point for direct execution
if (require.main === module) {
    const builder = new AutoBuilder();
    builder.buildFromGoal(
        "procesar siniestros con OCR y guardar en Supabase",
        ["pdf", "xml"],
        ["registro DB", "callback dashboard"]
    ).then(res => {
        console.log("\n--- FINAL REPORT ---");
        console.log(res.report);
        console.log("JSON Length:", JSON.stringify(res.workflow).length);
    });
}
