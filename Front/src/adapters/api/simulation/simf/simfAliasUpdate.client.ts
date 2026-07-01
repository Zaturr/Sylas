import type { UserModifiableAliasStatus } from '../../../../domain/simulation/aliasStatus';
import { SIMF_BASE_URL } from './simf.config';
import { buildSimfUpdatePayload } from './simfUpdatePayload.builder';

export async function updateAliasViaSimf(
  aliasValue: string,
  bankCode: string,
  status: UserModifiableAliasStatus,
  signal?: AbortSignal,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const response = await fetch(
    `${SIMF_BASE_URL}/aliases/update/${encodeURIComponent(aliasValue)}/${bankCode}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildSimfUpdatePayload(aliasValue, bankCode, status)),
      signal,
    },
  );

  if (!response.ok) {
    return {
      ok: false,
      message: 'No se pudo actualizar el estado del alias.',
    };
  }

  const data = await response.json().catch(() => null);
  const resultCode = data?.IdVrfctnRpt?.Rpt?.Result?.trim();

  if (resultCode !== 'ACCP') {
    const reason = data?.IdVrfctnRpt?.Rpt?.Rsn?.trim() || 'RJCT';
    return {
      ok: false,
      message: `Actualización rechazada (${reason}).`,
    };
  }

  return { ok: true };
}
