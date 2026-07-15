import { useEffect } from 'react';
import { buildSimfTraceSessionKey } from '../../../../domain/peticiones';
import {
  isPaymentFlowActive,
  isSimfTraceVisibleStep,
  isSimulatorHomeScreen,
  parseDocumentInput,
  type PaymentSimulationState,
} from '../../../../domain/simulation';
import type { SimulationAuthState } from '../../../../domain/simulation/auth.types';
import { AppShell } from '../../components/AppShell';
import { PeticionesPanel, PeticionesProvider, usePeticionesTracePort } from '../../peticiones';
import { MobileDeviceFrame } from '../components/MobileDeviceFrame';
import { PaymentSimulatorScreen } from '../components/PaymentSimulatorScreen';
import { usePaymentSimulation } from '../hooks/usePaymentSimulation';
import { useSimulationAuth } from '../hooks/useSimulationAuth';
import type { AppPage } from '../../navigation';
import '../../pages/forms.css';
import '../simulation-layout.css';
import './simulationPage.css';

type SimulationPageBodyProps = {
  auth: SimulationAuthState;
  context: PaymentSimulationState;
  sessionKey: ReturnType<typeof buildSimfTraceSessionKey> | null;
  isResolvingAlias: boolean;
  canGoBack: boolean;
  setDocumentInput: (value: string) => void;
  setFirstNameInput: (value: string) => void;
  setMiddleNameInput: (value: string) => void;
  setLastNameInput: (value: string) => void;
  setSecondLastNameInput: (value: string) => void;
  submitLogin: () => void;
  openCreateAccount: () => void;
  backToLogin: () => void;
  submitCreateAccount: () => void;
  openAliasSplash: () => void;
  continueAliasSplash: () => void;
  openCreateAlias: () => void;
  openAddLegalEntityAlias: () => void;
  openManageAliasEntry: (
    entry: import('../../../../domain/simulation/auth.types').AliasResolveEntry,
  ) => void;
  backToAccountsAndAliases: () => void;
  openSelectAccountForAlias: () => void;
  openChangeAccount: () => void;
  selectLinkAccount: (accountId: string) => void;
  confirmLinkAccount: () => void;
  setAliasInput: (value: string) => void;
  setAliasStatus: (value: 'ACTV' | 'INAC') => void;
  submitUpdateAliasStatus: () => void;
  submitCreateAlias: () => void;
  backFromCreateAlias: () => void;
  requestDeleteAlias: () => void;
  finishAliasFlow: () => void;
  backToAliasManagement: () => void;
  backToHome: () => void;
  logout: () => void;
  setTab: (tab: PaymentSimulationState['activeTab']) => void;
  startPayment: () => void;
  setAliasValue: (value: string) => void;
  setDestinationBankCode: (value: string) => void;
  setAmount: (value: string) => void;
  submitAlias: () => void;
  confirmPayment: () => void;
  cancelFlow: () => void;
  goBack: () => void;
  resetPayment: () => void;
  cancelConfirmation: () => void;
};

function SimulationPageBody({
  auth,
  context,
  sessionKey,
  isResolvingAlias,
  canGoBack,
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
  backFromCreateAlias,
  requestDeleteAlias,
  finishAliasFlow,
  backToAliasManagement,
  backToHome,
  logout,
  setTab,
  startPayment,
  setAliasValue,
  setDestinationBankCode,
  setAmount,
  submitAlias,
  confirmPayment,
  cancelFlow,
  goBack,
  resetPayment,
  cancelConfirmation,
}: SimulationPageBodyProps) {
  const tracePort = usePeticionesTracePort();
  const isOnSimulatorHome = isSimulatorHomeScreen(
    auth.step,
    context.activeTab,
    context.step,
  );
  const isAliasManagerActive = isSimfTraceVisibleStep(auth.step);
  const isSimfTracePanelActive =
    !isOnSimulatorHome &&
    (isAliasManagerActive || isPaymentFlowActive(context.step));

  useEffect(() => {
    if (!isOnSimulatorHome || !sessionKey) {
      return;
    }

    tracePort.clearSession(sessionKey);
  }, [isOnSimulatorHome, sessionKey, tracePort]);

  return (
    <div className="simulation-page">
      <div className="simulation-page__peticiones">
        <div className="table-header simulation-page__header">
          <h2 className="section-title">Simulación de Pago</h2>
        </div>
        <PeticionesPanel
          sessionKey={sessionKey}
          isTracePanelActive={isSimfTracePanelActive}
        />
      </div>

      <section
        className="simulation-page__stage"
        aria-label="Dispositivo móvil interactivo"
      >
        <MobileDeviceFrame
          onHomePress={canGoBack ? goBack : undefined}
          showHomeIndicator={canGoBack}
        >
          <PaymentSimulatorScreen
            auth={auth}
            context={context}
            isResolvingAlias={isResolvingAlias}
            onDocumentChange={setDocumentInput}
            onFirstNameChange={setFirstNameInput}
            onMiddleNameChange={setMiddleNameInput}
            onLastNameChange={setLastNameInput}
            onSecondLastNameChange={setSecondLastNameInput}
            onSubmitLogin={submitLogin}
            onOpenCreateAccount={openCreateAccount}
            onBackToLogin={backToLogin}
            onSubmitCreateAccount={submitCreateAccount}
            onManageAlias={openAliasSplash}
            onContinueAliasSplash={continueAliasSplash}
            onAddLegalEntityAlias={openAddLegalEntityAlias}
            onManageAliasEntry={openManageAliasEntry}
            onBackToAccountsAndAliases={backToAccountsAndAliases}
            onOpenCreateAlias={openCreateAlias}
            onSelectAccountForAlias={openSelectAccountForAlias}
            onChangeAccount={openChangeAccount}
            onSelectLinkAccount={selectLinkAccount}
            onConfirmLinkAccount={confirmLinkAccount}
            onAliasInputChange={setAliasInput}
            onAliasStatusChange={setAliasStatus}
            onSubmitAliasStatusUpdate={submitUpdateAliasStatus}
            onSubmitCreateAlias={submitCreateAlias}
            onBackFromCreateAlias={backFromCreateAlias}
            onDeleteAlias={requestDeleteAlias}
            onFinishAliasFlow={finishAliasFlow}
            onBackToAliasManagement={backToAliasManagement}
            onBackToHome={backToHome}
            onLogout={logout}
            onTabChange={setTab}
            onStartPayment={startPayment}
            onAliasChange={setAliasValue}
            onDestinationBankChange={setDestinationBankCode}
            onAmountChange={setAmount}
            onSubmitAlias={submitAlias}
            onConfirmPayment={confirmPayment}
            onCancelFlow={cancelFlow}
            onGoBack={goBack}
            onResetPayment={resetPayment}
            cancelConfirmation={cancelConfirmation}
          />
        </MobileDeviceFrame>
      </section>
    </div>
  );
}

type SimulationPageProps = {
  onNavigate: (page: AppPage) => void;
};

export function SimulationPage({ onNavigate }: SimulationPageProps) {
  const authHooks = useSimulationAuth();
  const {
    auth,
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
    backFromCreateAlias,
    requestDeleteAlias,
    finishAliasFlow,
    backToAliasManagement,
    backToHome,
    logout,
  } = authHooks;

  const sessionKey = auth.session
    ? buildSimfTraceSessionKey(
        auth.session.mappedDocument.documentType,
        auth.session.mappedDocument.documentNumber,
      )
    : (() => {
        const document = parseDocumentInput(auth.documentInput);
        return document
          ? buildSimfTraceSessionKey(document.documentType, document.documentNumber)
          : null;
      })();

  const paymentHooks = usePaymentSimulation(sessionKey);
  const {
    context,
    isResolvingAlias,
    setTab,
    startPayment,
    setAliasValue,
    setDestinationBankCode,
    setAmount,
    submitAlias,
    confirmPayment,
    cancelFlow,
    goBack,
    resetPayment,
    cancelConfirmation,
  } = paymentHooks;

  const isAuthenticated = auth.step === 'authenticated';
  const canGoBack =
    isAuthenticated &&
    isPaymentFlowActive(context.step) &&
    context.step !== 'processing' &&
    context.step !== 'success';

  return (
    <AppShell
      activeItem="simulation"
      onNavigate={onNavigate}
      pageClassName="dashboard-page--simulation"
      mainClassName="dashboard-main--simulation"
    >
      <PeticionesProvider>
        <SimulationPageBody
          auth={auth}
          context={context}
          sessionKey={sessionKey}
          isResolvingAlias={isResolvingAlias}
          canGoBack={canGoBack}
          setDocumentInput={setDocumentInput}
          setFirstNameInput={setFirstNameInput}
          setMiddleNameInput={setMiddleNameInput}
          setLastNameInput={setLastNameInput}
          setSecondLastNameInput={setSecondLastNameInput}
          submitLogin={submitLogin}
          openCreateAccount={openCreateAccount}
          backToLogin={backToLogin}
          submitCreateAccount={submitCreateAccount}
          openAliasSplash={openAliasSplash}
          continueAliasSplash={continueAliasSplash}
          openCreateAlias={openCreateAlias}
          openAddLegalEntityAlias={openAddLegalEntityAlias}
          openManageAliasEntry={openManageAliasEntry}
          backToAccountsAndAliases={backToAccountsAndAliases}
          openSelectAccountForAlias={openSelectAccountForAlias}
          openChangeAccount={openChangeAccount}
          selectLinkAccount={selectLinkAccount}
          confirmLinkAccount={confirmLinkAccount}
          setAliasInput={setAliasInput}
          setAliasStatus={setAliasStatus}
          submitUpdateAliasStatus={submitUpdateAliasStatus}
          submitCreateAlias={submitCreateAlias}
          backFromCreateAlias={backFromCreateAlias}
          requestDeleteAlias={requestDeleteAlias}
          finishAliasFlow={finishAliasFlow}
          backToAliasManagement={backToAliasManagement}
          backToHome={backToHome}
          logout={logout}
          setTab={setTab}
          startPayment={startPayment}
          setAliasValue={setAliasValue}
          setDestinationBankCode={setDestinationBankCode}
          setAmount={setAmount}
          submitAlias={submitAlias}
          confirmPayment={confirmPayment}
          cancelFlow={cancelFlow}
          goBack={goBack}
          resetPayment={resetPayment}
          cancelConfirmation={cancelConfirmation}
        />
      </PeticionesProvider>
    </AppShell>
  );
}
