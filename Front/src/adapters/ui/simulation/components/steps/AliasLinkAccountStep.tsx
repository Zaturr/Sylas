import type { Account } from '../../../../../domain/account';
import type { AliasLinkAccountMode } from '../../../../../domain/simulation/auth.types';
import { SimAccountPicker } from '../ui/SimAccountPicker';
import '../simulationSteps.css';

type AliasLinkAccountStepProps = {
  accounts: Account[];
  selectedAccountId: string | null;
  mode: AliasLinkAccountMode;
  isSubmitting: boolean;
  onSelectAccount: (accountId: string) => void;
  onConfirm: () => void;
};

export function AliasLinkAccountStep({
  accounts,
  selectedAccountId,
  mode,
  isSubmitting,
  onSelectAccount,
  onConfirm,
}: AliasLinkAccountStepProps) {
  const title =
    mode === 'change'
      ? 'Cambiar cuenta vinculada'
      : mode === 'before-create-alias'
        ? 'Cuenta para tu alias'
        : 'Vincular cuenta';

  const subtitle =
    mode === 'change'
      ? 'Selecciona la cuenta que quedará asociada a tu alias.'
      : mode === 'before-create-alias'
        ? 'Elige la cuenta del banco que quedará asociada al alias que vas a crear.'
        : mode === 'select-for-alias'
          ? 'Selecciona la cuenta que usarás al registrar tu alias.'
          : 'Tu alias necesita una cuenta del banco para completar la afiliación.';

  return (
    <div className="sim-flow">
      <div className="sim-card">
        <p className="sim-card__title">{title}</p>
        <p className="sim-card__subtitle">{subtitle}</p>
        <SimAccountPicker
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          disabled={isSubmitting}
          onSelect={onSelectAccount}
        />
      </div>

      <div className="sim-flow__actions">
        <button
          type="button"
          className="sim-mobile-btn sim-mobile-btn--primary"
          disabled={!selectedAccountId || isSubmitting}
          onClick={onConfirm}
        >
          {isSubmitting ? 'Vinculando...' : mode === 'before-create-alias' ? 'Continuar al alias' : 'Continuar'}
        </button>
      </div>
    </div>
  );
}
