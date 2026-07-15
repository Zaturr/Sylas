import type { Account } from '../account';
import type { AliasCheckResult, SimulationSession } from './auth.types';
import type { AliasBankLinkDetail } from './auth.types';
import { SIMF_ALIAS_STATUS, type SimfAliasStatus } from './aliasStatus';

export const ALIAS_DELETE_MIN_DAYS = 30;

export function filterAccountsByBankCode(accounts: Account[], bankCode: string): Account[] {
  return accounts.filter((account) => account.bank_id === bankCode);
}

export function applyBankAccountFilter(
  session: SimulationSession,
  bankCode: string,
): SimulationSession {
  const accounts = filterAccountsByBankCode(session.accounts, bankCode);
  
  // Try to find a valid primary account ID that is not 'dolares'
  let primaryAccountId = session.primaryAccountId;
  
  if (primaryAccountId) {
    const selected = accounts.find((account) => account.id === primaryAccountId);
    if (!selected || selected.account_type?.toLowerCase() === 'dolares') {
      primaryAccountId = null;
    }
  }

  if (!primaryAccountId) {
    const validAccount = accounts.find(account => account.account_type?.toLowerCase() !== 'dolares');
    primaryAccountId = validAccount?.id ?? (accounts[0]?.id ?? null);
  }

  return {
    ...session,
    accounts,
    primaryAccountId,
  };
}

export function getDefaultLinkedAccountId(session: SimulationSession): string | null {
  return getPrimaryAccount(session)?.id ?? null;
}

export function getPrimaryAccount(session: SimulationSession, bankCode?: string): Account | null {
  const accounts = bankCode
    ? filterAccountsByBankCode(session.accounts, bankCode)
    : session.accounts;

  if (session.primaryAccountId) {
    const selected = accounts.find((account) => account.id === session.primaryAccountId);
    if (selected && selected.account_type?.toLowerCase() !== 'dolares') {
      return selected;
    }
  }

  // Find the first account that is not 'dolares'
  const validAccount = accounts.find(account => account.account_type?.toLowerCase() !== 'dolares');
  return validAccount ?? accounts[0] ?? null;
}

export function withPrimaryAccount(
  session: SimulationSession,
  accountId: string,
): SimulationSession {
  const selected = session.accounts.find((account) => account.id === accountId);
  if (!selected || selected.account_type?.toLowerCase() === 'dolares') {
    return session;
  }

  const remaining = session.accounts.filter(
    (account) => account.id !== accountId && account.bank_id === selected.bank_id,
  );

  return {
    ...session,
    primaryAccountId: accountId,
    accounts: [selected, ...remaining],
  };
}

export function needsAccountLinking(
  session: SimulationSession,
  check: AliasCheckResult | null,
): boolean {
  if (!check || check.status !== 'found') {
    return false;
  }

  if (check.agentStatus === SIMF_ALIAS_STATUS.UNREGISTERED) {
    return true;
  }

  if (session.accounts.length === 0) {
    return true;
  }

  if (check.bankCode) {
    const hasBankAccount = session.accounts.some(
      (account) => account.bank_id === check.bankCode,
    );
    if (!hasBankAccount) {
      return true;
    }
  }

  return false;
}

export function isAliasDeletionBlocked(createdAt: string | undefined | null): boolean {
  if (!createdAt) {
    return false;
  }

  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) {
    return false;
  }

  const elapsedMs = Date.now() - created.getTime();
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
  return elapsedDays < ALIAS_DELETE_MIN_DAYS;
}

export function getAccountDisplayLabel(account: Account): string {
  const lastDigits = account.account_number.slice(-4);
  return `${account.bank_id} ·••• ${lastDigits}`;
}

function isAccountActiveStatus(status: string | undefined): boolean {
  const normalized = status?.trim().toUpperCase() ?? '';
  return normalized === 'ACTIVE' || normalized === SIMF_ALIAS_STATUS.ACTIVE;
}

/** BLKD solo permitido cuando cada vínculo alias-banco está INAC. */
export function canBlockAliasGlobally(
  bankLinks: AliasBankLinkDetail[],
  agentStatus: SimfAliasStatus | null,
): { allowed: boolean; message: string } {
  if (agentStatus === SIMF_ALIAS_STATUS.ACTIVE) {
    return {
      allowed: false,
      message:
        'Debes inactivar el vínculo del alias con el banco antes de bloquearlo (BLKD).',
    };
  }

  if (bankLinks.length === 0) {
    return {
      allowed: false,
      message: 'No hay vínculos bancarios asociados al alias.',
    };
  }

  const hasActiveLink = bankLinks.some((link) => isAccountActiveStatus(link.status));

  if (hasActiveLink) {
    return {
      allowed: false,
      message:
        'No puedes bloquear el alias (BLKD) hasta que el vínculo con cada banco asociado esté inactivo (INAC).',
    };
  }

  return { allowed: true, message: '' };
}

export function canBlockAliasFromSession(
  session: SimulationSession,
  aliasCheck: AliasCheckResult | null,
): { allowed: boolean; message: string } {
  return canBlockAliasGlobally(
    session.bankLinks,
    aliasCheck?.agentStatus ?? null,
  );
}
