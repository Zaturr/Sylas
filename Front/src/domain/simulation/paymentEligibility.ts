import type { SimulationSession } from './auth.types';
import { SIMF_ALIAS_STATUS, isAliasGloballyBlocked } from './aliasStatus';
import { resolveSessionAliasLinkStatus } from './sessionAliasBadge';
import { SENDER_BLOCKED_ALIAS_PAYMENT_MESSAGE } from './paymentValidation';

export function getSenderPaymentBlockMessage(
  session: SimulationSession | null,
): string | null {
  if (!session?.hasConfiguredAlias) {
    return null;
  }

  if (
    isAliasGloballyBlocked(session.aliasCoreStatus) ||
    resolveSessionAliasLinkStatus(session) === SIMF_ALIAS_STATUS.BLOCKED
  ) {
    return SENDER_BLOCKED_ALIAS_PAYMENT_MESSAGE;
  }

  return null;
}
