import type { SimfTraceSessionKey } from '../../../../domain/peticiones';
import type { SimfHttpClient } from '../../peticiones/simfHttpClient';
import { SIMF_BASE_URL } from './simf.config';

export function createResolveAntiphishingViaSimf(simfHttpClient: SimfHttpClient) {
  return async function resolveAntiphishingViaSimf(
    aliasValue: string,
    destinationAgent: string,
    sessionKey: SimfTraceSessionKey,
    signal?: AbortSignal,
  ): Promise<{ ok: boolean; status: number; data: unknown }> {
    const url = `${SIMF_BASE_URL}/aliases/${encodeURIComponent(aliasValue)}/resolutions/${destinationAgent}`;

    const result = await simfHttpClient({
      method: 'GET',
      url,
      sessionKey,
      signal,
      recordTrace: true,
    });

    return {
      ok: result.ok,
      status: result.status,
      data: result.data,
    };
  };
}
