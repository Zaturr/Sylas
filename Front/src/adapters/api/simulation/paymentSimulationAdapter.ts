import { isPendingAlias } from '../../../domain/simulation/auth.types';
import type {
  ExecutePaymentResult,
  PaymentSimulationService,
  ResolvePaymentAliasResult,
} from '../../../application/simulation/paymentSimulation.port';
import { appConfig } from '../app.config';
import { mapAntiphishingResponseToPaymentAlias } from './simf/simfAntiphishing.mapper';
import type { createResolveAntiphishingViaSimf } from './simf/simfAntiphishing.client';

const PAYMENT_PROCESSING_DELAY_MS = 1800;

type PaymentSimulationDependencies = {
  resolveAntiphishingViaSimf: ReturnType<typeof createResolveAntiphishingViaSimf>;
};

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
  dependencies: PaymentSimulationDependencies,
): PaymentSimulationService {
  const { resolveAntiphishingViaSimf } = dependencies;
  const bankCode = appConfig.simulation.bankCode;

  return {
    async resolvePaymentAlias(
      aliasValue,
      sessionKey,
      signal,
    ): Promise<ResolvePaymentAliasResult> {
      const trimmedValue = aliasValue.trim();

      if (!trimmedValue) {
        return { ok: false, error: 'Ingresa el alias del destinatario.' };
      }

      if (isPendingAlias(trimmedValue)) {
        return { ok: false, error: 'El alias destino no está activo.' };
      }

      try {
        const response = await resolveAntiphishingViaSimf(
          trimmedValue,
          bankCode,
          sessionKey,
          signal,
        );

        if (!response.ok) {
          return {
            ok: false,
            error: 'No se pudo consultar el alias destino en SIMF.',
          };
        }

        return mapAntiphishingResponseToPaymentAlias(trimmedValue, bankCode, response.data);
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
