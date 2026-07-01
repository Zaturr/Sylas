import type { SimulationSession } from './auth.types';
import { getPrimaryAccount } from './aliasFlow';
import {
  SIMF_ALIAS_STATUS,
  coreAccountStatusToSimf,
  isAliasGloballyBlocked,
  type SimfAliasStatus,
} from './aliasStatus';

export type HomeAliasBadgeVariant = 'success' | 'warning' | 'danger' | 'info';

export type HomeAliasBadge = {
  text: string;
  variant: HomeAliasBadgeVariant;
};

export function resolveSessionAliasLinkStatus(
  session: SimulationSession,
): SimfAliasStatus | null {
  if (!session.hasConfiguredAlias) {
    return null;
  }

  if (isAliasGloballyBlocked(session.aliasCoreStatus)) {
    return SIMF_ALIAS_STATUS.BLOCKED;
  }

  const primaryAccount = getPrimaryAccount(session);
  if (!primaryAccount) {
    return SIMF_ALIAS_STATUS.UNREGISTERED;
  }

  return coreAccountStatusToSimf(primaryAccount.status);
}

export function getHomeAliasBadge(session: SimulationSession): HomeAliasBadge | null {
  if (!session.hasConfiguredAlias) {
    return {
      text: 'Alias pendiente de configuración.',
      variant: 'info',
    };
  }

  const alias = session.alias?.trim();
  if (!alias) {
    return null;
  }

  const linkStatus = resolveSessionAliasLinkStatus(session);

  switch (linkStatus) {
    case SIMF_ALIAS_STATUS.BLOCKED:
      return {
        text: `Alias bloqueado: ${alias}`,
        variant: 'danger',
      };
    case SIMF_ALIAS_STATUS.INACTIVE:
      return {
        text: `Alias inactivo: ${alias}`,
        variant: 'warning',
      };
    case SIMF_ALIAS_STATUS.PENDING:
      return {
        text: `Alias pendiente de baja: ${alias}`,
        variant: 'warning',
      };
    case SIMF_ALIAS_STATUS.UNREGISTERED:
      return {
        text: 'Block UNRG',
        variant: 'danger',
      };
    case SIMF_ALIAS_STATUS.ACTIVE:
    default:
      return {
        text: `Alias activo: ${alias}`,
        variant: 'success',
      };
  }
}
