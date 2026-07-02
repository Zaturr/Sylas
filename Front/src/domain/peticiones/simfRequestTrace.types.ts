export type SimfTraceSessionKey = string;

export type SimfHttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type SimfRequestTrace = {
  id: string;
  sessionKey: SimfTraceSessionKey;
  timestamp: string;
  method: SimfHttpMethod;
  path: string;
  requestBody: unknown;
  responseStatus: number;
  responseBody: unknown;
  durationMs: number;
};

export function buildSimfTraceSessionKey(
  documentType: string,
  documentNumber: string,
): SimfTraceSessionKey {
  return `${documentType.trim().toUpperCase()}${documentNumber.trim()}`;
}

export function formatSimfTraceEndpointBadge(method: SimfHttpMethod, path: string): string {
  return `${method} ${path}`;
}

export function isSimfTraceHttpSuccess(status: number): boolean {
  return status >= 200 && status < 300;
}

export function formatSimfTraceHttpStatus(status: number): string {
  const labels: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    404: 'Not Found',
    409: 'Conflict',
    500: 'Internal Server Error',
  };

  const label = labels[status] ?? 'Unknown';
  return `${status} ${label}`;
}
