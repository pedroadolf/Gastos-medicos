const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: 'apps/web/.env.local' });

const grafanaUrl = process.env.GRAFANA_URL;
const grafanaToken = process.env.GRAFANA_SERVICE_TOKEN;
const dashboardPath = path.join(__dirname, '../apps/web/src/app/(auth)/observabilidad/grafana-dashboard.json');

if (!grafanaUrl || !grafanaToken) {
  console.error('❌ Error: GRAFANA_URL or GRAFANA_SERVICE_TOKEN missing in .env.local');
  process.exit(1);
}

async function deploy() {
  console.log(`🚀 Deploying dashboard to ${grafanaUrl}...`);

  try {
    // Read the dashboard JSON
    if (!fs.existsSync(dashboardPath)) {
      throw new Error(`Dashboard file not found at ${dashboardPath}`);
    }

    const dashboardJson = JSON.parse(fs.readFileSync(dashboardPath, 'utf8'));

    // Inject the correct datasource UID from .env.local if available
    const dsUid = process.env.GRAFANA_DATASOURCE_UID;
    if (dsUid) {
      console.log(`💉 Injecting Datasource UID: ${dsUid}`);
      dashboardJson.dashboard.panels.forEach(panel => {
        if (panel.datasource && panel.datasource.type === 'grafana-postgresql-datasource') {
          panel.datasource.uid = dsUid;
        }
        if (panel.panels) { // Nested panels in rows
          panel.panels.forEach(subPanel => {
            if (subPanel.datasource && subPanel.datasource.type === 'grafana-postgresql-datasource') {
              subPanel.datasource.uid = dsUid;
            }
          });
        }
      });
    }

    // Grafana API Payload
    const payload = {
      dashboard: dashboardJson.dashboard,
      overwrite: true,
      folderId: 0 // Default folder
    };

    const response = await fetch(`${grafanaUrl}/api/dashboards/db`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${grafanaToken}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Dashboard deployed successfully!');
      console.log(`🔗 URL: ${grafanaUrl}${result.url}`);
    } else {
      console.error('❌ Failed to deploy dashboard:', result);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error deploying dashboard:', error.message);
    process.exit(1);
  }
}

deploy();
