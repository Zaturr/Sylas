import { useEffect, useState } from 'react';
import type { SimfRequestTrace, SimfTraceSessionKey } from '../../../../domain/peticiones';
import { usePeticionesTracePort } from '../providers/PeticionesProvider';

export function useSimfLatestRequestTrace(
  sessionKey: SimfTraceSessionKey | null,
  enabled: boolean,
): SimfRequestTrace | null {
  const tracePort = usePeticionesTracePort();
  const [trace, setTrace] = useState<SimfRequestTrace | null>(() => {
    if (!sessionKey || !enabled) {
      return null;
    }

    return tracePort.listBySessionKey(sessionKey)[0] ?? null;
  });

  useEffect(() => {
    if (!sessionKey || !enabled) {
      setTrace(null);
      return;
    }

    const syncTrace = () => {
      setTrace(tracePort.listBySessionKey(sessionKey)[0] ?? null);
    };

    syncTrace();
    return tracePort.subscribe(syncTrace);
  }, [enabled, sessionKey, tracePort]);

  return trace;
}
