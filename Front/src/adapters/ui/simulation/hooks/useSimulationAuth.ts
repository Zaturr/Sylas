import { useCallback, useReducer } from 'react';
import type { CheckAliasResult } from '../../../../application/simulation/authSimulation.port';
import { simulationAuthReducer } from '../../../../domain/simulation/auth.reducer';
import {
  createInitialSimulationAuthState,
  type AliasCheckResult,
  type SimulationAuthState,
} from '../../../../domain/simulation/auth.types';
import {
  isAliasDeletionBlocked,
  needsAccountLinking,
  withPrimaryAccount,
} from '../../../../domain/simulation/aliasFlow';
import { isUserModifiableAliasStatus } from '../../../../domain/simulation/aliasStatus';
import { formatDocumentInput } from '../../../../domain/simulation';
import { validateAliasValue } from '../../../../domain/simulation/aliasValidation';
import { useAuthSimulationService } from '../providers/SimulationServicesProvider';

function mapServiceCheckToState(
  check: Extract<CheckAliasResult, { ok: true }>,
): NonNullable<SimulationAuthState['aliasCheck']> {
  if (check.status === 'found') {
    return {
      status: 'found',
      reason: '',
      alias: check.alias,
      message: check.message,
      agentStatus: check.agentStatus,
      bankCode: check.bankCode,
    };
  }

  return {
    status: 'not-found',
    reason: check.reason,
    alias: null,
    message: check.message,
    agentStatus: check.agentStatus,
    bankCode: check.bankCode,
  };
}

export function useSimulationAuth() {
  const authSimulationService = useAuthSimulationService();
  const [state, dispatch] = useReducer(
    simulationAuthReducer,
    undefined,
    createInitialSimulationAuthState,
  );

  const setDocumentInput = useCallback((value: string) => {
    dispatch({ type: 'SET_DOCUMENT', value });
  }, []);

  const setFirstNameInput = useCallback((value: string) => {
    dispatch({ type: 'SET_FIRST_NAME', value });
  }, []);

  const setLastNameInput = useCallback((value: string) => {
    dispatch({ type: 'SET_LAST_NAME', value });
  }, []);

  const submitLogin = useCallback(async () => {
    dispatch({ type: 'SUBMIT_LOGIN' });

    const result = await authSimulationService.loginByDocument(state.documentInput);

    if (result.ok) {
      dispatch({ type: 'LOGIN_SUCCESS', session: result.session });
      return;
    }

    if (result.reason === 'not-found') {
      dispatch({ type: 'LOGIN_NOT_FOUND', message: result.message });
      return;
    }

    dispatch({ type: 'LOGIN_FAILED', message: result.message });
  }, [authSimulationService, state.documentInput]);

  const openCreateAccount = useCallback(() => {
    dispatch({ type: 'OPEN_CREATE_ACCOUNT' });
  }, []);

  const backToLogin = useCallback(() => {
    dispatch({ type: 'BACK_TO_LOGIN' });
  }, []);

  const submitCreateAccount = useCallback(async () => {
    dispatch({ type: 'SUBMIT_CREATE_ACCOUNT' });

    const result = await authSimulationService.createAccount({
      documentInput: state.documentInput,
      firstName: state.firstNameInput,
      lastName: state.lastNameInput,
    });

    if (result.ok) {
      dispatch({ type: 'CREATE_ACCOUNT_SUCCESS', session: result.session });
      return;
    }

    dispatch({ type: 'CREATE_ACCOUNT_FAILED', message: result.message });
  }, [
    authSimulationService,
    state.documentInput,
    state.firstNameInput,
    state.lastNameInput,
  ]);

  const runAliasCheck = useCallback(async () => {
    if (!state.session) {
      return;
    }

    const documentInput = formatDocumentInput(
      state.session.mappedDocument.documentType,
      state.session.mappedDocument.documentNumber,
    );

    const result = await authSimulationService.checkAliasByDocument(documentInput);

    if (!result.ok) {
      dispatch({ type: 'ALIAS_CHECK_FAILED', message: result.message });
      return;
    }

    const check = mapServiceCheckToState(result);
    dispatch({ type: 'ALIAS_CHECK_SUCCESS', check });

    if (check.status === 'found' && needsAccountLinking(state.session, check)) {
      dispatch({ type: 'OPEN_ALIAS_LINK_ACCOUNT', mode: 'initial' });
    }
  }, [authSimulationService, state.session]);

  const openAliasSplash = useCallback(() => {
    dispatch({ type: 'OPEN_ALIAS_SPLASH' });
  }, []);

  const continueAliasSplash = useCallback(async () => {
    dispatch({ type: 'OPEN_ALIAS_MANAGEMENT' });
    await runAliasCheck();
  }, [runAliasCheck]);

  const openCreateAlias = useCallback(() => {
    if (state.session && state.session.accounts.length > 0) {
      dispatch({ type: 'OPEN_ALIAS_LINK_ACCOUNT', mode: 'before-create-alias' });
      return;
    }

    dispatch({ type: 'OPEN_CREATE_ALIAS' });
  }, [state.session]);

  const openSelectAccountForAlias = useCallback(() => {
    dispatch({ type: 'OPEN_ALIAS_LINK_ACCOUNT', mode: 'select-for-alias' });
  }, []);

  const openChangeAccount = useCallback(() => {
    dispatch({ type: 'OPEN_ALIAS_LINK_ACCOUNT', mode: 'change' });
  }, []);

  const selectLinkAccount = useCallback((accountId: string) => {
    dispatch({ type: 'SET_SELECTED_ACCOUNT', accountId });
  }, []);

  const confirmLinkAccount = useCallback(() => {
    if (!state.session || !state.selectedAccountId) {
      return;
    }

    dispatch({
      type: 'SELECT_LINK_ACCOUNT',
      session: withPrimaryAccount(state.session, state.selectedAccountId),
      accountId: state.selectedAccountId,
    });
  }, [state.session, state.selectedAccountId]);

  const setAliasInput = useCallback((value: string) => {
    dispatch({ type: 'SET_ALIAS_INPUT', value });
  }, []);

  const setAliasStatus = useCallback((value: AliasCheckResult['agentStatus']) => {
    if (!value || !isUserModifiableAliasStatus(value)) {
      return;
    }

    dispatch({ type: 'SET_ALIAS_STATUS', value });
  }, []);

  const submitUpdateAliasStatus = useCallback(async () => {
    if (!state.session || !state.aliasCheck?.alias) {
      return;
    }

    const targetStatus =
      state.aliasStatusInput ||
      (state.aliasCheck.agentStatus &&
      isUserModifiableAliasStatus(state.aliasCheck.agentStatus)
        ? state.aliasCheck.agentStatus
        : null);

    if (!targetStatus || !isUserModifiableAliasStatus(targetStatus)) {
      return;
    }

    const currentModifiable =
      state.aliasCheck.agentStatus &&
      isUserModifiableAliasStatus(state.aliasCheck.agentStatus)
        ? state.aliasCheck.agentStatus
        : null;

    if (targetStatus === currentModifiable) {
      return;
    }

    dispatch({ type: 'SUBMIT_UPDATE_ALIAS_STATUS' });

    const result = await authSimulationService.updateAliasStatus(state.session, {
      aliasValue: state.aliasCheck.alias,
      bankCode: state.aliasCheck.bankCode ?? '',
      targetStatus,
    });

    if (result.ok) {
      dispatch({
        type: 'UPDATE_ALIAS_STATUS_SUCCESS',
        session: result.session,
        check: mapServiceCheckToState(result.check),
      });
      return;
    }

    dispatch({ type: 'UPDATE_ALIAS_STATUS_FAILED', message: result.message });
  }, [
    authSimulationService,
    state.session,
    state.aliasCheck,
    state.aliasStatusInput,
  ]);

  const submitCreateAlias = useCallback(async () => {
    if (!state.session) {
      return;
    }

    const validation = validateAliasValue(state.aliasInput);
    if (!validation.ok) {
      dispatch({ type: 'CREATE_ALIAS_FAILED', message: validation.error });
      return;
    }

    dispatch({ type: 'SUBMIT_CREATE_ALIAS' });

    const result = await authSimulationService.registerAlias(
      state.session,
      validation.value,
    );

    if (result.ok) {
      dispatch({ type: 'CREATE_ALIAS_SUCCESS', session: result.session });
      return;
    }

    dispatch({ type: 'CREATE_ALIAS_FAILED', message: result.message });
  }, [authSimulationService, state.session, state.aliasInput]);

  const requestDeleteAlias = useCallback(async () => {
    if (!state.session?.customer.created_at) {
      return;
    }

    if (isAliasDeletionBlocked(state.session.customer.created_at)) {
      dispatch({
        type: 'OPEN_ALIAS_ERROR',
        message:
          'No puedes bloquear este alias porque fue creado hace menos de 30 días.',
      });
      return;
    }

    dispatch({ type: 'SUBMIT_UPDATE_ALIAS_STATUS' });

    const result = await authSimulationService.deleteAlias(state.session);

    if (result.ok) {
      dispatch({
        type: 'UPDATE_ALIAS_STATUS_SUCCESS',
        session: result.session,
        check: mapServiceCheckToState(result.check),
      });
      return;
    }

    dispatch({ type: 'UPDATE_ALIAS_STATUS_FAILED', message: result.message });
  }, [authSimulationService, state.session]);

  const finishAliasFlow = useCallback(() => {
    dispatch({ type: 'FINISH_ALIAS_FLOW' });
  }, []);

  const backToAliasManagement = useCallback(async () => {
    dispatch({ type: 'OPEN_ALIAS_MANAGEMENT' });
    await runAliasCheck();
  }, [runAliasCheck]);

  const backToHome = useCallback(() => {
    dispatch({ type: 'BACK_TO_HOME' });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  return {
    auth: state,
    setDocumentInput,
    setFirstNameInput,
    setLastNameInput,
    submitLogin,
    openCreateAccount,
    backToLogin,
    submitCreateAccount,
    openAliasSplash,
    continueAliasSplash,
    openCreateAlias,
    openSelectAccountForAlias,
    openChangeAccount,
    selectLinkAccount,
    confirmLinkAccount,
    setAliasInput,
    setAliasStatus,
    submitUpdateAliasStatus,
    submitCreateAlias,
    requestDeleteAlias,
    finishAliasFlow,
    backToAliasManagement,
    backToHome,
    logout,
  };
}
