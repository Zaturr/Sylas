import type { Account } from '../account';
import type { AliasResolveEntry, SimulationSession } from './auth.types';
import { hasConfiguredAliasValue } from './auth.types';

export type AccountAliasRow = {
  account: Account;
  aliasEntry: AliasResolveEntry | null;
  canCreateAlias: boolean;
};

export function formatRegistrationAccountType(accountType: string): string {
  switch (accountType.trim().toLowerCase()) {
    case 'corriente':
      return 'Corriente';
    case 'ahorro':
      return 'Ahorro';
    case 'dolares':
      return 'Divisa (USD)';
    default:
      return accountType;
  }
}

export function isEligibleAliasAccount(account: Account): boolean {
  return account.account_type?.toLowerCase() !== 'dolares';
}

export function buildAccountAliasMatrix(session: SimulationSession): AccountAliasRow[] {
  const aliasByAccountId = new Map<string, AliasResolveEntry>();

  for (const entry of session.registeredAliases) {
    const accountId = entry.account_id?.trim();
    if (accountId && hasConfiguredAliasValue(entry.alias_value)) {
      aliasByAccountId.set(accountId, entry);
    }
  }

  return session.accounts.map((account) => {
    const aliasEntry = aliasByAccountId.get(account.id) ?? null;
    return {
      account,
      aliasEntry,
      canCreateAlias: isEligibleAliasAccount(account) && aliasEntry === null,
    };
  });
}

export function countLegalEntityAliasProgress(session: SimulationSession): {
  configured: number;
  eligible: number;
} {
  const rows = buildAccountAliasMatrix(session);
  const eligible = rows.filter((row) => isEligibleAliasAccount(row.account)).length;
  const configured = rows.filter((row) => row.aliasEntry !== null).length;

  return { configured, eligible };
}

export function getAliasEntryByAccountId(
  session: SimulationSession,
  accountId: string,
): AliasResolveEntry | null {
  const normalizedAccountId = accountId.trim();
  if (!normalizedAccountId) {
    return null;
  }

  return (
    session.registeredAliases.find(
      (entry) =>
        entry.account_id?.trim() === normalizedAccountId &&
        hasConfiguredAliasValue(entry.alias_value),
    ) ?? null
  );
}

export function hasAvailableAccountsForNewAlias(session: SimulationSession): boolean {
  return buildAccountAliasMatrix(session).some((row) => row.canCreateAlias);
}

export function getDefaultAccountIdForNewAlias(session: SimulationSession): string | null {
  const availableRow = buildAccountAliasMatrix(session).find((row) => row.canCreateAlias);
  return availableRow?.account.id ?? null;
}
