import type { MobileAppTab, PaymentRecipient, PaymentSimulationState } from './types';
import { createInitialPaymentSimulationState, isPaymentFlowActive } from './types';

export type PaymentSimulationAction =
  | { type: 'SET_TAB'; tab: MobileAppTab }
  | { type: 'START_PAYMENT'; errorMessage?: string }
  | { type: 'SET_ALIAS'; value: string }
  | { type: 'SET_AMOUNT'; value: string }
  | { type: 'SUBMIT_ALIAS_SUCCESS'; aliasValue: string; amount: string; recipient: PaymentRecipient }
  | { type: 'SET_ERROR'; message: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CONFIRM_PAYMENT' }
  | { type: 'PAYMENT_SUCCESS' }
  | { type: 'PAYMENT_FAILED'; message: string }
  | { type: 'GO_BACK' }
  | { type: 'CANCEL_FLOW' }
  | { type: 'RESET_PAYMENT' }
  | { type: 'RESET' };

export function paymentSimulationReducer(
  state: PaymentSimulationState,
  action: PaymentSimulationAction,
): PaymentSimulationState {
  switch (action.type) {
    case 'SET_TAB':
      if (isPaymentFlowActive(state.step) && state.step !== 'success' && state.step !== 'error') {
        return state;
      }

      return {
        ...state,
        activeTab: action.tab,
        step: 'idle',
        errorMessage: '',
      };

    case 'START_PAYMENT':
      return {
        ...state,
        step: 'enter-alias',
        aliasValue: '',
        amount: '',
        recipient: null,
        errorMessage: action.errorMessage ?? '',
      };

    case 'SET_ALIAS':
      return { ...state, aliasValue: action.value, errorMessage: '' };

    case 'SET_AMOUNT':
      return { ...state, amount: action.value, errorMessage: '' };

    case 'SUBMIT_ALIAS_SUCCESS':
      return {
        ...state,
        step: 'confirm',
        aliasValue: action.aliasValue,
        amount: action.amount,
        recipient: action.recipient,
        errorMessage: '',
      };

    case 'SET_ERROR':
      return { ...state, errorMessage: action.message };

    case 'CLEAR_ERROR':
      return { ...state, errorMessage: '' };

    case 'CONFIRM_PAYMENT':
      return { ...state, step: 'processing', errorMessage: '' };

    case 'PAYMENT_SUCCESS':
      return { ...state, step: 'success', errorMessage: '' };

    case 'PAYMENT_FAILED':
      return { ...state, step: 'error', errorMessage: action.message };

    case 'GO_BACK':
      if (state.step === 'enter-alias') {
        return {
          ...createInitialPaymentSimulationState(),
          activeTab: state.activeTab,
        };
      }

      if (state.step === 'confirm' || state.step === 'error') {
        return {
          ...state,
          step: 'enter-alias',
          recipient: null,
          errorMessage: '',
        };
      }

      return state;

    case 'CANCEL_FLOW':
    case 'RESET_PAYMENT':
      return {
        ...createInitialPaymentSimulationState(),
        activeTab: state.activeTab,
      };

    case 'RESET':
      return createInitialPaymentSimulationState();

    default:
      return state;
  }
}
