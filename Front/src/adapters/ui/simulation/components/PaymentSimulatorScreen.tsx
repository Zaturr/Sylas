import type {
  PaymentSimulationContext,
  MobileAppTab,
} from '../../../../domain/simulation';
import type { SimulationAuthState } from '../../../../domain/simulation/auth.types';
import { isPaymentFlowActive } from '../../../../domain/simulation';
import { getSenderPaymentBlockMessage } from '../../../../domain/simulation/paymentEligibility';
import { AliasSplashStep } from './steps/AliasSplashStep';
import { AliasLinkAccountStep } from './steps/AliasLinkAccountStep';
import { AliasCreateSuccessStep } from './steps/AliasCreateSuccessStep';
import { AliasStatusSuccessStep } from './steps/AliasStatusSuccessStep';
import { AliasErrorStep } from './steps/AliasErrorStep';
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
import '../simulation.theme.css';
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
  onContinueAliasSplash: () => void;
  onOpenCreateAlias: () => void;
  onSelectAccountForAlias: () => void;
  onChangeAccount: () => void;
  onSelectLinkAccount: (accountId: string) => void;
  onConfirmLinkAccount: () => void;
  onAliasInputChange: (value: string) => void;
  onAliasStatusChange: (value: 'ACTV' | 'INAC') => void;
  onSubmitAliasStatusUpdate: () => void;
  onSubmitCreateAlias: () => void;
  onDeleteAlias: () => void;
  onFinishAliasFlow: () => void;
  onBackToAliasManagement: () => void;
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

const bottomTabs: Array<{
  id: MobileAppTab | 'alias' | 'menu';
  label: string;
  icon: string;
  enabled: boolean;
}> = [
  { id: 'home', label: 'Inicio', icon: '⌂', enabled: true },
  { id: 'payments', label: 'Pagos', icon: '⇄', enabled: true },
  { id: 'alias', label: 'Alias', icon: '@', enabled: true },
  { id: 'menu', label: 'Menú', icon: '☰', enabled: false },
];

const ALIAS_FLOW_STEPS = new Set([
  'alias-splash',
  'alias-management',
  'alias-link-account',
  'create-alias',
  'alias-create-success',
  'alias-status-success',
  'alias-error',
]);

function resolveScreenTitle(
  auth: SimulationAuthState,
  context: PaymentSimulationContext,
  flowActive: boolean,
): string {
  if (auth.step === 'login') {
    return 'Acceso';
  }
  if (auth.step === 'create-account') {
    return 'Crear cuenta';
  }
  if (auth.step === 'alias-splash') {
    return 'Alias';
  }
  if (
    auth.step === 'alias-management' ||
    auth.step === 'create-alias' ||
    auth.step === 'alias-link-account' ||
    auth.step === 'alias-create-success' ||
    auth.step === 'alias-status-success' ||
    auth.step === 'alias-error'
  ) {
    return 'Alias';
  }
  if (flowActive) {
    switch (context.step) {
      case 'enter-alias':
        return 'Nuevo pago';
      case 'confirm':
        return 'Confirmar';
      case 'processing':
        return 'Procesando';
      case 'success':
        return 'Completado';
      case 'error':
        return 'Error';
      default:
        return 'Pagos';
    }
  }
  return context.activeTab === 'payments' ? 'Pagos' : 'Inicio';
}

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
  onContinueAliasSplash,
  onOpenCreateAlias,
  onSelectAccountForAlias,
  onChangeAccount,
  onSelectLinkAccount,
  onConfirmLinkAccount,
  onAliasInputChange,
  onAliasStatusChange,
  onSubmitAliasStatusUpdate,
  onSubmitCreateAlias,
  onDeleteAlias,
  onFinishAliasFlow,
  onBackToAliasManagement,
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
  const isAliasFlow = ALIAS_FLOW_STEPS.has(auth.step);
  const isAuthenticated =
    auth.session !== null && auth.step !== 'login' && auth.step !== 'create-account';
  const flowActive =
    auth.step === 'authenticated' && isPaymentFlowActive(context.step);
  const showTabs =
    auth.step === 'authenticated' &&
    !flowActive &&
    (context.step === 'idle' || context.step === 'success');

  const isHomeDashboard =
    showTabs && context.activeTab === 'home' && auth.step === 'authenticated';

  const screenTitle = resolveScreenTitle(auth, context, flowActive);

  const showBackButton =
    auth.step === 'create-account' ||
    auth.step === 'alias-splash' ||
    auth.step === 'alias-management' ||
    auth.step === 'create-alias' ||
    auth.step === 'alias-link-account' ||
    auth.step === 'alias-error' ||
    (flowActive && context.step !== 'success' && context.step !== 'processing');

  const handleBack = () => {
    if (auth.step === 'create-account') {
      onBackToLogin();
      return;
    }
    if (auth.step === 'alias-splash') {
      onBackToHome();
      return;
    }
    if (auth.step === 'alias-link-account') {
      if (
        auth.linkAccountMode === 'change' ||
        auth.linkAccountMode === 'before-create-alias' ||
        auth.linkAccountMode === 'select-for-alias'
      ) {
        onBackToAliasManagement();
        return;
      }
      onBackToHome();
      return;
    }
    if (auth.step === 'alias-error') {
      onBackToAliasManagement();
      return;
    }
    if (isAliasFlow) {
      onBackToHome();
      return;
    }
    onGoBack();
  };

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

    if (auth.step === 'alias-splash') {
      return <AliasSplashStep onContinue={onContinueAliasSplash} />;
    }

    if (auth.step === 'alias-link-account' && auth.session) {
      return (
        <AliasLinkAccountStep
          accounts={auth.session.accounts}
          selectedAccountId={auth.selectedAccountId}
          mode={auth.linkAccountMode}
          isSubmitting={auth.isSubmitting}
          onSelectAccount={onSelectLinkAccount}
          onConfirm={onConfirmLinkAccount}
        />
      );
    }

    if (auth.step === 'alias-management' && auth.session) {
      return (
        <AliasManagementStep
          session={auth.session}
          mappedDocument={auth.session.mappedDocument}
          aliasCheck={auth.aliasCheck}
          aliasStatusInput={auth.aliasStatusInput}
          errorMessage={auth.errorMessage}
          isSubmitting={auth.isSubmitting}
          onAliasStatusChange={onAliasStatusChange}
          onSubmitStatusUpdate={onSubmitAliasStatusUpdate}
          onCreateAlias={onOpenCreateAlias}
          onSelectAccountForAlias={onSelectAccountForAlias}
          onChangeAccount={onChangeAccount}
          onDeleteAlias={onDeleteAlias}
        />
      );
    }

    if (auth.step === 'alias-create-success') {
      return (
        <AliasCreateSuccessStep
          aliasValue={auth.lastCreatedAlias ?? auth.session?.alias ?? ''}
          onFinish={onFinishAliasFlow}
        />
      );
    }

    if (auth.step === 'alias-status-success' && auth.session) {
      return (
        <AliasStatusSuccessStep
          aliasValue={auth.session.alias ?? ''}
          status={auth.aliasCheck?.agentStatus ?? null}
          onFinish={onFinishAliasFlow}
        />
      );
    }

    if (auth.step === 'alias-error') {
      return (
        <AliasErrorStep
          message={auth.aliasErrorMessage}
          onRetry={onBackToAliasManagement}
          onFinish={onFinishAliasFlow}
        />
      );
    }

    if (auth.step === 'create-alias' && auth.session) {
      return (
        <CreateAliasStep
          session={auth.session}
          mappedDocument={auth.session.mappedDocument}
          aliasInput={auth.aliasInput}
          errorMessage={auth.errorMessage}
          isSubmitting={auth.isSubmitting}
          onAliasChange={onAliasInputChange}
          onSubmit={onSubmitCreateAlias}
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
        return (
          <PaymentsTabView
            onStartPayment={onStartPayment}
            senderBlockMessage={getSenderPaymentBlockMessage(auth.session)}
          />
        );
      default:
        return (
          <HomeTabView
            session={auth.session}
            onManageAlias={onManageAlias}
            onLogout={onLogout}
          />
        );
    }
  };

  return (
    <div className={`payment-simulator${isHomeDashboard ? ' payment-simulator--home' : ''}`}>
      {!isHomeDashboard && (
        <header className="payment-simulator__header">
          {showBackButton ? (
            <button
              type="button"
              className="payment-simulator__back-btn"
              aria-label="Volver"
              onClick={handleBack}
            >
              ←
            </button>
          ) : (
            <span className="payment-simulator__header-spacer" aria-hidden="true" />
          )}

          <h1 className="payment-simulator__title">{screenTitle}</h1>
          <span className="payment-simulator__header-spacer" aria-hidden="true" />
        </header>
      )}

      <main
        className={`payment-simulator__body${
          isHomeDashboard ? ' payment-simulator__body--home' : ''
        }`}
      >
        {isAliasFlow || !isAuthenticated
          ? renderAuthFlow()
          : auth.step === 'authenticated' && flowActive
            ? renderPaymentFlow()
            : renderTabContent()}
      </main>

      {showTabs && (
        <nav className="payment-simulator__tab-bar" aria-label="Navegación simulada">
          {bottomTabs.map((tab) => {
            const isActive =
              tab.enabled &&
              tab.id === context.activeTab &&
              context.step === 'idle';

            return (
              <button
                key={tab.id}
                type="button"
                className={`payment-simulator__tab ${
                  isActive ? 'payment-simulator__tab--active' : ''
                } ${!tab.enabled ? 'payment-simulator__tab--disabled' : ''}`}
                disabled={!tab.enabled}
                onClick={() => {
                  if (tab.id === 'alias') {
                    onManageAlias();
                    return;
                  }
                  if (tab.enabled && (tab.id === 'home' || tab.id === 'payments')) {
                    onTabChange(tab.id);
                  }
                }}
              >
                <span className="payment-simulator__tab-icon" aria-hidden="true">
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
