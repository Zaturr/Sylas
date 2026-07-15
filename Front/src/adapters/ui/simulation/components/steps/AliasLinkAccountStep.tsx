import type { AliasLinkAccountMode } from '../../../../../domain/simulation/auth.types';
import type { SimulationSession } from '../../../../../domain/simulation/auth.types';
import { SimAccountPicker } from '../ui/SimAccountPicker';
import '../simulationSteps.css';

type AliasLinkAccountStepProps = {
  session: SimulationSession;
  selectedAccountId: string | null;
  mode: AliasLinkAccountMode;
  isSubmitting: boolean;
  errorMessage?: string;
  onSelectAccount: (accountId: string) => void;
  onConfirm: () => void;
};

export function AliasLinkAccountStep({
  session,
  selectedAccountId,
  mode,
  isSubmitting,
  errorMessage = '',
  onSelectAccount,
  onConfirm,
}: AliasLinkAccountStepProps) {
  const isLegalEntity = session.isLegalEntity;
  const title =
    mode === 'change'
      ? 'Cambiar cuenta vinculada'
      : mode === 'before-create-alias'
        ? isLegalEntity
          ? 'Seleccionar cuenta para el alias'
          : 'Cuenta para tu alias'
        : 'Vincular cuenta';

  const subtitle =
    mode === 'change'
      ? 'Selecciona la cuenta que quedará asociada a tu alias.'
      : mode === 'before-create-alias'
        ? isLegalEntity
          ? 'Elige una cuenta disponible sin alias. Las cuentas ya asociadas aparecen bloqueadas.'
          : 'Elige la cuenta del banco que quedará asociada al alias que vas a crear.'
        : mode === 'select-for-alias'
          ? 'Selecciona la cuenta que usarás al registrar tu alias.'
          : 'Tu alias necesita una cuenta del banco para completar la afiliación.';

  const selectedAccount = session.accounts.find((account) => account.id === selectedAccountId);
  const isSelectedAccountDolares = selectedAccount?.account_type?.toLowerCase() === 'dolares';
  const selectedHasAlias = isLegalEntity && selectedAccountId
    ? session.registeredAliases.some(
        (entry) => entry.account_id?.trim() === selectedAccountId,
      )
    : false;

  return (
    <div className="sim-flow">
      <div className="sim-card">
        <p className="sim-card__title">{title}</p>
        <p className="sim-card__subtitle">{subtitle}</p>
        <SimAccountPicker
          accounts={session.accounts}
          selectedAccountId={selectedAccountId}
          registeredAliases={isLegalEntity ? session.registeredAliases : []}
          disabled={isSubmitting}
          onSelect={onSelectAccount}
        />
      </div>

      {errorMessage && <p className="sim-flow__error">{errorMessage}</p>}

      <div className="sim-flow__actions">
        <button
          type="button"
          className="sim-mobile-btn sim-mobile-btn--primary"
          disabled={
            !selectedAccountId ||
            isSubmitting ||
            isSelectedAccountDolares ||
            selectedHasAlias
          }
          onClick={onConfirm}
        >
          {isSubmitting ? 'Vinculando...' : mode === 'before-create-alias' ? 'Continuar al alias' : 'Continuar'}
        </button>
      </div>
    </div>
  );
}
