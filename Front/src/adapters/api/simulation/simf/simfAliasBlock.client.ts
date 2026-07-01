import { SIMF_BASE_URL } from './simf.config';
import { buildSimfBlockPayload } from './simfBlockPayload.builder';

export async function blockAliasViaSimf(
  aliasValue: string,
  bankCode: string,
  signal?: AbortSignal,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const response = await fetch(
    `${SIMF_BASE_URL}/aliases/delete/${encodeURIComponent(aliasValue)}/${bankCode}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildSimfBlockPayload(aliasValue, bankCode)),
      signal,
    },
  );

  if (!response.ok) {
    return {
      ok: false,
      message: 'No se pudo bloquear el alias.',
    };
  }

  const data = await response.json().catch(() => null);
  const resultCode = data?.IdVrfctnRpt?.Rpt?.Result?.trim();

  if (resultCode !== 'ACCP') {
    const reason = data?.IdVrfctnRpt?.Rpt?.Rsn?.trim() || 'RJCT';
    return {
      ok: false,
      message: `Bloqueo rechazado (${reason}).`,
    };
  }

  return { ok: true };
}
