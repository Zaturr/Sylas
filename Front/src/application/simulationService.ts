import type { PaymentRecipient, PaymentSimulationContext } from '../domain/simulation';

export type ValidatePaymentDraftResult =
  | { ok: true }
  | { ok: false; error: string };

export type ResolvePaymentAliasResult =
  | { ok: true; recipient: PaymentRecipient }
  | { ok: false; error: string };

export interface PaymentSimulationService {
  validatePaymentDraft(aliasValue: string, amount: string): ValidatePaymentDraftResult;
  resolvePaymentAlias(
    aliasValue: string,
    signal?: AbortSignal,
  ): Promise<ResolvePaymentAliasResult>;
  formatAmount(amount: string): string;
}

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

export function formatPaymentAmount(amount: string): string {
  const numericAmount = Number(amount.replace(',', '.'));
  if (Number.isNaN(numericAmount)) {
    return amount;
  }

  return numericAmount.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const createInitialSimulationContextFromService = (): PaymentSimulationContext => ({
  step: 'idle',
  activeTab: 'home',
  aliasValue: '',
  amount: '',
  recipient: null,
  errorMessage: '',
});
