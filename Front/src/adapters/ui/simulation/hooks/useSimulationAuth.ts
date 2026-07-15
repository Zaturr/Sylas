import { useCallback, useReducer } from 'react';
import type {
  CheckAliasResult,
  CheckAliasSuccessPayload,
} from '../../../../application/simulation/authSimulation.port';
import { simulationAuthReducer } from '../../../../domain/simulation/auth.reducer';
import {
  createInitialSimulationAuthState,
  type AliasCheckResult,
  type AliasResolveEntry,
  type SimulationAuthState,
} from '../../../../domain/simulation/auth.types';
import {
  isAliasDeletionBlocked,
  needsAccountLinking,
  withPrimaryAccount,
  canBlockAliasFromSession,
} from '../../../../domain/simulation/aliasFlow';
import {
  getAliasEntryByAccountId,
  getDefaultAccountIdForNewAlias,
  hasAvailableAccountsForNewAlias,
} from '../../../../domain/simulation/legalEntityAliasMatrix';
import { buildAliasCheckFromAliasEntry } from '../../../api/simulation/alias/aliasCheck.mapper';
import { isUserModifiableAliasStatus } from '../../../../domain/simulation/aliasStatus';
import { formatDocumentInput } from '../../../../domain/simulation';
import { validateAliasValue } from '../../../../domain/simulation/aliasValidation';
import { buildSimfTraceSessionKey } from '../../../../domain/peticiones';
import type { SimfRequestTracePort } from '../../../../application/peticiones';
import {
  useAuthSimulationService,
  useSimfRequestTracePort,
} from '../providers/SimulationServicesProvider';

function mapServiceCheckToState(
  check: CheckAliasSuccessPayload | Extract<CheckAliasResult, { ok: true }>,
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

function clearSessionTrace(
  tracePort: SimfRequestTracePort,
  session: SimulationAuthState['session'],
) {
  if (!session) {
    return;
  }

  tracePort.clearSession(
    buildSimfTraceSessionKey(
      session.mappedDocument.documentType,
      session.mappedDocument.documentNumber,
    ),
  );
}

export function useSimulationAuth() {
  const authSimulationService = useAuthSimulationService();
  const simfRequestTracePort = useSimfRequestTracePort();
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

  const setMiddleNameInput = useCallback((value: string) => {
    dispatch({ type: 'SET_MIDDLE_NAME', value });
  }, []);

  const setLastNameInput = useCallback((value: string) => {
    dispatch({ type: 'SET_LAST_NAME', value });
  }, []);

  const setSecondLastNameInput = useCallback((value: string) => {
    dispatch({ type: 'SET_SECOND_LAST_NAME', value });
  }, []);

  const submitLogin = useCallback(async () => {
    dispatch({ type: 'SUBMIT_LOGIN' });

    const result = await authSimulationService.loginByDocument(state.documentInput);

    if (result.ok === false) {
      if (result.reason === 'not-found') {
        dispatch({ type: 'LOGIN_NOT_FOUND', message: result.message });
      } else {
        dispatch({ type: 'LOGIN_FAILED', message: result.message });
      }
      return;
    }

    dispatch({ type: 'LOGIN_SUCCESS', session: result.session });
    clearSessionTrace(simfRequestTracePort, result.session);
  }, [authSimulationService, simfRequestTracePort, state.documentInput]);

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
      middleName: state.middleNameInput,
      lastName: state.lastNameInput,
      secondLastName: state.secondLastNameInput,
    });

    if (result.ok === false) {
      dispatch({ type: 'CREATE_ACCOUNT_FAILED', message: result.message });
      return;
    }

    dispatch({ type: 'CREATE_ACCOUNT_SUCCESS', session: result.session });
    clearSessionTrace(simfRequestTracePort, result.session);
  }, [
    authSimulationService,
    simfRequestTracePort,
    state.documentInput,
    state.firstNameInput,
    state.middleNameInput,
    state.lastNameInput,
    state.secondLastNameInput,
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
    dispatch({ type: 'ALIAS_CHECK_SUCCESS', check, session: result.session });

    if (check.status === 'found' && needsAccountLinking(state.session, check)) {
      dispatch({ type: 'OPEN_ALIAS_LINK_ACCOUNT', mode: 'initial' });
    }
  }, [authSimulationService, state.session]);

  const openAliasSplash = useCallback(() => {
    dispatch({ type: 'OPEN_ALIAS_SPLASH' });
  }, []);

  const continueAliasSplash = useCallback(async () => {
    if (!state.session) {
      return;
    }

    clearSessionTrace(simfRequestTracePort, state.session);

    const documentInput = formatDocumentInput(
      state.session.mappedDocument.documentType,
      state.session.mappedDocument.documentNumber,
    );

    if (state.session.isLegalEntity) {
      dispatch({ type: 'OPEN_ACCOUNTS_AND_ALIASES' });

      const result = await authSimulationService.checkAliasByDocument(documentInput);
      if (!result.ok) {
        dispatch({ type: 'ALIAS_CHECK_FAILED', message: result.message });
        return;
      }

      dispatch({ type: 'REFRESH_SESSION', session: result.session });
      return;
    }

    dispatch({ type: 'OPEN_ALIAS_MANAGEMENT' });
    await runAliasCheck();
  }, [authSimulationService, runAliasCheck, simfRequestTracePort, state.session]);

  const openAddLegalEntityAlias = useCallback(() => {
    if (!state.session?.isLegalEntity) {
      return;
    }

    if (!hasAvailableAccountsForNewAlias(state.session)) {
      return;
    }

    dispatch({
      type: 'OPEN_ALIAS_LINK_ACCOUNT',
      mode: 'before-create-alias',
      preferredAccountId: getDefaultAccountIdForNewAlias(state.session),
    });
  }, [state.session]);

  const openManageAliasEntry = useCallback(async (entry: AliasResolveEntry) => {
    if (!state.session) {
      return;
    }

    const refreshed = await authSimulationService.refreshSession(state.session);
    if (!refreshed.ok) {
      dispatch({ type: 'ALIAS_CHECK_FAILED', message: refreshed.message });
      return;
    }

    const accountId = entry.account_id?.trim();
    const focusedSession = accountId
      ? {
          ...withPrimaryAccount(refreshed.session, accountId),
          alias: entry.alias_value,
          aliasCoreStatus: entry.alias_status,
          bankLinks: entry.bank_links ?? [],
          hasConfiguredAlias: true,
        }
      : refreshed.session;

    const check = mapServiceCheckToState(
      buildAliasCheckFromAliasEntry(entry, focusedSession.accounts),
    );

    dispatch({
      type: 'OPEN_MANAGE_ALIAS',
      session: focusedSession,
      check,
    });
  }, [authSimulationService, state.session]);

  const backToAccountsAndAliases = useCallback(async () => {
    if (!state.session) {
      dispatch({ type: 'BACK_TO_ACCOUNTS_AND_ALIASES' });
      return;
    }

    const refreshed = await authSimulationService.refreshSession(state.session);
    if (refreshed.ok) {
      dispatch({ type: 'REFRESH_SESSION', session: refreshed.session });
    }

    dispatch({ type: 'BACK_TO_ACCOUNTS_AND_ALIASES' });
  }, [authSimulationService, state.session]);

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
    dispatch({ type: 'SET_ALIAS_INPUT', value: '' });
  }, []);

  const confirmLinkAccount = useCallback(async () => {
    if (!state.session || !state.selectedAccountId) {
      return;
    }

    if (
      state.session.isLegalEntity &&
      getAliasEntryByAccountId(state.session, state.selectedAccountId)
    ) {
      dispatch({
        type: 'CREATE_ALIAS_FAILED',
        message: 'La cuenta seleccionada ya está asociada a un MiAlias.',
      });
      return;
    }

    const newSession = withPrimaryAccount(state.session, state.selectedAccountId);
    const isCreateAliasFlow = state.linkAccountMode === 'before-create-alias';

    if (!isCreateAliasFlow && state.session.hasConfiguredAlias && state.aliasCheck?.alias) {
      dispatch({ type: 'SUBMIT_UPDATE_ALIAS_STATUS' });

      const result = await authSimulationService.changeLinkedAccount(
        newSession,
        state.selectedAccountId,
      );

      if (result.ok === false) {
        dispatch({ type: 'UPDATE_ALIAS_STATUS_FAILED', message: result.message });
        return;
      }

      dispatch({
        type: 'SELECT_LINK_ACCOUNT',
        session: result.session,
        accountId: state.selectedAccountId,
      });
      await runAliasCheck();
      return;
    }

    dispatch({
      type: 'SELECT_LINK_ACCOUNT',
      session: newSession,
      accountId: state.selectedAccountId,
    });
  }, [
    authSimulationService,
    runAliasCheck,
    state.aliasCheck?.alias,
    state.linkAccountMode,
    state.selectedAccountId,
    state.session,
  ]);

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

    if (result.ok === false) {
      dispatch({ type: 'UPDATE_ALIAS_STATUS_FAILED', message: result.message });
      return;
    }

    dispatch({
      type: 'UPDATE_ALIAS_STATUS_SUCCESS',
      session: result.session,
      check: mapServiceCheckToState(result.check),
    });
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
    if (validation.ok === false) {
      dispatch({ type: 'CREATE_ALIAS_FAILED', message: validation.error });
      return;
    }

    dispatch({ type: 'SUBMIT_CREATE_ALIAS' });

    const result = await authSimulationService.registerAlias(
      state.session,
      validation.value,
      state.selectedAccountId ?? undefined,
    );

    if (result.ok === false) {
      dispatch({ type: 'CREATE_ALIAS_FAILED', message: result.message });
      return;
    }

    dispatch({ type: 'CREATE_ALIAS_SUCCESS', session: result.session });
  }, [authSimulationService, state.session, state.aliasInput, state.selectedAccountId]);

  const requestDeleteAlias = useCallback(async () => {
    if (!state.session?.customer.created_at) {
      return;
    }

    if (isAliasDeletionBlocked(state.session.customer.created_at)) {
      dispatch({
        type: 'OPEN_ALIAS_ERROR',
        message:
          'No puedes bloquear este MiAlias porque fue creado hace menos de 30 días.',
      });
      return;
    }

    const blockValidation = canBlockAliasFromSession(state.session, state.aliasCheck);
    if (!blockValidation.allowed) {
      dispatch({
        type: 'OPEN_ALIAS_ERROR',
        message: blockValidation.message,
      });
      return;
    }

    dispatch({ type: 'SUBMIT_UPDATE_ALIAS_STATUS' });

    const result = await authSimulationService.deleteAlias(state.session);

    if (result.ok === false) {
      dispatch({ type: 'UPDATE_ALIAS_STATUS_FAILED', message: result.message });
      return;
    }

    dispatch({
      type: 'UPDATE_ALIAS_STATUS_SUCCESS',
      session: result.session,
      check: mapServiceCheckToState(result.check),
    });
  }, [authSimulationService, state.session]);

  const finishAliasFlow = useCallback(async () => {
    if (state.session?.isLegalEntity) {
      await backToAccountsAndAliases();
      return;
    }

    clearSessionTrace(simfRequestTracePort, state.session);
    dispatch({ type: 'FINISH_ALIAS_FLOW' });
  }, [backToAccountsAndAliases, simfRequestTracePort, state.session]);

  const backToAliasManagement = useCallback(async () => {
    if (state.session?.isLegalEntity) {
      await backToAccountsAndAliases();
      return;
    }

    dispatch({ type: 'OPEN_ALIAS_MANAGEMENT' });
    await runAliasCheck();
  }, [backToAccountsAndAliases, runAliasCheck, state.session?.isLegalEntity]);

  const backFromCreateAlias = useCallback(() => {
    if (
      state.session?.isLegalEntity &&
      state.linkAccountMode === 'before-create-alias'
    ) {
      dispatch({
        type: 'OPEN_ALIAS_LINK_ACCOUNT',
        mode: 'before-create-alias',
        preferredAccountId: state.selectedAccountId,
      });
      return;
    }

    if (state.session?.isLegalEntity) {
      void backToAccountsAndAliases();
    }
  }, [
    backToAccountsAndAliases,
    state.linkAccountMode,
    state.selectedAccountId,
    state.session?.isLegalEntity,
  ]);

  const backToHome = useCallback(() => {
    clearSessionTrace(simfRequestTracePort, state.session);
    dispatch({ type: 'BACK_TO_HOME' });
  }, [simfRequestTracePort, state.session]);

  const logout = useCallback(() => {
    clearSessionTrace(simfRequestTracePort, state.session);

    dispatch({ type: 'LOGOUT' });
  }, [simfRequestTracePort, state.session]);

  return {
    auth: state,
    setDocumentInput,
    setFirstNameInput,
    setMiddleNameInput,
    setLastNameInput,
    setSecondLastNameInput,
    submitLogin,
    openCreateAccount,
    backToLogin,
    submitCreateAccount,
    openAliasSplash,
    continueAliasSplash,
    openCreateAlias,
    openAddLegalEntityAlias,
    openManageAliasEntry,
    backToAccountsAndAliases,
    openSelectAccountForAlias,
    openChangeAccount,
    selectLinkAccount,
    confirmLinkAccount,
    setAliasInput,
    setAliasStatus,
    submitUpdateAliasStatus,
    submitCreateAlias,
    requestDeleteAlias,
    backFromCreateAlias,
    finishAliasFlow,
    backToAliasManagement,
    backToHome,
    logout,
  };
}
