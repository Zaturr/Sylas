import type { SimfHttpClient } from '../../peticiones/simfHttpClient';
import type { SimfTraceSessionKey } from '../../../../domain/peticiones';
import { SIMF_BASE_URL } from './simf.config';
import { buildSimfBlockPayload } from './simfBlockPayload.builder';

type SimfVerificationReport = {
  IdVrfctnRpt?: {
    Rpt?: {
      Result?: string;
      Rsn?: string;
    };
  };
};

export function createBlockAliasViaSimf(simfHttpClient: SimfHttpClient) {
  return async function blockAliasViaSimf(
    aliasValue: string,
    bankCode: string,
    sessionKey: SimfTraceSessionKey,
    signal?: AbortSignal,
  ): Promise<{ ok: true } | { ok: false; message: string }> {
    const body = buildSimfBlockPayload(aliasValue, bankCode);

    const result = await simfHttpClient({
      method: 'PUT',
      url: `${SIMF_BASE_URL}/aliases/delete/${encodeURIComponent(aliasValue)}/${bankCode}`,
      sessionKey,
      body,
      signal,
    });

    if (!result.ok) {
      return {
        ok: false,
        message: 'No se pudo bloquear el alias.',
      };
    }

    const data = result.data as SimfVerificationReport | null;
    const resultCode = data?.IdVrfctnRpt?.Rpt?.Result?.trim();

    if (resultCode !== 'ACCP') {
      const reason = data?.IdVrfctnRpt?.Rpt?.Rsn?.trim() || 'RJCT';
      return {
        ok: false,
        message: `Bloqueo rechazado (${reason}).`,
      };
    }

    return { ok: true };
  };
}
