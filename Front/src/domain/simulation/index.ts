export type {
  MobileAppTab,
  PaymentRecipient,
  PaymentSimulationState,
  PaymentSimulationStep,
} from './types';

export {
  PAYMENT_SIMULATION_INITIAL_STEP,
  createInitialPaymentSimulationState,
  isPaymentFlowActive,
} from './types';

export type { PaymentSimulationState as PaymentSimulationContext } from './types';

export { createInitialPaymentSimulationState as createInitialSimulationContext } from './types';

export {
  formatPaymentAmount,
  formatRecipientDocument,
  getRecipientInitials,
} from './formatters';

export { validatePaymentDraft, type ValidatePaymentDraftResult } from './paymentValidation';

export {
  validateCreateAccountDraft,
  type ValidateCreateAccountDraftResult,
} from './createAccountValidation';

export {
  validateAliasValue,
  ALIAS_FORMAT_ERROR_MESSAGE,
  type ValidateAliasValueResult,
} from './aliasValidation';

export {
  paymentSimulationReducer,
  type PaymentSimulationAction,
} from './paymentFlow.reducer';

export type {
  SimulationAuthStep,
  SimulationAuthState,
  SimulationSession,
  AliasCheckResult,
} from './auth.types';

export {
  createInitialSimulationAuthState,
  isPendingAlias,
} from './auth.types';

export {
  simulationAuthReducer,
  type SimulationAuthAction,
} from './auth.reducer';

export { parseDocumentInput, formatDocumentInput } from './documentParser';

export {
  generateBankAccountNumber,
  getAccountLastDigits,
} from './accountNumber';

export {
  getHomeAliasBadge,
  resolveSessionAliasLinkStatus,
  type HomeAliasBadge,
  type HomeAliasBadgeVariant,
} from './sessionAliasBadge';

export {
  getPrimaryAccount,
  withPrimaryAccount,
  needsAccountLinking,
  isAliasDeletionBlocked,
  getAccountDisplayLabel,
  ALIAS_DELETE_MIN_DAYS,
} from './aliasFlow';

export {
  SIMF_ALIAS_STATUS,
  ALL_ALIAS_STATUS_OPTIONS,
  USER_MODIFIABLE_ALIAS_STATUSES,
  READONLY_ALIAS_STATUSES,
  coreAccountStatusToSimf,
  isAliasGloballyBlocked,
  isUserModifiableAliasStatus,
  getUserModifiableAliasStatusLabel,
  type SimfAliasStatus,
  type UserModifiableAliasStatus,
} from './aliasStatus';

export { SIMF_REASON_NOT_FOUND, isSimfNotFoundReason } from './simf.constants';
