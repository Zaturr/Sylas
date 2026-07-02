import { useCallback, useReducer, useState } from 'react';
import {
  createInitialPaymentSimulationState,
  paymentSimulationReducer,
  validatePaymentDraft,
  type MobileAppTab,
  type PaymentSimulationStep,
} from '../../../../domain/simulation';
import { usePaymentSimulationService } from '../providers/SimulationServicesProvider';

export function usePaymentSimulation() {
  const paymentSimulationService = usePaymentSimulationService();
  const [context, dispatch] = useReducer(
    paymentSimulationReducer,
    undefined,
    createInitialPaymentSimulationState,
  );
  const [isResolvingAlias, setIsResolvingAlias] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const setTab = useCallback((tab: MobileAppTab) => {
    dispatch({ type: 'SET_TAB', tab });
  }, []);

  const startPayment = useCallback(() => {
    dispatch({ type: 'START_PAYMENT' });
  }, []);

  const setAliasValue = useCallback((value: string) => {
    dispatch({ type: 'SET_ALIAS', value });
  }, []);

  const setAmount = useCallback((value: string) => {
    dispatch({ type: 'SET_AMOUNT', value });
  }, []);

  const submitAlias = useCallback(async () => {
    const draftResult = validatePaymentDraft(context.aliasValue, context.amount);

    if (!draftResult.ok) {
      dispatch({ type: 'SET_ERROR', message: draftResult.error });
      return;
    }

    setIsResolvingAlias(true);
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const resolveResult = await paymentSimulationService.resolvePaymentAlias(
        context.aliasValue.trim(),
      );

      if (!resolveResult.ok) {
        dispatch({ type: 'SET_ERROR', message: resolveResult.error });
        return;
      }

      dispatch({
        type: 'SUBMIT_ALIAS_SUCCESS',
        aliasValue: context.aliasValue.trim(),
        amount: context.amount.trim(),
        recipient: resolveResult.recipient,
      });
    } finally {
      setIsResolvingAlias(false);
    }
  }, [context.aliasValue, context.amount, paymentSimulationService]);

  const confirmPayment = useCallback(async () => {
    dispatch({ type: 'CONFIRM_PAYMENT' });
    setIsProcessingPayment(true);

    try {
      const result = await paymentSimulationService.executePayment(
        context.aliasValue,
        context.amount,
      );

      if (!result.ok) {
        dispatch({ type: 'PAYMENT_FAILED', message: result.error });
        return;
      }

      dispatch({ type: 'PAYMENT_SUCCESS' });
    } finally {
      setIsProcessingPayment(false);
    }
  }, [context.aliasValue, context.amount, paymentSimulationService]);

  const cancelFlow = useCallback(() => {
    setIsResolvingAlias(false);
    setIsProcessingPayment(false);
    dispatch({ type: 'CANCEL_FLOW' });
  }, []);

  const goBack = useCallback(() => {
    setIsResolvingAlias(false);
    dispatch({ type: 'GO_BACK' });
  }, []);

  const resetPayment = useCallback(() => {
    setIsResolvingAlias(false);
    setIsProcessingPayment(false);
    dispatch({ type: 'RESET_PAYMENT' });
  }, []);

  const setStep = useCallback((step: PaymentSimulationStep) => {
    if (step === 'processing') {
      dispatch({ type: 'CONFIRM_PAYMENT' });
      return;
    }

    if (step === 'success') {
      dispatch({ type: 'PAYMENT_SUCCESS' });
      return;
    }

    if (step === 'error') {
      dispatch({ type: 'PAYMENT_FAILED', message: context.errorMessage || 'Error desconocido' });
    }
  }, [context.errorMessage]);

  const reset = useCallback(() => {
    setIsResolvingAlias(false);
    setIsProcessingPayment(false);
    dispatch({ type: 'RESET' });
  }, []);

  return {
    context,
    isResolvingAlias,
    isProcessingPayment,
    setTab,
    startPayment,
    setAliasValue,
    setAmount,
    submitAlias,
    confirmPayment,
    cancelFlow,
    goBack,
    resetPayment,
    setStep,
    reset,
  };
}
