/**
 * 🕵️ N8N AUDITOR ENGINE
 * Analiza el JSON de un workflow de n8n buscando vulnerabilidades y malas prácticas.
 */

const fs = require('fs');

function auditWorkflow(workflowPath) {
  const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
  const nodes = workflow.nodes || [];
  const connections = workflow.connections || {};

  const report = {
    score: 100,
    critical_errors: [],
    warnings: [],
    best_practices: []
  };

  nodes.forEach(node => {
    const params = JSON.stringify(node.parameters || {});

    // 1. Detectar uso de .first() - Muy frágil
    if (params.includes('.first()')) {
      report.critical_errors.push(`Nodo [${node.name}]: Uso prohibido de .first(). Cámbialo por validación de array.`);
      report.score -= 20;
    }

    // 2. Detectar falta de Optional Chaining
    if (params.includes('$node[') && !params.includes('?.')) {
      report.warnings.push(`Nodo [${node.name}]: Posible falta de Optional Chaining (?.).`);
      report.score -= 5;
    }

    // 3. Validar Error Handling en nodos HTTP/DB
    if (['n8n-nodes-base.httpRequest', 'n8n-nodes-base.supabase'].includes(node.type)) {
      if (!node.continueOnFail) {
        report.warnings.push(`Nodo [${node.name}]: "Continue on Fail" desactivado en un nodo crítico.`);
        report.score -= 10;
      }
    }
  });

  // 4. Validar existencia de Webhook y Contrato de Entrada
  const webhookNode = nodes.find(n => n.type === 'n8n-nodes-base.webhook');
  if (webhookNode) {
    report.best_practices.push("✅ Webhook detectado. Asegúrate de que el primer nodo valide el 'jobId'.");
  } else {
    report.warnings.push("⚠️ No se detectó un nodo Webhook de entrada.");
  }

  return report;
}

// Ejemplo de uso:
// console.log(auditWorkflow('./my-workflow.json'));

module.exports = { auditWorkflow };
