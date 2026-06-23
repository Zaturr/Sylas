import { AppShell } from '../../components/AppShell';
import { MobileDeviceFrame } from '../../components/simulation/MobileDeviceFrame';
import { PaymentSimulatorScreen } from '../../components/simulation/PaymentSimulatorScreen';
import { usePaymentSimulation } from '../../hooks/usePaymentSimulation';
import { isPaymentFlowActive } from '../../../../domain/simulation';
import type { AppPage } from '../../navigation';
import '../forms.css';
import './simulationPage.css';

type SimulationPageProps = {
  onNavigate: (page: AppPage) => void;
};

export function SimulationPage({ onNavigate }: SimulationPageProps) {
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

  const canGoBack =
    isPaymentFlowActive(context.step) &&
    context.step !== 'processing' &&
    context.step !== 'success';

  return (
    <AppShell activeItem="simulation" onNavigate={onNavigate}>
      <div className="simulation-page">
        <div className="table-header">
          <h2 className="section-title">Simulación de Pago</h2>
        </div>

        <div className="simulation-page__layout">
          <aside className="simulation-page__panel">
            <p className="simulation-page__eyebrow">Entorno interactivo</p>
            <h3 className="simulation-page__panel-title">
              Usa el teléfono como si fuera real
            </h3>
            <p className="simulation-page__panel-text">
              Navega por las pestañas, inicia un pago con alias, confirma la operación
              y observa el resultado dentro del dispositivo simulado.
            </p>

            <ul className="simulation-page__checklist">
              <li>Pestañas Inicio, Pagos</li>
              <li>Validación del alias contra la base de datos</li>
              <li>Flujo completo: alias → confirmación → éxito</li>
            </ul>

            <button
              type="button"
              className="secondary-btn simulation-page__back-btn"
              onClick={() => onNavigate('alias')}
            >
              Volver al panel
            </button>
          </aside>

          <section
            className="simulation-page__stage"
            aria-label="Dispositivo móvil interactivo"
          >
            <MobileDeviceFrame onHomePress={canGoBack ? goBack : undefined} showHomeIndicator={canGoBack}>
              <PaymentSimulatorScreen
                context={context}
                isResolvingAlias={isResolvingAlias}
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
      </div>
    </AppShell>
  );
}
