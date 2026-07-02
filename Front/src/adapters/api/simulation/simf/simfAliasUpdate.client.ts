import type { UserModifiableAliasStatus } from '../../../../domain/simulation/aliasStatus';
import type { SimfTraceSessionKey } from '../../../../domain/peticiones';
import type { SimfHttpClient } from '../../peticiones/simfHttpClient';
import { SIMF_BASE_URL } from './simf.config';
import { buildSimfUpdatePayload } from './simfUpdatePayload.builder';

type SimfVerificationReport = {
  IdVrfctnRpt?: {
    Rpt?: {
      Result?: string;
      Rsn?: string;
    };
  };
};

export function createUpdateAliasViaSimf(simfHttpClient: SimfHttpClient) {
  return async function updateAliasViaSimf(
    aliasValue: string,
    bankCode: string,
    status: UserModifiableAliasStatus,
    sessionKey: SimfTraceSessionKey,
    signal?: AbortSignal,
  ): Promise<{ ok: true } | { ok: false; message: string }> {
    const body = buildSimfUpdatePayload(aliasValue, bankCode, status);

    const result = await simfHttpClient({
      method: 'PUT',
      url: `${SIMF_BASE_URL}/aliases/update/${encodeURIComponent(aliasValue)}/${bankCode}`,
      sessionKey,
      body,
      signal,
      recordTrace: true,
    });

    if (!result.ok) {
      return {
        ok: false,
        message: 'No se pudo actualizar el estado del alias.',
      };
    }

    const data = result.data as SimfVerificationReport | null;
    const resultCode = data?.IdVrfctnRpt?.Rpt?.Result?.trim();

    if (resultCode !== 'ACCP') {
      const reason = data?.IdVrfctnRpt?.Rpt?.Rsn?.trim() || 'RJCT';
      return {
        ok: false,
        message: `Actualización rechazada (${reason}).`,
      };
    }

    return { ok: true };
  };
}
