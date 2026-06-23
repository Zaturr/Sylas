import {
  formatPaymentAmount,
  validatePaymentDraft,
  type PaymentSimulationService,
  type ResolvePaymentAliasResult,
} from '../../application/simulationService';
import type { PaymentRecipient } from '../../domain/simulation';
import { aliasAdapter } from './aliasApi';

function buildRecipient(
  aliasValue: string,
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    document_type: string;
    document_number: string;
  },
): PaymentRecipient | null {
  const firstName = customer.first_name.trim();
  const lastName = customer.last_name.trim();

  if (!firstName && !lastName) {
    return null;
  }

  return {
    firstName,
    lastName,
    email: customer.email.trim(),
    documentType: customer.document_type.trim(),
    documentNumber: customer.document_number.trim(),
    alias: aliasValue.trim(),
  };
}

export const simulationAdapter: PaymentSimulationService = {
  validatePaymentDraft,

  async resolvePaymentAlias(aliasValue, signal): Promise<ResolvePaymentAliasResult> {
    const trimmedAlias = aliasValue.trim();

    if (!trimmedAlias) {
      return { ok: false, error: 'Ingresa un alias destino.' };
    }

    try {
      const resolved = await aliasAdapter.resolveAlias(trimmedAlias, signal);
      const recipient = buildRecipient(trimmedAlias, resolved.customer);

      if (!recipient) {
        return { ok: false, error: 'Alias no se encuentra en el sistema' };
      }

      return { ok: true, recipient };
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Alias no se encuentra en el sistema',
      };
    }
  },

  formatAmount: formatPaymentAmount,
};
