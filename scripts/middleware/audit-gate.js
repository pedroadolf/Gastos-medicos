import { auditWorkflow } from "../utils/n8n-auditor.js";

/**
 * Gatekeeper que bloquea despliegues o ejecuciones si el workflow no es resiliente.
 */
export async function auditGate(workflowJson) {
  console.log(`🔍 Auditing Workflow: ${workflowJson.name}...`);
  
  const result = await auditWorkflow(workflowJson);

  if (result.score < 80) {
    console.error("🚫 BLOCKED BY AUDITOR: Workflow does not meet production standards.");
    console.error("Issues found:", JSON.stringify(result.critical_errors, null, 2));

    throw new Error(`Workflow [${workflowJson.name}] rejected. Score: ${result.score}`);
  }

  console.log(`✅ Workflow Approved. Score: ${result.score}`);
  return result;
}
