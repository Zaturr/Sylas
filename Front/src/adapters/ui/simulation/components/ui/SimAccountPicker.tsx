import type { Account } from '../../../../../domain/account';
import type { AliasResolveEntry } from '../../../../../domain/simulation/auth.types';
import { appConfig } from '../../../../../adapters/api/app.config';
import {
  filterAccountsByBankCode,
  getAccountDisplayLabel,
} from '../../../../../domain/simulation/aliasFlow';
import { formatRegistrationAccountType } from '../../../../../domain/simulation/legalEntityAliasMatrix';
import { hasConfiguredAliasValue } from '../../../../../domain/simulation/auth.types';
import '../simulationSteps.css';

type SimAccountPickerProps = {
  accounts: Account[];
  selectedAccountId: string | null;
  disabled?: boolean;
  registeredAliases?: AliasResolveEntry[];
  onSelect: (accountId: string) => void;
};

function getLinkedAliasValue(
  accountId: string,
  registeredAliases: AliasResolveEntry[],
): string | null {
  const entry = registeredAliases.find(
    (alias) => alias.account_id?.trim() === accountId && hasConfiguredAliasValue(alias.alias_value),
  );

  return entry?.alias_value?.trim() || null;
}

export function SimAccountPicker({
  accounts,
  selectedAccountId,
  disabled = false,
  registeredAliases = [],
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
        const isDolares = account.account_type?.toLowerCase() === 'dolares';
        const linkedAlias = getLinkedAliasValue(account.id, registeredAliases);
        const isUnavailable = isDolares || linkedAlias !== null;

        return (
          <div key={account.id} className="sim-account-option-wrapper">
            <button
              type="button"
              role="option"
              aria-selected={isSelected}
              className={`sim-account-option ${isSelected ? 'sim-account-option--selected' : ''} ${isUnavailable ? 'sim-account-option--disabled' : ''}`}
              disabled={disabled || isUnavailable}
              onClick={() => {
                if (!isUnavailable) {
                  onSelect(account.id);
                }
              }}
            >
              <span className="sim-account-option__bank">{account.bank_id}</span>
              <span className="sim-account-option__number">
                {getAccountDisplayLabel(account)}
              </span>
              <span className="sim-account-option__type">
                {formatRegistrationAccountType(account.account_type)}
              </span>
              {isSelected && <span className="sim-account-option__check" aria-hidden="true">✓</span>}
            </button>
            {isDolares && (
              <p className="sim-account-option__warning" style={{ fontSize: '0.75rem', color: '#d32f2f', marginTop: '4px', marginBottom: '8px', paddingLeft: '8px' }}>
                Las cuentas en moneda extranjera no permiten asociación a alias.
              </p>
            )}
            {!isDolares && linkedAlias && (
              <p className="sim-account-option__warning" style={{ fontSize: '0.75rem', color: '#d32f2f', marginTop: '4px', marginBottom: '8px', paddingLeft: '8px' }}>
                Cuenta ya asociada al alias {linkedAlias}.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
