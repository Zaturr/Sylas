import type { Account } from '../account';
import type { Customer } from '../user';
import type { ParsedDocument } from './documentParser';
import type { SimfAliasStatus, UserModifiableAliasStatus } from './aliasStatus';

export type SimulationAuthStep =
  | 'login'
  | 'create-account'
  | 'authenticated'
  | 'alias-management'
  | 'create-alias';

export type SimulationSession = {
  customer: Customer;
  accounts: Account[];
  alias: string | null;
  hasConfiguredAlias: boolean;
  mappedDocument: ParsedDocument;
};

export type AliasCheckStatus = 'found' | 'not-found' | 'error';

export type AliasCheckResult = {
  status: AliasCheckStatus;
  reason: string;
  alias: string | null;
  message: string;
  agentStatus: SimfAliasStatus | null;
  bankCode: string | null;
};

export type SimulationAuthState = {
  step: SimulationAuthStep;
  documentInput: string;
  firstNameInput: string;
  lastNameInput: string;
  session: SimulationSession | null;
  errorMessage: string;
  isSubmitting: boolean;
  canCreateAccount: boolean;
  aliasInput: string;
  aliasStatusInput: UserModifiableAliasStatus | '';
  aliasCheck: AliasCheckResult | null;
};

export const createInitialSimulationAuthState = (): SimulationAuthState => ({
  step: 'login',
  documentInput: '',
  firstNameInput: '',
  lastNameInput: '',
  session: null,
  errorMessage: '',
  isSubmitting: false,
  canCreateAccount: false,
  aliasInput: '',
  aliasStatusInput: '',
  aliasCheck: null,
});

export const isPendingAlias = (alias: string | null): boolean => {
  if (!alias) {
    return true;
  }
  return alias.startsWith('pending.');
};

export const hasConfiguredAliasValue = (alias: string | null): boolean => {
  if (!alias) {
    return false;
  }
  const trimmed = alias.trim();
  if (!trimmed || isPendingAlias(trimmed)) {
    return false;
  }
  return true;
};
