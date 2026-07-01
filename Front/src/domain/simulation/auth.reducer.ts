import type { SimulationAuthState, SimulationSession } from './auth.types';
import { SIMF_ALIAS_STATUS, isUserModifiableAliasStatus } from './aliasStatus';
import type { UserModifiableAliasStatus } from './aliasStatus';
import { createInitialSimulationAuthState } from './auth.types';

export type SimulationAuthAction =
  | { type: 'SET_DOCUMENT'; value: string }
  | { type: 'SET_FIRST_NAME'; value: string }
  | { type: 'SET_LAST_NAME'; value: string }
  | { type: 'SUBMIT_LOGIN' }
  | { type: 'LOGIN_SUCCESS'; session: SimulationSession }
  | { type: 'LOGIN_NOT_FOUND'; message: string }
  | { type: 'LOGIN_FAILED'; message: string }
  | { type: 'OPEN_CREATE_ACCOUNT' }
  | { type: 'BACK_TO_LOGIN' }
  | { type: 'SUBMIT_CREATE_ACCOUNT' }
  | { type: 'CREATE_ACCOUNT_SUCCESS'; session: SimulationSession }
  | { type: 'CREATE_ACCOUNT_FAILED'; message: string }
  | { type: 'OPEN_ALIAS_MANAGEMENT' }
  | { type: 'ALIAS_CHECK_SUCCESS'; check: NonNullable<SimulationAuthState['aliasCheck']> }
  | { type: 'ALIAS_CHECK_FAILED'; message: string }
  | { type: 'OPEN_CREATE_ALIAS' }
  | { type: 'SET_ALIAS_INPUT'; value: string }
  | { type: 'SET_ALIAS_STATUS'; value: UserModifiableAliasStatus | '' }
  | { type: 'SUBMIT_UPDATE_ALIAS_STATUS' }
  | { type: 'UPDATE_ALIAS_STATUS_SUCCESS'; session: SimulationSession; check: NonNullable<SimulationAuthState['aliasCheck']> }
  | { type: 'UPDATE_ALIAS_STATUS_FAILED'; message: string }
  | { type: 'SUBMIT_CREATE_ALIAS' }
  | { type: 'CREATE_ALIAS_SUCCESS'; session: SimulationSession }
  | { type: 'CREATE_ALIAS_FAILED'; message: string }
  | { type: 'BACK_TO_HOME' }
  | { type: 'LOGOUT' };

export function simulationAuthReducer(
  state: SimulationAuthState,
  action: SimulationAuthAction,
): SimulationAuthState {
  switch (action.type) {
    case 'SET_DOCUMENT':
      return {
        ...state,
        documentInput: action.value,
        errorMessage: '',
        canCreateAccount: false,
      };
    case 'SET_FIRST_NAME':
      return {
        ...state,
        firstNameInput: action.value,
        errorMessage: '',
      };
    case 'SET_LAST_NAME':
      return {
        ...state,
        lastNameInput: action.value,
        errorMessage: '',
      };
    case 'SUBMIT_LOGIN':
      return {
        ...state,
        isSubmitting: true,
        errorMessage: '',
        canCreateAccount: false,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        step: 'authenticated',
        session: action.session,
        isSubmitting: false,
        errorMessage: '',
        canCreateAccount: false,
        aliasCheck: null,
        aliasInput: '',
        aliasStatusInput: '',
      };
    case 'LOGIN_NOT_FOUND':
      return {
        ...state,
        isSubmitting: false,
        errorMessage: action.message,
        canCreateAccount: true,
      };
    case 'LOGIN_FAILED':
      return {
        ...state,
        isSubmitting: false,
        errorMessage: action.message,
        canCreateAccount: false,
      };
    case 'OPEN_CREATE_ACCOUNT':
      return {
        ...state,
        step: 'create-account',
        errorMessage: '',
        firstNameInput: '',
        lastNameInput: '',
      };
    case 'BACK_TO_LOGIN':
      return {
        ...state,
        step: 'login',
        errorMessage: '',
        canCreateAccount: state.canCreateAccount,
      };
    case 'SUBMIT_CREATE_ACCOUNT':
      return {
        ...state,
        isSubmitting: true,
        errorMessage: '',
      };
    case 'CREATE_ACCOUNT_SUCCESS':
      return {
        ...state,
        step: 'authenticated',
        session: action.session,
        isSubmitting: false,
        errorMessage: '',
        canCreateAccount: false,
        aliasCheck: null,
        aliasInput: '',
        aliasStatusInput: '',
      };
    case 'CREATE_ACCOUNT_FAILED':
      return {
        ...state,
        isSubmitting: false,
        errorMessage: action.message,
      };
    case 'OPEN_ALIAS_MANAGEMENT':
      return {
        ...state,
        step: 'alias-management',
        errorMessage: '',
        aliasCheck: null,
        isSubmitting: true,
      };
    case 'ALIAS_CHECK_SUCCESS':
      return {
        ...state,
        isSubmitting: false,
        aliasCheck: action.check,
        aliasStatusInput:
          action.check.status === 'found'
            ? action.check.agentStatus &&
              isUserModifiableAliasStatus(action.check.agentStatus)
              ? action.check.agentStatus
              : SIMF_ALIAS_STATUS.ACTIVE
            : '',
        errorMessage: action.check.status === 'error' ? action.check.message : '',
      };
    case 'ALIAS_CHECK_FAILED':
      return {
        ...state,
        isSubmitting: false,
        errorMessage: action.message,
      };
    case 'OPEN_CREATE_ALIAS':
      return {
        ...state,
        step: 'create-alias',
        errorMessage: '',
        aliasInput: '',
      };
    case 'SET_ALIAS_INPUT':
      return {
        ...state,
        aliasInput: action.value,
        errorMessage: '',
      };
    case 'SET_ALIAS_STATUS':
      return {
        ...state,
        aliasStatusInput: action.value,
        errorMessage: '',
      };
    case 'SUBMIT_UPDATE_ALIAS_STATUS':
      return {
        ...state,
        isSubmitting: true,
        errorMessage: '',
      };
    case 'UPDATE_ALIAS_STATUS_SUCCESS':
      return {
        ...state,
        session: action.session,
        aliasCheck: action.check,
        aliasStatusInput:
          action.check.agentStatus && isUserModifiableAliasStatus(action.check.agentStatus)
            ? action.check.agentStatus
            : state.aliasStatusInput,
        isSubmitting: false,
        errorMessage: '',
      };
    case 'UPDATE_ALIAS_STATUS_FAILED':
      return {
        ...state,
        isSubmitting: false,
        errorMessage: action.message,
      };
    case 'SUBMIT_CREATE_ALIAS':
      return {
        ...state,
        isSubmitting: true,
        errorMessage: '',
      };
    case 'CREATE_ALIAS_SUCCESS':
      return {
        ...state,
        step: 'authenticated',
        session: action.session,
        isSubmitting: false,
        errorMessage: '',
        aliasCheck: null,
        aliasInput: '',
      };
    case 'CREATE_ALIAS_FAILED':
      return {
        ...state,
        isSubmitting: false,
        errorMessage: action.message,
      };
    case 'BACK_TO_HOME':
      return {
        ...state,
        step: 'authenticated',
        errorMessage: '',
        aliasCheck: null,
        aliasInput: '',
        aliasStatusInput: '',
      };
    case 'LOGOUT':
      return createInitialSimulationAuthState();
    default:
      return state;
  }
}
