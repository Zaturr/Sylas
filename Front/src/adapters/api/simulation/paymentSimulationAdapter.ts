import type { AliasService } from '../../../application/aliasService';
import type { PaymentRecipient } from '../../../domain/simulation';
import type {
  ExecutePaymentResult,
  PaymentSimulationService,
  ResolvePaymentAliasResult,
} from '../../../application/simulation/paymentSimulation.port';

const PAYMENT_PROCESSING_DELAY_MS = 1800;

function parseDocumentInput(value: string): { documentType: string; documentNumber: string } | null {
  const match = value.trim().match(/^([VEJPG])-?(\d+)$/i);
  if (!match) {
    return null;
  }
  return {
    documentType: match[1].toUpperCase(),
    documentNumber: match[2],
  };
}

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
        return { ok: false, error: 'Ingresa la cédula del destinatario.' };
      }

      const document = parseDocumentInput(trimmedValue);
      if (!document) {
        return { ok: false, error: 'Formato de cédula inválido (ej. V12345678).' };
      }

      try {
        const resolved = await aliasService.resolveByDocument(
          document.documentType,
          document.documentNumber,
          signal,
        );
        const recipient = buildRecipient(resolved.alias, resolved.customer);

        if (!recipient) {
          return { ok: false, error: 'Titular no se encuentra en el sistema' };
        }

        return { ok: true, recipient };
      } catch (error) {
        return {
          ok: false,
          error:
            error instanceof Error ? error.message : 'Titular no se encuentra en el sistema',
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
