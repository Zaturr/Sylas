import type {
  PaymentSimulationContext,
  MobileAppTab,
} from '../../../../domain/simulation';
import type { SimulationAuthState } from '../../../../domain/simulation/auth.types';
import { isPaymentFlowActive } from '../../../../domain/simulation';
import { AliasManagementStep } from './steps/AliasManagementStep';
import { ConfirmPaymentStep } from './steps/ConfirmPaymentStep';
import { CreateAccountStep } from './steps/CreateAccountStep';
import { CreateAliasStep } from './steps/CreateAliasStep';
import { EnterAliasStep } from './steps/EnterAliasStep';
import { ErrorStep } from './steps/ErrorStep';
import { LoginStep } from './steps/LoginStep';
import { ProcessingStep } from './steps/ProcessingStep';
import { SuccessStep } from './steps/SuccessStep';
import { HomeTabView } from './views/HomeTabView';
import { PaymentsTabView } from './views/PaymentsTabView';
import './PaymentSimulatorScreen.css';
import './simulationSteps.css';

type PaymentSimulatorScreenProps = {
  auth: SimulationAuthState;
  context: PaymentSimulationContext;
  isResolvingAlias: boolean;
  onDocumentChange: (value: string) => void;
  onSubmitLogin: () => void;
  onOpenCreateAccount: () => void;
  onBackToLogin: () => void;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onSubmitCreateAccount: () => void;
  onManageAlias: () => void;
  onOpenCreateAlias: () => void;
  onAliasInputChange: (value: string) => void;
  onAliasStatusChange: (value: 'ACTV' | 'INAC') => void;
  onSubmitAliasStatusUpdate: () => void;
  onSubmitCreateAlias: () => void;
  onBackToHome: () => void;
  onLogout: () => void;
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
  auth,
  context,
  isResolvingAlias,
  onDocumentChange,
  onSubmitLogin,
  onOpenCreateAccount,
  onBackToLogin,
  onFirstNameChange,
  onLastNameChange,
  onSubmitCreateAccount,
  onManageAlias,
  onOpenCreateAlias,
  onAliasInputChange,
  onAliasStatusChange,
  onSubmitAliasStatusUpdate,
  onSubmitCreateAlias,
  onBackToHome,
  onLogout,
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
  const isAuthenticated = auth.step === 'authenticated' && auth.session !== null;
  const isAliasFlow = auth.step === 'alias-management' || auth.step === 'create-alias';
  const flowActive = isAuthenticated && isPaymentFlowActive(context.step);
  const showTabs = isAuthenticated && !isAliasFlow && (!flowActive || context.step === 'success');

  const renderAuthFlow = () => {
    if (auth.step === 'create-account') {
      return (
        <CreateAccountStep
          documentInput={auth.documentInput}
          firstNameInput={auth.firstNameInput}
          lastNameInput={auth.lastNameInput}
          errorMessage={auth.errorMessage}
          isSubmitting={auth.isSubmitting}
          onDocumentChange={onDocumentChange}
          onFirstNameChange={onFirstNameChange}
          onLastNameChange={onLastNameChange}
          onSubmit={onSubmitCreateAccount}
          onBack={onBackToLogin}
        />
      );
    }

    if (auth.step === 'alias-management' && auth.session) {
      return (
        <AliasManagementStep
          mappedDocument={auth.session.mappedDocument}
          aliasCheck={auth.aliasCheck}
          aliasStatusInput={auth.aliasStatusInput}
          errorMessage={auth.errorMessage}
          isSubmitting={auth.isSubmitting}
          onAliasStatusChange={onAliasStatusChange}
          onSubmitStatusUpdate={onSubmitAliasStatusUpdate}
          onCreateAlias={onOpenCreateAlias}
          onBack={onBackToHome}
        />
      );
    }

    if (auth.step === 'create-alias' && auth.session) {
      return (
        <CreateAliasStep
          mappedDocument={auth.session.mappedDocument}
          aliasInput={auth.aliasInput}
          errorMessage={auth.errorMessage}
          isSubmitting={auth.isSubmitting}
          onAliasChange={onAliasInputChange}
          onSubmit={onSubmitCreateAlias}
          onBack={onBackToHome}
        />
      );
    }

    return (
      <LoginStep
        documentInput={auth.documentInput}
        errorMessage={auth.errorMessage}
        isSubmitting={auth.isSubmitting}
        canCreateAccount={auth.canCreateAccount}
        onDocumentChange={onDocumentChange}
        onSubmit={onSubmitLogin}
        onCreateAccount={onOpenCreateAccount}
      />
    );
  };

  const renderPaymentFlow = () => {
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
    if (!auth.session) {
      return null;
    }

    switch (context.activeTab) {
      case 'payments':
        return <PaymentsTabView onStartPayment={onStartPayment} />;
      default:
        return (
          <HomeTabView
            session={auth.session}
            onStartPayment={onStartPayment}
            onManageAlias={onManageAlias}
            onLogout={onLogout}
          />
        );
    }
  };

  const brandTagline = !isAuthenticated && !isAliasFlow
    ? 'Acceso seguro'
    : auth.step === 'alias-management'
      ? 'Gestión de alias'
      : auth.step === 'create-alias'
        ? 'Crear alias'
        : flowActive
          ? 'Flujo de pago'
          : tabLabels[context.activeTab];

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
            <p className="payment-simulator__brand-tagline">{brandTagline}</p>
          </div>
        </div>
      </header>

      <main className="payment-simulator__body">
        {!isAuthenticated || isAliasFlow
          ? renderAuthFlow()
          : flowActive
            ? renderPaymentFlow()
            : renderTabContent()}
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
