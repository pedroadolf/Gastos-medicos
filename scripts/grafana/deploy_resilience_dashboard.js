#!/usr/bin/env node
/**
 * GMM Resilience — Grafana PRO Dashboard Deployer
 * =================================================
 * Deploys a full observability dashboard with:
 *   Panel 1: Timeline (retries vs escalations) — Time series
 *   Panel 2: Escalation Rate gauge
 *   Panel 3: Error type distribution — Pie chart
 *   Panel 4: Total retries counter — Stat
 *   Panel 5: Circuit breaker state — State timeline
 *   Plus 3 Grafana alerts
 *
 * Usage:
 *   GRAFANA_URL=https://grafana.pash.uno \
 *   GRAFANA_TOKEN=eyJ... \
 *   DS_UID=<postgres-datasource-uid> \
 *   node deploy_resilience_dashboard.js
 */

const GRAFANA_URL = process.env.GRAFANA_URL || 'http://localhost:3001';
const GRAFANA_TOKEN = process.env.GRAFANA_TOKEN || process.env.GRAFANA_SERVICE_TOKEN || '';
const DS_UID = process.env.DS_UID || process.env.GRAFANA_DATASOURCE_UID || 'supabase-postgres';
const DS_TYPE = 'grafana-postgresql-datasource';

if (!GRAFANA_TOKEN) {
  console.error('❌ GRAFANA_TOKEN env var is required');
  process.exit(1);
}

const DS = { type: DS_TYPE, uid: DS_UID };

// ─── Panel Builders ──────────────────────────────────────────────────────────

/** Panel 1: Activity timeline — retries vs escalations per minute */
const timelinePanel = {
  id: 1,
  title: '🔁 Retries vs Escalaciones (por minuto)',
  type: 'timeseries',
  gridPos: { x: 0, y: 0, w: 16, h: 8 },
  datasource: DS,
  targets: [
    {
      refId: 'A',
      rawSql: `
SELECT
  date_trunc('minute', created_at) AS time,
  action,
  COUNT(*) AS count
FROM alerts_log
WHERE $__timeFilter(created_at)
GROUP BY 1, 2
ORDER BY 1`,
      format: 'time_series',
    }
  ],
  fieldConfig: {
    defaults: {
      custom: { lineWidth: 2, fillOpacity: 10, spanNulls: true }
    },
    overrides: [
      { matcher: { id: 'byName', options: 'escalate' }, properties: [{ id: 'color', value: { mode: 'fixed', fixedColor: 'red' } }] },
      { matcher: { id: 'byName', options: 'retry' },    properties: [{ id: 'color', value: { mode: 'fixed', fixedColor: 'yellow' } }] },
      { matcher: { id: 'byName', options: 'circuit_open' }, properties: [{ id: 'color', value: { mode: 'fixed', fixedColor: 'dark-red' } }] },
    ]
  },
  options: { tooltip: { mode: 'multi', sort: 'desc' } }
};

/** Panel 2: Escalation rate gauge */
const escalationGauge = {
  id: 2,
  title: '🔴 Tasa de Escalación (última hora)',
  type: 'gauge',
  gridPos: { x: 16, y: 0, w: 8, h: 4 },
  datasource: DS,
  targets: [
    {
      refId: 'A',
      rawSql: `
SELECT
  ROUND(
    COUNT(*) FILTER (WHERE action = 'escalate') * 100.0 /
    NULLIF(COUNT(*), 0), 1
  ) AS escalation_rate
FROM alerts_log
WHERE created_at > NOW() - INTERVAL '1 hour'`,
      format: 'table',
    }
  ],
  fieldConfig: {
    defaults: {
      unit: 'percent',
      min: 0, max: 100,
      thresholds: {
        mode: 'absolute',
        steps: [
          { color: 'green',  value: null },
          { color: 'yellow', value: 10 },
          { color: 'red',    value: 20 },
        ]
      }
    }
  },
  options: { reduceOptions: { calcs: ['lastNotNull'] } }
};

/** Panel 3: Error type distribution — Pie chart */
const errorTypePie = {
  id: 3,
  title: '🟡 Distribución de Tipos de Error',
  type: 'piechart',
  gridPos: { x: 16, y: 4, w: 8, h: 4 },
  datasource: DS,
  targets: [
    {
      refId: 'A',
      rawSql: `
SELECT
  COALESCE(error_type, 'unknown') AS error_type,
  COUNT(*) AS count
FROM alerts_log
WHERE $__timeFilter(created_at)
  AND action = 'error'
GROUP BY 1
ORDER BY 2 DESC`,
      format: 'table',
    }
  ],
  options: {
    pieType: 'donut',
    tooltip: { mode: 'single' },
    legend: { displayMode: 'table', placement: 'right', values: ['percent', 'value'] }
  }
};

/** Panel 4: Total retries stat counter */
const retryCounter = {
  id: 4,
  title: '🔵 Total Reintentos (última hora)',
  type: 'stat',
  gridPos: { x: 0, y: 8, w: 6, h: 4 },
  datasource: DS,
  targets: [
    {
      refId: 'A',
      rawSql: `
SELECT COUNT(*) AS retries
FROM alerts_log
WHERE action = 'retry'
  AND created_at > NOW() - INTERVAL '1 hour'`,
      format: 'table',
    }
  ],
  fieldConfig: {
    defaults: {
      color: { mode: 'thresholds' },
      thresholds: { steps: [{ color: 'blue', value: null }, { color: 'red', value: 50 }] }
    }
  },
  options: { reduceOptions: { calcs: ['lastNotNull'] }, textMode: 'value_and_name', colorMode: 'background' }
};

/** Panel 5: Circuit breaker state timeline */
const circuitBreakerPanel = {
  id: 5,
  title: '⚫ Circuit Breaker — Eventos de Apertura',
  type: 'timeseries',
  gridPos: { x: 6, y: 8, w: 18, h: 4 },
  datasource: DS,
  targets: [
    {
      refId: 'A',
      rawSql: `
SELECT
  date_trunc('minute', created_at) AS time,
  COUNT(*) AS opens
FROM alerts_log
WHERE action = 'circuit_open'
  AND $__timeFilter(created_at)
GROUP BY 1
ORDER BY 1`,
      format: 'time_series',
    }
  ],
  fieldConfig: {
    defaults: {
      custom: { lineWidth: 3, fillOpacity: 30, drawStyle: 'bars' },
      color: { mode: 'fixed', fixedColor: 'dark-red' },
      displayName: 'Circuit Opens',
    }
  }
};

// ─── Alert Rules ─────────────────────────────────────────────────────────────
const alertRules = [
  {
    title: '🚨 Escalation Rate > 20%',
    condition: 'C',
    data: [
      {
        refId: 'A',
        queryType: '',
        relativeTimeRange: { from: 3600, to: 0 },
        datasourceUid: DS_UID,
        model: {
          rawSql: `SELECT
  COUNT(*) FILTER (WHERE action = 'escalate') * 100.0 /
  NULLIF(COUNT(*), 0) AS escalation_rate
FROM alerts_log
WHERE created_at > NOW() - INTERVAL '1 hour'`,
          format: 'table',
          refId: 'A',
        }
      },
      {
        refId: 'B',
        queryType: '',
        relativeTimeRange: { from: 3600, to: 0 },
        datasourceUid: '-100',
        model: {
          type: 'reduce', refId: 'B',
          reducer: 'last', expression: 'A',
        }
      },
      {
        refId: 'C',
        queryType: '',
        relativeTimeRange: { from: 3600, to: 0 },
        datasourceUid: '-100',
        model: {
          type: 'threshold', refId: 'C',
          expression: 'B',
          conditions: [{ evaluator: { params: [20], type: 'gt' }, operator: { type: 'and' }, reducer: { params: [], type: 'last' }, type: 'query' }],
        }
      }
    ],
    intervalSeconds: 60,
    for: '5m',
    annotations: { summary: 'Tasa de escalación > 20% en la última hora', description: 'Revisar logs de OCR o ZIP — hay muchos errores permanentes.' },
    labels: { severity: 'critical', team: 'GMM' },
  },
  {
    title: '🚨 Circuit Breaker Abierto',
    condition: 'C',
    data: [
      {
        refId: 'A',
        queryType: '',
        relativeTimeRange: { from: 300, to: 0 },
        datasourceUid: DS_UID,
        model: {
          rawSql: `SELECT COUNT(*) AS opens FROM alerts_log WHERE action = 'circuit_open' AND created_at > NOW() - INTERVAL '5 minutes'`,
          format: 'table', refId: 'A',
        }
      },
      {
        refId: 'B', queryType: '', relativeTimeRange: { from: 300, to: 0 },
        datasourceUid: '-100',
        model: { type: 'reduce', refId: 'B', reducer: 'last', expression: 'A' }
      },
      {
        refId: 'C', queryType: '', relativeTimeRange: { from: 300, to: 0 },
        datasourceUid: '-100',
        model: {
          type: 'threshold', refId: 'C', expression: 'B',
          conditions: [{ evaluator: { params: [1], type: 'gt' }, operator: { type: 'and' }, reducer: { params: [], type: 'last' }, type: 'query' }],
        }
      }
    ],
    intervalSeconds: 30,
    for: '1m',
    annotations: { summary: 'Circuit Breaker global se abrió', description: 'El sistema detectó demasiados fallos en la ventana de tiempo. Revisar Supabase y n8n.' },
    labels: { severity: 'critical', team: 'GMM' },
  },
  {
    title: '⚠️ Muchos errores permanentes (>5 en 30 min)',
    condition: 'C',
    data: [
      {
        refId: 'A', queryType: '', relativeTimeRange: { from: 1800, to: 0 },
        datasourceUid: DS_UID,
        model: {
          rawSql: `SELECT COUNT(*) AS perm_errors FROM alerts_log WHERE error_type = 'permanent' AND created_at > NOW() - INTERVAL '30 minutes'`,
          format: 'table', refId: 'A',
        }
      },
      {
        refId: 'B', queryType: '', relativeTimeRange: { from: 1800, to: 0 },
        datasourceUid: '-100',
        model: { type: 'reduce', refId: 'B', reducer: 'last', expression: 'A' }
      },
      {
        refId: 'C', queryType: '', relativeTimeRange: { from: 1800, to: 0 },
        datasourceUid: '-100',
        model: {
          type: 'threshold', refId: 'C', expression: 'B',
          conditions: [{ evaluator: { params: [5], type: 'gt' }, operator: { type: 'and' }, reducer: { params: [], type: 'last' }, type: 'query' }],
        }
      }
    ],
    intervalSeconds: 120,
    for: '2m',
    annotations: { summary: 'Más de 5 errores permanentes en 30 minutos', description: 'Los PDFs pueden estar corruptos o el OCR tiene problemas sistémicos.' },
    labels: { severity: 'warning', team: 'GMM' },
  }
];

// ─── Dashboard Definition ─────────────────────────────────────────────────────
const dashboard = {
  uid:           'gmm-resilience-pro-v1',
  title:         '🏥 GMM — Motor de Resiliencia PRO',
  description:   'Observabilidad accionable: retries, escalaciones, circuit breaker, error types',
  tags:          ['gmm', 'resilience', 'observability', 'supabase'],
  timezone:      'browser',
  refresh:       '30s',
  time:          { from: 'now-3h', to: 'now' },
  schemaVersion: 39,
  version:       1,
  panels:        [timelinePanel, escalationGauge, errorTypePie, retryCounter, circuitBreakerPanel],
  templating: {
    list: [
      {
        name: 'step',
        label: 'Step',
        type: 'query',
        datasource: DS,
        query: "SELECT DISTINCT step FROM alerts_log WHERE step IS NOT NULL ORDER BY step",
        refresh: 2,
        includeAll: true,
        allValue: '.*',
        multi: true,
      }
    ]
  },
};

// ─── Deploy Logic ─────────────────────────────────────────────────────────────
async function deployDashboard() {
  console.log(`\n🚀 Deploying GMM Resilience PRO Dashboard to ${GRAFANA_URL}`);
  console.log(`   Datasource UID: ${DS_UID}`);

  const payload = { dashboard, overwrite: true, folderId: 0, message: 'GMM PRO Logging Phase 9' };

  const res = await fetch(`${GRAFANA_URL}/api/dashboards/db`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${GRAFANA_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await res.json();
  if (!res.ok) {
    console.error(`❌ Dashboard deploy failed (${res.status}):`, JSON.stringify(result, null, 2));
    return false;
  }
  console.log(`✅ Dashboard deployed: ${GRAFANA_URL}${result.url}`);
  return true;
}

async function deployAlertRules() {
  // Find or create the GMM alert folder
  const folderRes = await fetch(`${GRAFANA_URL}/api/folders`, { headers: { Authorization: `Bearer ${GRAFANA_TOKEN}` } });
  const folders   = await folderRes.json();
  let gmmFolder   = Array.isArray(folders) ? folders.find(f => f.title === 'GMM Alerts') : null;
  let folderUid   = gmmFolder?.uid;

  if (!folderUid) {
    const mkFolder = await fetch(`${GRAFANA_URL}/api/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GRAFANA_TOKEN}` },
      body: JSON.stringify({ title: 'GMM Alerts', uid: 'gmm-alerts-folder' }),
    });
    const f   = await mkFolder.json();
    folderUid = f.uid || 'gmm-alerts-folder';
    console.log(`📁 Created alert folder: GMM Alerts (${folderUid})`);
  } else {
    console.log(`📁 Using existing alert folder: GMM Alerts (${folderUid})`);
  }

  let ok = 0;
  for (const rule of alertRules) {
    // Correct Grafana Ruler API format (v1)
    // annotations/labels go at RULE level, not inside grafana_alert
    const body = {
      name:     `gmm-${rule.title.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 40)}`,
      interval: `${rule.intervalSeconds}s`,
      rules: [
        {
          for:         rule.for,
          annotations: rule.annotations,
          labels:      rule.labels,
          grafana_alert: {
            title:          rule.title,
            condition:      rule.condition,
            data:           rule.data,
            no_data_state:  'OK',
            exec_err_state: 'Error',
          },
        }
      ],
    };

    const r = await fetch(`${GRAFANA_URL}/api/ruler/grafana/api/v1/rules/${folderUid}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GRAFANA_TOKEN}` },
      body:    JSON.stringify(body),
    });

    if (r.ok || r.status === 202 || r.status === 201) {
      console.log(`   ✅ Alert rule: "${rule.title}"`);
      ok++;
    } else {
      const errText = await r.text().catch(() => '');
      let errMsg = errText;
      try { errMsg = JSON.parse(errText)?.message || errText; } catch (_) {}
      console.warn(`   ⚠️  Alert rule "${rule.title}" failed (${r.status}): ${errMsg}`);
    }
  }
  console.log(`\n📊 Alert rules deployed: ${ok}/${alertRules.length}`);
}

async function main() {
  try {
    const dashOk = await deployDashboard();
    if (dashOk) await deployAlertRules();
    console.log('\n✅ All done. Open Grafana and verify the dashboard.');
  } catch (e) {
    console.error('❌ Fatal error:', e.message);
    process.exit(1);
  }
}

main();
