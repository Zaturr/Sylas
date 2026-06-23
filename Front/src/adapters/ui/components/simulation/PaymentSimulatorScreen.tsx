import type { MobileAppTab, PaymentSimulationContext } from '../../../../domain/simulation';
import { isPaymentFlowActive } from '../../../../domain/simulation';
import { ConfirmPaymentStep } from './steps/ConfirmPaymentStep';
import { EnterAliasStep } from './steps/EnterAliasStep';
import { ErrorStep } from './steps/ErrorStep';
import { ProcessingStep } from './steps/ProcessingStep';
import { SuccessStep } from './steps/SuccessStep';
import { HomeTabView } from './views/HomeTabView';
import { PaymentsTabView } from './views/PaymentsTabView';
import './PaymentSimulatorScreen.css';
import './simulationSteps.css';

type PaymentSimulatorScreenProps = {
  context: PaymentSimulationContext;
  isResolvingAlias: boolean;
  onTabChange: (tab: MobileAppTab) => void;
  onStartPayment: () => void;
  onAliasChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onSubmitAlias: () => void;
  onConfirmPayment: () => void;
  onCancelFlow: () => void;
  onGoBack: () => void;
  onResetPayment: () => void;
};

const tabLabels: Record<MobileAppTab, string> = {
  home: 'Inicio',
  payments: 'Pagos',
};

export function PaymentSimulatorScreen({
  context,
  isResolvingAlias,
  onTabChange,
  onStartPayment,
  onAliasChange,
  onAmountChange,
  onSubmitAlias,
  onConfirmPayment,
  onCancelFlow,
  onGoBack,
  onResetPayment,
}: PaymentSimulatorScreenProps) {
  const flowActive = isPaymentFlowActive(context.step);
  const showTabs = !flowActive || context.step === 'success';

  const renderFlow = () => {
    switch (context.step) {
      case 'enter-alias':
        return (
          <EnterAliasStep
            aliasValue={context.aliasValue}
            amount={context.amount}
            errorMessage={context.errorMessage}
            isSubmitting={isResolvingAlias}
            onAliasChange={onAliasChange}
            onAmountChange={onAmountChange}
            onSubmit={onSubmitAlias}
            onCancel={onCancelFlow}
          />
        );
      case 'confirm':
        if (!context.recipient) {
          return null;
        }

        return (
          <ConfirmPaymentStep
            amount={context.amount}
            recipient={context.recipient}
            onConfirm={onConfirmPayment}
            onCancel={onGoBack}
          />
        );
      case 'processing':
        if (!context.recipient) {
          return null;
        }

        return <ProcessingStep recipient={context.recipient} />;
      case 'success':
        if (!context.recipient) {
          return null;
        }

        return (
          <SuccessStep
            amount={context.amount}
            recipient={context.recipient}
            onNewPayment={onResetPayment}
          />
        );
      case 'error':
        return (
          <ErrorStep
            message={context.errorMessage}
            onRetry={onGoBack}
            onCancel={onCancelFlow}
          />
        );
      default:
        return null;
    }
  };

  const renderTabContent = () => {
    switch (context.activeTab) {
      case 'payments':
        return <PaymentsTabView onStartPayment={onStartPayment} />;
      default:
        return <HomeTabView onStartPayment={onStartPayment} />;
    }
  };

  return (
    <div className="payment-simulator">
      <header className="payment-simulator__header">
        {flowActive && context.step !== 'success' && context.step !== 'processing' ? (
          <button
            type="button"
            className="payment-simulator__back-btn"
            aria-label="Volver"
            onClick={onGoBack}
          >
            ←
          </button>
        ) : (
          <div className="payment-simulator__back-spacer" aria-hidden="true" />
        )}

        <div className="payment-simulator__brand">
          <span className="payment-simulator__brand-icon">B</span>
          <div>
            <p className="payment-simulator__brand-name">BDSA Pay</p>
            <p className="payment-simulator__brand-tagline">
              {flowActive ? 'Flujo de pago' : tabLabels[context.activeTab]}
            </p>
          </div>
        </div>
      </header>

      <main className="payment-simulator__body">
        {flowActive ? renderFlow() : renderTabContent()}
      </main>

      {showTabs && (
        <nav className="payment-simulator__tab-bar" aria-label="Navegación simulada">
          {(Object.keys(tabLabels) as MobileAppTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`payment-simulator__tab ${
                context.activeTab === tab && context.step === 'idle'
                  ? 'payment-simulator__tab--active'
                  : ''
              }`}
              onClick={() => onTabChange(tab)}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
