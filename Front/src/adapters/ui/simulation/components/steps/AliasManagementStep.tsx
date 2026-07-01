import { isSimfNotFoundReason } from '../../../../../domain/simulation/simf.constants';
import type { AliasCheckResult } from '../../../../../domain/simulation/auth.types';
import {
  USER_MODIFIABLE_ALIAS_STATUSES,
  getUserModifiableAliasStatusLabel,
  isUserModifiableAliasStatus,
  type UserModifiableAliasStatus,
} from '../../../../../domain/simulation/aliasStatus';
import { formatDocumentInput } from '../../../../../domain/simulation';
import type { ParsedDocument } from '../../../../../domain/simulation/documentParser';
import '../simulationSteps.css';

type AliasManagementStepProps = {
  mappedDocument: ParsedDocument;
  aliasCheck: AliasCheckResult | null;
  aliasStatusInput: UserModifiableAliasStatus | '';
  errorMessage: string;
  isSubmitting: boolean;
  onAliasStatusChange: (value: UserModifiableAliasStatus) => void;
  onSubmitStatusUpdate: () => void;
  onCreateAlias: () => void;
  onBack: () => void;
};

export function AliasManagementStep({
  mappedDocument,
  aliasCheck,
  aliasStatusInput,
  errorMessage,
  isSubmitting,
  onAliasStatusChange,
  onSubmitStatusUpdate,
  onCreateAlias,
  onBack,
}: AliasManagementStepProps) {
  const documentLabel = formatDocumentInput(
    mappedDocument.documentType,
    mappedDocument.documentNumber,
  );

  const hasAlias = aliasCheck?.status === 'found';
  const canCreateAlias =
    aliasCheck?.status === 'not-found' &&
    isSimfNotFoundReason(aliasCheck.reason);

  const currentStatus = aliasCheck?.agentStatus ?? null;
  const selectValue: UserModifiableAliasStatus =
    aliasStatusInput || USER_MODIFIABLE_ALIAS_STATUSES[0];

  const currentModifiable =
    currentStatus && isUserModifiableAliasStatus(currentStatus)
      ? currentStatus
      : null;

  const canUpdateStatus = hasAlias && selectValue !== currentModifiable;

  return (
    <div className="sim-flow">
      <div className="sim-flow__intro">
        <h2 className="sim-flow__title">Gestión de alias</h2>
        <p className="sim-flow__subtitle">
          Consulta del alias asociado a la cédula ingresada en el login.
        </p>
      </div>

      <div className="sim-summary-card">
        <div className="sim-summary-card__row">
          <span>Cédula consultada</span>
          <strong>{documentLabel}</strong>
        </div>

        {isSubmitting && (
          <div className="sim-summary-card__row">
            <span>Estado</span>
            <strong>Consultando...</strong>
          </div>
        )}

        {!isSubmitting && hasAlias && (
          <>
            <div className="sim-summary-card__row sim-summary-card__row--highlight">
              <span>Alias activo</span>
              <strong>{aliasCheck.alias}</strong>
            </div>
            <p className="sim-flow__subtitle">{aliasCheck.message}</p>
          </>
        )}

        {!isSubmitting && canCreateAlias && (
          <p className="sim-flow__subtitle">{aliasCheck.message}</p>
        )}
      </div>

      {!isSubmitting && hasAlias && (
        <div className="sim-form">
          <label className="sim-field">
            <span>Estado del alias en el banco</span>
            <select
              className="sim-field__select"
              value={selectValue}
              disabled={isSubmitting}
              onChange={(event) =>
                onAliasStatusChange(event.target.value as UserModifiableAliasStatus)
              }
            >
              {USER_MODIFIABLE_ALIAS_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {getUserModifiableAliasStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {errorMessage && <p className="sim-flow__error">{errorMessage}</p>}

      <div className="sim-flow__actions">
        {!isSubmitting && canUpdateStatus && (
          <button
            type="button"
            className="sim-mobile-btn sim-mobile-btn--primary"
            disabled={isSubmitting}
            onClick={onSubmitStatusUpdate}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar estado'}
          </button>
        )}

        {!isSubmitting && canCreateAlias && (
          <button
            type="button"
            className="sim-mobile-btn sim-mobile-btn--primary"
            onClick={onCreateAlias}
          >
            Crear alias
          </button>
        )}

        <button
          type="button"
          className="sim-mobile-btn sim-mobile-btn--ghost"
          disabled={isSubmitting}
          onClick={onBack}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
