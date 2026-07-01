import type { Account } from '../account';
import type { AliasCheckResult, SimulationSession } from './auth.types';
import { SIMF_ALIAS_STATUS } from './aliasStatus';

export const ALIAS_DELETE_MIN_DAYS = 30;

export function filterAccountsByBankCode(accounts: Account[], bankCode: string): Account[] {
  return accounts.filter((account) => account.bank_id === bankCode);
}

export function applyBankAccountFilter(
  session: SimulationSession,
  bankCode: string,
): SimulationSession {
  const accounts = filterAccountsByBankCode(session.accounts, bankCode);
  const primaryAccountId =
    session.primaryAccountId &&
    accounts.some((account) => account.id === session.primaryAccountId)
      ? session.primaryAccountId
      : (accounts[0]?.id ?? null);

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
    return (
      accounts.find((account) => account.id === session.primaryAccountId) ??
      accounts[0] ??
      null
    );
  }

  return accounts[0] ?? null;
}

export function withPrimaryAccount(
  session: SimulationSession,
  accountId: string,
): SimulationSession {
  const selected = session.accounts.find((account) => account.id === accountId);
  if (!selected) {
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
