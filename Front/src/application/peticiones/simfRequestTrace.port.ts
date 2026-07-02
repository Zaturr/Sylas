import type {
  SimfRequestTrace,
  SimfTraceSessionKey,
} from '../../domain/peticiones';

export type SimfRequestTraceListener = () => void;

export type SimfRequestTracePort = {
  record(trace: SimfRequestTrace): void;
  listBySessionKey(sessionKey: SimfTraceSessionKey): SimfRequestTrace[];
  clearSession(sessionKey: SimfTraceSessionKey): void;
  subscribe(listener: SimfRequestTraceListener): () => void;
};
