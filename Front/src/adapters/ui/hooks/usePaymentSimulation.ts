import { useCallback, useEffect, useMemo, useState } from 'react';
import { simulationAdapter } from '../../api/simulationAdapter';
import type {
  MobileAppTab,
  PaymentSimulationContext,
  PaymentSimulationStep,
} from '../../../domain/simulation';
import {
  createInitialSimulationContext,
  isPaymentFlowActive,
} from '../../../domain/simulation';

export function usePaymentSimulation() {
  const [context, setContext] = useState<PaymentSimulationContext>(
    createInitialSimulationContext,
  );
  const [isResolvingAlias, setIsResolvingAlias] = useState(false);

  useEffect(() => {
    if (context.step !== 'processing') {
      return;
    }

    const timer = window.setTimeout(() => {
      setContext((prev) => ({
        ...prev,
        step: 'success',
        errorMessage: '',
      }));
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [context.step]);

  const setTab = useCallback((activeTab: MobileAppTab) => {
    setContext((prev) => {
      if (isPaymentFlowActive(prev.step) && prev.step !== 'success' && prev.step !== 'error') {
        return prev;
      }

      return {
        ...prev,
        activeTab,
        step: 'idle',
        errorMessage: '',
      };
    });
  }, []);

  const startPayment = useCallback(() => {
    setContext((prev) => ({
      ...prev,
      step: 'enter-alias',
      aliasValue: '',
      amount: '',
      recipient: null,
      errorMessage: '',
    }));
  }, []);

  const setAliasValue = useCallback((aliasValue: string) => {
    setContext((prev) => ({ ...prev, aliasValue, errorMessage: '' }));
  }, []);

  const setAmount = useCallback((amount: string) => {
    setContext((prev) => ({ ...prev, amount, errorMessage: '' }));
  }, []);

  const submitAlias = useCallback(async () => {
    const draftResult = simulationAdapter.validatePaymentDraft(
      context.aliasValue,
      context.amount,
    );

    if (!draftResult.ok) {
      setContext((prev) => ({
        ...prev,
        errorMessage: draftResult.error,
      }));
      return;
    }

    setIsResolvingAlias(true);
    setContext((prev) => ({ ...prev, errorMessage: '' }));

    try {
      const resolveResult = await simulationAdapter.resolvePaymentAlias(
        context.aliasValue.trim(),
      );

      if (!resolveResult.ok) {
        setContext((prev) => ({
          ...prev,
          errorMessage: resolveResult.error,
        }));
        return;
      }

      setContext((prev) => ({
        ...prev,
        step: 'confirm',
        aliasValue: prev.aliasValue.trim(),
        amount: prev.amount.trim(),
        recipient: resolveResult.recipient,
        errorMessage: '',
      }));
    } finally {
      setIsResolvingAlias(false);
    }
  }, [context.aliasValue, context.amount]);

  const confirmPayment = useCallback(() => {
    setContext((prev) => ({
      ...prev,
      step: 'processing',
      errorMessage: '',
    }));
  }, []);

  const cancelFlow = useCallback(() => {
    setIsResolvingAlias(false);
    setContext((prev) => ({
      ...prev,
      step: 'idle',
      aliasValue: '',
      amount: '',
      recipient: null,
      errorMessage: '',
    }));
  }, []);

  const goBack = useCallback(() => {
    setIsResolvingAlias(false);
    setContext((prev) => {
      if (prev.step === 'enter-alias') {
        return {
          ...prev,
          step: 'idle',
          aliasValue: '',
          amount: '',
          recipient: null,
          errorMessage: '',
        };
      }

      if (prev.step === 'confirm') {
        return { ...prev, step: 'enter-alias', recipient: null, errorMessage: '' };
      }

      if (prev.step === 'error') {
        return { ...prev, step: 'enter-alias', errorMessage: '' };
      }

      return prev;
    });
  }, []);

  const resetPayment = useCallback(() => {
    setIsResolvingAlias(false);
    setContext((prev) => ({
      ...prev,
      step: 'idle',
      aliasValue: '',
      amount: '',
      recipient: null,
      errorMessage: '',
    }));
  }, []);

  const setStep = useCallback((step: PaymentSimulationStep) => {
    setContext((prev) => ({ ...prev, step }));
  }, []);

  const actions = useMemo(
    () => ({
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
      reset: () => {
        setIsResolvingAlias(false);
        setContext(createInitialSimulationContext());
      },
    }),
    [
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
    ],
  );

  return { context, isResolvingAlias, ...actions };
}
