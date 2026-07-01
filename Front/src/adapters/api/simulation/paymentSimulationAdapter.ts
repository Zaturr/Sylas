import type { AliasService } from '../../../application/aliasService';
import { isPendingAlias } from '../../../domain/simulation/auth.types';
import type { PaymentRecipient } from '../../../domain/simulation';
import type {
  ExecutePaymentResult,
  PaymentSimulationService,
  ResolvePaymentAliasResult,
} from '../../../application/simulation/paymentSimulation.port';

const PAYMENT_PROCESSING_DELAY_MS = 1800;

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

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms);

    if (!signal) {
      return;
    }

    if (signal.aborted) {
      window.clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

export function createPaymentSimulationService(
  aliasService: AliasService,
): PaymentSimulationService {
  return {
    async resolvePaymentAlias(aliasValue, signal): Promise<ResolvePaymentAliasResult> {
      const trimmedValue = aliasValue.trim();

      if (!trimmedValue) {
        return { ok: false, error: 'Ingresa el alias del destinatario.' };
      }

      if (isPendingAlias(trimmedValue)) {
        return { ok: false, error: 'El alias destino no está activo.' };
      }

      try {
        const resolved = await aliasService.resolveByAliasValue(trimmedValue, signal);

        if (isPendingAlias(resolved.alias)) {
          return { ok: false, error: 'El alias destino no está activo.' };
        }

        const recipient = buildRecipient(resolved.alias, resolved.customer);

        if (!recipient) {
          return { ok: false, error: 'Titular no se encuentra en el sistema' };
        }

        return { ok: true, recipient };
      } catch (error) {
        return {
          ok: false,
          error:
            error instanceof Error ? error.message : 'Alias no encontrado en el sistema',
        };
      }
    },

    async executePayment(aliasValue, amount, signal): Promise<ExecutePaymentResult> {
      const trimmedAlias = aliasValue.trim();
      const trimmedAmount = amount.trim();

      if (!trimmedAlias || !trimmedAmount) {
        return { ok: false, error: 'Datos de pago incompletos.' };
      }

      try {
        await delay(PAYMENT_PROCESSING_DELAY_MS, signal);
        return { ok: true };
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return { ok: false, error: 'Pago cancelado.' };
        }

        return { ok: false, error: 'No se pudo procesar el pago.' };
      }
    },
  };
}
