import { AppShell } from '../../components/AppShell';
import { MobileDeviceFrame } from '../components/MobileDeviceFrame';
import { PaymentSimulatorScreen } from '../components/PaymentSimulatorScreen';
import { usePaymentSimulation } from '../hooks/usePaymentSimulation';
import { useSimulationAuth } from '../hooks/useSimulationAuth';
import { isPaymentFlowActive } from '../../../../domain/simulation';
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

  return (
    <AppShell
      activeItem="simulation"
      onNavigate={onNavigate}
      pageClassName="dashboard-page--simulation"
      mainClassName="dashboard-main--simulation"
    >
      <div className="simulation-page">
        <div className="simulation-page__left">
          <div className="table-header simulation-page__header">
            <h2 className="section-title">Simulación de Pago</h2>
          </div>

          <aside className="simulation-page__panel">
            <p className="simulation-page__eyebrow">Entorno interactivo</p>
            <h3 className="simulation-page__panel-title">
              Usa el teléfono como si fuera real
            </h3>
            <p className="simulation-page__panel-text">
              Inicia sesión con cédula, consulta o crea tu alias y luego
              navega por el flujo de pagos dentro del dispositivo simulado.
            </p>

            <ul className="simulation-page__checklist">
              <li>Login por cédula con resolve alias</li>
              <li>Gestión de alias con flujo completo</li>
              <li>Flujo de pago con alias destino</li>
            </ul>

            <button
              type="button"
              className="secondary-btn simulation-page__back-btn"
              onClick={() => onNavigate('alias')}
            >
              Volver al panel
            </button>
          </aside>
        </div>

        <section
          className="simulation-page__stage"
          aria-label="Dispositivo móvil interactivo"
        >
          <MobileDeviceFrame onHomePress={canGoBack ? goBack : undefined} showHomeIndicator={canGoBack}>
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
    </AppShell>
  );
}
