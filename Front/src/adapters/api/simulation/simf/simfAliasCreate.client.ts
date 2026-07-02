import type { SimulationSession } from '../../../../domain/simulation/auth.types';
import type { SimfTraceSessionKey } from '../../../../domain/peticiones';
import type { SimfHttpClient } from '../../peticiones/simfHttpClient';
import { SIMF_BASE_URL } from './simf.config';
import { buildSimfCreateUserPayload } from './simfCreateUserPayload.builder';

type SimfVerificationReport = {
  IdVrfctnRpt?: {
    Rpt?: {
      Result?: string;
      Rsn?: string;
    };
  };
};

export function createRegisterAliasViaSimf(simfHttpClient: SimfHttpClient) {
  return async function registerAliasViaSimf(
    session: SimulationSession,
    aliasValue: string,
    bankCode: string,
    sessionKey: SimfTraceSessionKey,
    signal?: AbortSignal,
  ): Promise<{ ok: true } | { ok: false; message: string }> {
    const { payload, schemeName } = buildSimfCreateUserPayload(session, aliasValue, bankCode);

    if (!schemeName) {
      return {
        ok: false,
        message: 'Tipo de documento no soportado para SIMF.',
      };
    }

    const result = await simfHttpClient({
      method: 'POST',
      url: `${SIMF_BASE_URL}/aliases`,
      sessionKey,
      body: payload,
      signal,
    });

    if (!result.ok) {
      return {
        ok: false,
        message: 'No se pudo registrar el alias vía SIMF.',
      };
    }

    const data = result.data as SimfVerificationReport | null;
    const resultCode = data?.IdVrfctnRpt?.Rpt?.Result?.trim();

    if (resultCode !== 'ACCP') {
      const reason = data?.IdVrfctnRpt?.Rpt?.Rsn?.trim() || 'RJCT';
      return {
        ok: false,
        message: `Registro rechazado (${reason}).`,
      };
    }

    return { ok: true };
  };
}
