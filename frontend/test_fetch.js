const url = "http://n8n-n8nwithpostgres-3a3065-193-43-134-161.traefik.me/webhook/gmm-processor";

fetch(url, { method: "POST" })
  .then(r => console.log("Status:", r.status))
  .catch(e => console.error("Error:", e.message));
