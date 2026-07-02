export type ValidatePaymentDraftResult =
  | { ok: true }
  | { ok: false; error: string };

export const DESTINATION_BLOCKED_ALIAS_PAYMENT_MESSAGE =
  'No se puede realizar el pago: el alias destino está bloqueado (BLKD).';

export function validatePaymentDraft(
  aliasValue: string,
  amount: string,
): ValidatePaymentDraftResult {
  const trimmedAlias = aliasValue.trim();
  const trimmedAmount = amount.trim().replace(',', '.');

  if (!trimmedAlias) {
    return { ok: false, error: 'Ingresa un alias destino.' };
  }

  if (!trimmedAmount) {
    return { ok: false, error: 'Ingresa un monto a pagar.' };
  }

  const numericAmount = Number(trimmedAmount);
  if (Number.isNaN(numericAmount) || numericAmount <= 0) {
    return { ok: false, error: 'El monto debe ser mayor a 0.' };
  }

  return { ok: true };
}
