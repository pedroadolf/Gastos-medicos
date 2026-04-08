import { NextResponse } from 'next/server';
import client from 'prom-client';

// Configuración global de Prometheus
const register = new client.Registry();

// Métricas por defecto (CPU, Memoria, etc)
client.collectDefaultMetrics({ register });

// Métricas personalizadas
const httpRequestsTotal = new client.Counter({
  name: 'gmm_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
});

const httpRequestDuration = new client.Histogram({
  name: 'gmm_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
});

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const metrics = await register.metrics();
    return new Response(metrics, {
      headers: {
        'Content-Type': register.contentType,
      },
    });
  } catch (err) {
    return new Response('Error collecting metrics', { status: 500 });
  }
}

/**
 * Helper para registrar métricas desde otros archivos
 */
export function recordMetrics(method: string, path: string, status: number, duration: number) {
  httpRequestsTotal.inc({ method, path, status });
  httpRequestDuration.observe({ method, path, status }, duration / 1000);
}
