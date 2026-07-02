import type { SimfTraceSessionKey } from '../../domain/peticiones';
import type { PaymentRecipient } from '../../domain/simulation';

export type ResolvePaymentAliasResult =
  | { ok: true; recipient: PaymentRecipient }
  | { ok: false; error: string };

export type ExecutePaymentResult =
  | { ok: true }
  | { ok: false; error: string };

export interface PaymentSimulationService {
  resolvePaymentAlias(
    aliasValue: string,
    sessionKey: SimfTraceSessionKey,
    signal?: AbortSignal,
  ): Promise<ResolvePaymentAliasResult>;

  executePayment(
    aliasValue: string,
    amount: string,
    signal?: AbortSignal,
  ): Promise<ExecutePaymentResult>;
}
