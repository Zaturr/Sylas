import type { SimfRequestTracePort, SimfRequestTraceListener } from '../../../application/peticiones';
import type { SimfRequestTrace, SimfTraceSessionKey } from '../../../domain/peticiones';

export function createInMemorySimfRequestTraceStore(): SimfRequestTracePort {
  const tracesBySession = new Map<SimfTraceSessionKey, SimfRequestTrace[]>();
  const listeners = new Set<SimfRequestTraceListener>();

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  return {
    record(trace) {
      tracesBySession.set(trace.sessionKey, [trace]);
      notify();
    },

    listBySessionKey(sessionKey) {
      return tracesBySession.get(sessionKey) ?? [];
    },

    clearSession(sessionKey) {
      if (!tracesBySession.has(sessionKey)) {
        return;
      }

      tracesBySession.delete(sessionKey);
      notify();
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
