import { buildSimfTraceSessionKey } from '../../../../domain/peticiones';
import { isPaymentFlowActive, parseDocumentInput } from '../../../../domain/simulation';
import { AppShell } from '../../components/AppShell';
import { PeticionesPanel, PeticionesProvider } from '../../peticiones';
import { MobileDeviceFrame } from '../components/MobileDeviceFrame';
import { PaymentSimulatorScreen } from '../components/PaymentSimulatorScreen';
import { usePaymentSimulation } from '../hooks/usePaymentSimulation';
import { useSimulationAuth } from '../hooks/useSimulationAuth';
import type { AppPage } from '../../navigation';
import '../../pages/forms.css';
import '../simulation-layout.css';
import './simulationPage.css';

type SimulationPageProps = {
  onNavigate: (page: AppPage) => void;
};

export function SimulationPage({ onNavigate }: SimulationPageProps) {
  const {
    auth,
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
  } = useSimulationAuth();

  const {
    context,
    isResolvingAlias,
    setTab,
    startPayment,
    setAliasValue,
    setAmount,
    submitAlias,
    confirmPayment,
    cancelFlow,
    goBack,
    resetPayment,
  } = usePaymentSimulation();

  const isAuthenticated = auth.step === 'authenticated';
  const canGoBack =
    isAuthenticated &&
    isPaymentFlowActive(context.step) &&
    context.step !== 'processing' &&
    context.step !== 'success';

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

  return (
    <AppShell
      activeItem="simulation"
      onNavigate={onNavigate}
      pageClassName="dashboard-page--simulation"
      mainClassName="dashboard-main--simulation"
    >
      <PeticionesProvider>
        <div className="simulation-page">
          <div className="simulation-page__peticiones">
            <div className="table-header simulation-page__header">
              <h2 className="section-title">Simulación de Pago</h2>
            </div>
            <PeticionesPanel sessionKey={sessionKey} />
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
                onLastNameChange={setLastNameInput}
                onSubmitLogin={submitLogin}
                onOpenCreateAccount={openCreateAccount}
                onBackToLogin={backToLogin}
                onSubmitCreateAccount={submitCreateAccount}
                onManageAlias={openAliasSplash}
                onContinueAliasSplash={continueAliasSplash}
                onOpenCreateAlias={openCreateAlias}
                onSelectAccountForAlias={openSelectAccountForAlias}
                onChangeAccount={openChangeAccount}
                onSelectLinkAccount={selectLinkAccount}
                onConfirmLinkAccount={confirmLinkAccount}
                onAliasInputChange={setAliasInput}
                onAliasStatusChange={setAliasStatus}
                onSubmitAliasStatusUpdate={submitUpdateAliasStatus}
                onSubmitCreateAlias={submitCreateAlias}
                onDeleteAlias={requestDeleteAlias}
                onFinishAliasFlow={finishAliasFlow}
                onBackToAliasManagement={backToAliasManagement}
                onBackToHome={backToHome}
                onLogout={logout}
                onTabChange={setTab}
                onStartPayment={startPayment}
                onAliasChange={setAliasValue}
                onAmountChange={setAmount}
                onSubmitAlias={submitAlias}
                onConfirmPayment={confirmPayment}
                onCancelFlow={cancelFlow}
                onGoBack={goBack}
                onResetPayment={resetPayment}
              />
            </MobileDeviceFrame>
          </section>
        </div>
      </PeticionesProvider>
    </AppShell>
  );
}
