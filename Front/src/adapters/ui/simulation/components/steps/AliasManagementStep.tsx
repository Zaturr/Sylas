import { useState } from 'react';
import { appConfig } from '../../../../../adapters/api/app.config';
import { isSimfNotFoundReason } from '../../../../../domain/simulation/simf.constants';
import type { AliasCheckResult } from '../../../../../domain/simulation/auth.types';
import {
  getAccountDisplayLabel,
  getPrimaryAccount,
} from '../../../../../domain/simulation/aliasFlow';
import type { SimulationSession } from '../../../../../domain/simulation/auth.types';
import {
  USER_MODIFIABLE_ALIAS_STATUSES,
  SIMF_ALIAS_STATUS,
  getUserModifiableAliasStatusLabel,
  isUserModifiableAliasStatus,
  type UserModifiableAliasStatus,
} from '../../../../../domain/simulation/aliasStatus';
import { formatDocumentInput } from '../../../../../domain/simulation';
import type { ParsedDocument } from '../../../../../domain/simulation/documentParser';
import { SimConfirmModal } from '../ui/SimConfirmModal';
import { SimEditableRow } from '../ui/SimEditableRow';
import { SimSegmentControl } from '../ui/SimSegmentControl';
import { SimStatusBadge } from '../ui/SimStatusBadge';
import '../simulationSteps.css';

type AliasManagementStepProps = {
  session: SimulationSession;
  mappedDocument: ParsedDocument;
  aliasCheck: AliasCheckResult | null;
  aliasStatusInput: UserModifiableAliasStatus | '';
  errorMessage: string;
  isSubmitting: boolean;
  onAliasStatusChange: (value: UserModifiableAliasStatus) => void;
  onSubmitStatusUpdate: () => void;
  onCreateAlias: () => void;
  onSelectAccountForAlias: () => void;
  onChangeAccount: () => void;
  onDeleteAlias: () => void;
};

export function AliasManagementStep({
  session,
  mappedDocument,
  aliasCheck,
  aliasStatusInput,
  errorMessage,
  isSubmitting,
  onAliasStatusChange,
  onSubmitStatusUpdate,
  onCreateAlias,
  onSelectAccountForAlias,
  onChangeAccount,
  onDeleteAlias,
}: AliasManagementStepProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const documentLabel = formatDocumentInput(
    mappedDocument.documentType,
    mappedDocument.documentNumber,
  );

  const hasAlias = aliasCheck?.status === 'found';
  const canCreateAlias =
    aliasCheck?.status === 'not-found' &&
    isSimfNotFoundReason(aliasCheck.reason);

  const currentStatus = aliasCheck?.agentStatus ?? null;
  const isBlocked = currentStatus === SIMF_ALIAS_STATUS.BLOCKED;
  const selectValue: UserModifiableAliasStatus =
    aliasStatusInput || USER_MODIFIABLE_ALIAS_STATUSES[0];

  const currentModifiable =
    currentStatus && isUserModifiableAliasStatus(currentStatus)
      ? currentStatus
      : null;

  const canUpdateStatus = hasAlias && !isBlocked && selectValue !== currentModifiable;
  const primaryAccount = getPrimaryAccount(session);

  const statusOptions = USER_MODIFIABLE_ALIAS_STATUSES.map((status) => ({
    value: status,
    label: getUserModifiableAliasStatusLabel(status),
  }));

  const handleConfirmStatus = () => {
    setConfirmOpen(false);
    onSubmitStatusUpdate();
  };

  const handleConfirmDelete = () => {
    setDeleteConfirmOpen(false);
    onDeleteAlias();
  };

  return (
    <div className="sim-flow">
      {isSubmitting && !aliasCheck && (
        <div className="sim-card">
          <p className="sim-card__subtitle">Consultando alias...</p>
        </div>
      )}

      {!isSubmitting && hasAlias && aliasCheck.alias && (
        <div className="sim-card">
          <div className="sim-card__header">
            <div>
              <p className="sim-card__title">Tu alias</p>
              <p className="sim-card__alias">{aliasCheck.alias}</p>
            </div>
            <SimStatusBadge status={currentStatus} />
          </div>
          <div className="sim-card__row">
            <span>Cédula</span>
            <strong>{documentLabel}</strong>
          </div>
          {primaryAccount && !isBlocked && (
            <SimEditableRow
              label="Cuenta vinculada"
              value={getAccountDisplayLabel(primaryAccount)}
              onEdit={onChangeAccount}
            />
          )}
          {primaryAccount && isBlocked && (
            <div className="sim-card__row">
              <span>Cuenta vinculada</span>
              <strong>{getAccountDisplayLabel(primaryAccount)}</strong>
            </div>
          )}
          {isBlocked && (
            <p className="sim-card__subtitle">
              Este alias fue bloqueado (BLKD). No se elimina del sistema; la baja es global BDCA.
            </p>
          )}
        </div>
      )}

      {!isSubmitting && canCreateAlias && (
        <div className="sim-card">
          <p className="sim-card__title">Sin alias registrado</p>
          <p className="sim-card__subtitle">{aliasCheck?.message}</p>
          <div className="sim-card__row">
            <span>Cédula</span>
            <strong>{documentLabel}</strong>
          </div>
          {primaryAccount ? (
            <SimEditableRow
              label="Cuenta a vincular"
              value={getAccountDisplayLabel(primaryAccount)}
              onEdit={onSelectAccountForAlias}
            />
          ) : (
            <p className="sim-card__subtitle">
              No hay cuenta del banco {appConfig.simulation.bankCode}. Inicia sesión de nuevo para
              registrarla.
            </p>
          )}
        </div>
      )}

      {!isSubmitting && hasAlias && !isBlocked && (
        <div className="sim-card">
          <p className="sim-card__title">Modificar estado</p>
          <p className="sim-card__subtitle">Selecciona el estado del vínculo con el banco.</p>
          <SimSegmentControl
            options={statusOptions}
            value={selectValue}
            disabled={isSubmitting}
            onChange={onAliasStatusChange}
          />
        </div>
      )}

      {errorMessage && <p className="sim-flow__error">{errorMessage}</p>}

      <div className="sim-flow__actions">
        {!isSubmitting && canUpdateStatus && (
          <button
            type="button"
            className="sim-mobile-btn sim-mobile-btn--primary"
            disabled={isSubmitting}
            onClick={() => setConfirmOpen(true)}
          >
            Continuar
          </button>
        )}

        {!isSubmitting && canCreateAlias && (
          <button
            type="button"
            className="sim-mobile-btn sim-mobile-btn--primary"
            disabled={!primaryAccount}
            onClick={onCreateAlias}
          >
            Crear alias
          </button>
        )}

        {!isSubmitting && hasAlias && !isBlocked && (
          <button
            type="button"
            className="sim-mobile-btn sim-mobile-btn--ghost sim-mobile-btn--danger-text"
            onClick={() => setDeleteConfirmOpen(true)}
          >
            Bloquear alias (BLKD)
          </button>
        )}
      </div>

      <SimConfirmModal
        open={confirmOpen}
        title="Confirmar cambio"
        message={`¿Deseas cambiar el estado del alias a ${getUserModifiableAliasStatusLabel(selectValue)}?`}
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        isSubmitting={isSubmitting}
        onConfirm={handleConfirmStatus}
        onCancel={() => setConfirmOpen(false)}
      />

      <SimConfirmModal
        open={deleteConfirmOpen}
        title="Bloquear alias"
        message="¿Confirmas el bloqueo global del alias (BLKD)? No se eliminará del sistema; se registrará la baja vía BDCA."
        confirmLabel="Bloquear"
        cancelLabel="Cancelar"
        isSubmitting={isSubmitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}

