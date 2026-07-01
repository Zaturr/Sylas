import type { Account } from '../../../../../domain/account';
import { appConfig } from '../../../../../adapters/api/app.config';
import {
  filterAccountsByBankCode,
  getAccountDisplayLabel,
} from '../../../../../domain/simulation/aliasFlow';
import '../simulationSteps.css';

type SimAccountPickerProps = {
  accounts: Account[];
  selectedAccountId: string | null;
  disabled?: boolean;
  onSelect: (accountId: string) => void;
};

export function SimAccountPicker({
  accounts,
  selectedAccountId,
  disabled = false,
  onSelect,
}: SimAccountPickerProps) {
  const visibleAccounts = filterAccountsByBankCode(
    accounts,
    appConfig.simulation.bankCode,
  );

  if (visibleAccounts.length === 0) {
    return (
      <div className="sim-empty-state">
        <p className="sim-empty-state__title">Sin cuentas disponibles</p>
        <p className="sim-empty-state__text">
          No hay cuentas del banco {appConfig.simulation.bankCode} para vincular con tu alias.
        </p>
      </div>
    );
  }

  return (
    <div className="sim-account-list" role="listbox" aria-label="Cuentas disponibles">
      {visibleAccounts.map((account) => {
        const isSelected = account.id === selectedAccountId;

        return (
          <button
            key={account.id}
            type="button"
            role="option"
            aria-selected={isSelected}
            className={`sim-account-option ${isSelected ? 'sim-account-option--selected' : ''}`}
            disabled={disabled}
            onClick={() => onSelect(account.id)}
          >
            <span className="sim-account-option__bank">{account.bank_id}</span>
            <span className="sim-account-option__number">
              {getAccountDisplayLabel(account)}
            </span>
            <span className="sim-account-option__type">{account.account_type}</span>
            {isSelected && <span className="sim-account-option__check" aria-hidden="true">✓</span>}
          </button>
        );
      })}
    </div>
  );
}
