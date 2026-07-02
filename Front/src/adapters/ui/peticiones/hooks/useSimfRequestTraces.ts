import { useEffect, useState } from 'react';
import type { SimfRequestTrace, SimfTraceSessionKey } from '../../../../domain/peticiones';
import { usePeticionesTracePort } from '../providers/PeticionesProvider';

export function useSimfRequestTraces(
  sessionKey: SimfTraceSessionKey | null,
): SimfRequestTrace[] {
  const tracePort = usePeticionesTracePort();
  const [traces, setTraces] = useState<SimfRequestTrace[]>(() =>
    sessionKey ? tracePort.listBySessionKey(sessionKey) : [],
  );

  useEffect(() => {
    if (!sessionKey) {
      setTraces([]);
      return;
    }

    const syncTraces = () => {
      setTraces(tracePort.listBySessionKey(sessionKey));
    };

    syncTraces();
    return tracePort.subscribe(syncTraces);
  }, [sessionKey, tracePort]);

  return traces;
}
