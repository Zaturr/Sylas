export type PaymentSimulationStep =
  | 'idle'
  | 'enter-alias'
  | 'confirm'
  | 'processing'
  | 'success'
  | 'error';

export type MobileAppTab = 'home' | 'payments';

export const PAYMENT_SIMULATION_INITIAL_STEP: PaymentSimulationStep = 'idle';

export type PaymentRecipient = {
  firstName: string;
  lastName: string;
  email: string;
  documentType: string;
  documentNumber: string;
  alias: string;
};

export type PaymentSimulationState = {
  step: PaymentSimulationStep;
  activeTab: MobileAppTab;
  aliasValue: string;
  amount: string;
  recipient: PaymentRecipient | null;
  errorMessage: string;
};

export const createInitialPaymentSimulationState = (): PaymentSimulationState => ({
  step: PAYMENT_SIMULATION_INITIAL_STEP,
  activeTab: 'home',
  aliasValue: '',
  amount: '',
  recipient: null,
  errorMessage: '',
});

export const isPaymentFlowActive = (step: PaymentSimulationStep): boolean =>
  step !== 'idle';
