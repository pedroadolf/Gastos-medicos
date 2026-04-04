import fetch from "node-fetch";

const WEBHOOK_URL = process.env.N8N_WEBHOOK;

const scenarios = {
  missing_xml: {
    jobId: "test_missing_xml_" + Date.now(),
    xml: null,
    files: ["receta.pdf"]
  },
  invalid_jobId: {
    jobId: null,
    xml: "<xml></xml>"
  },
  bad_auth: {
    jobId: "test_bad_auth_" + Date.now(),
    headers: { Authorization: "Bearer bad_token" }
  },
  corrupt_file: {
    jobId: "test_corrupt_" + Date.now(),
    files: ["factura.xml_corrupt"]
  }
};

async function runScenario(name, payload) {
  console.log(`🚀 Running Scenario: ${name}...`);
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-GMM-Secret": process.env.GMM_CALLBACK_SECRET || "dev_secret"
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();

    return {
      test_name: name,
      status: res.status,
      response: text
    };
  } catch (err) {
    return {
      test_name: name,
      status: "error",
      error: err.message
    };
  }
}

async function main() {
  if (!WEBHOOK_URL) {
    console.error("❌ N8N_WEBHOOK is not defined in environment.");
    return;
  }

  const results = [];

  for (const [name, payload] of Object.entries(scenarios)) {
    const result = await runScenario(name, payload);
    console.log(`Result for ${name}:`, result.status);
    results.push(result);
  }

  console.log("\n📊 SUMMARY:");
  console.table(results);
  return results;
}

main();
