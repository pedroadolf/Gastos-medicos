import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

/**
 * OpenTelemetry SDK Configuration
 * Envía trazas a un recolector OTLP (si existe)
 *
 * TODO: tech-debt — 2026-04-16
 * Actualmente DESACTIVADO en producción (ENABLE_TRACING no definido en .env).
 * La observabilidad principal corre via Supabase (workflow_steps) + Grafana.
 * ACTIVAR cuando se despliegue un colector OTLP (Jaeger/Tempo) en Dokploy.
 * Feature flag: ENABLE_TRACING=true en .env.local para activar.
 */

const exporterOptions = {
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
};

const traceExporter = new OTLPTraceExporter(exporterOptions);

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'gmm-web',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  }),
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false, // Demasiado ruidoso
      },
      '@opentelemetry/instrumentation-http': {
        enabled: true,
      },
    }),
  ],
});

export function initTracing() {
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_TRACING === 'true') {
    console.log('🔍 Inicializando OTEL Tracing...');
    sdk.start();

    process.on('SIGTERM', () => {
      sdk
        .shutdown()
        .then(() => console.log('Tracing terminated'))
        .catch((error) => console.log('Error terminating tracing', error))
        .finally(() => process.exit(0));
    });
  }
}
