import type { SimfRequestTracePort } from '../../../application/peticiones';
import type { SimfHttpMethod, SimfTraceSessionKey } from '../../../domain/peticiones';

export type SimfHttpClientInput = {
  method: SimfHttpMethod;
  url: string;
  sessionKey: SimfTraceSessionKey;
  body?: unknown;
  signal?: AbortSignal;
  recordTrace?: boolean;
};

export type SimfHttpClientResult = {
  ok: boolean;
  status: number;
  data: unknown;
};

export type SimfHttpClient = (input: SimfHttpClientInput) => Promise<SimfHttpClientResult>;

function createTraceId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `trace-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function extractPathFromUrl(url: string): string {
  return new URL(url).pathname;
}

function parseResponseBody(text: string): unknown {
  const trimmed = text.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return trimmed;
  }
}

export function createSimfHttpClient(tracePort: SimfRequestTracePort): SimfHttpClient {
  return async (input) => {
    const startedAt = performance.now();
    const requestBody = input.body ?? null;
    const path = extractPathFromUrl(input.url);
    const timestamp = new Date().toISOString();

    let responseStatus = 0;
    let responseBody: unknown = null;

    try {
      const response = await fetch(input.url, {
        method: input.method,
        headers:
          input.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
        body: input.body !== undefined ? JSON.stringify(input.body) : undefined,
        signal: input.signal,
      });

      responseStatus = response.status;
      responseBody = parseResponseBody(await response.text());

      if (input.recordTrace) {
        tracePort.record({
          id: createTraceId(),
          sessionKey: input.sessionKey,
          timestamp,
          method: input.method,
          path,
          requestBody,
          responseStatus,
          responseBody,
          durationMs: Math.round(performance.now() - startedAt),
        });
      }

      return {
        ok: response.ok,
        status: responseStatus,
        data: responseBody,
      };
    } catch (error) {
      responseBody = {
        error: error instanceof Error ? error.message : 'Error de red',
      };

      if (input.recordTrace) {
        tracePort.record({
          id: createTraceId(),
          sessionKey: input.sessionKey,
          timestamp,
          method: input.method,
          path,
          requestBody,
          responseStatus,
          responseBody,
          durationMs: Math.round(performance.now() - startedAt),
        });
      }

      throw error;
    }
  };
}
