import { formatDocumentInput, ALIAS_FORMAT_ERROR_MESSAGE } from '../../../../../domain/simulation';
import { getAccountDisplayLabel, getPrimaryAccount } from '../../../../../domain/simulation/aliasFlow';
import type { ParsedDocument } from '../../../../../domain/simulation/documentParser';
import type { SimulationSession } from '../../../../../domain/simulation/auth.types';
import '../simulationSteps.css';

type CreateAliasStepProps = {
  session: SimulationSession;
  mappedDocument: ParsedDocument;
  aliasInput: string;
  errorMessage: string;
  isSubmitting: boolean;
  onAliasChange: (value: string) => void;
  onSubmit: () => void;
};

export function CreateAliasStep({
  session,
  mappedDocument,
  aliasInput,
  errorMessage,
  isSubmitting,
  onAliasChange,
  onSubmit,
}: CreateAliasStepProps) {
  const documentLabel = formatDocumentInput(
    mappedDocument.documentType,
    mappedDocument.documentNumber,
  );
  const primaryAccount = getPrimaryAccount(session);

  return (
    <div className="sim-flow">
      <div className="sim-card">
        <p className="sim-card__title">Registrar alias</p>
        <p className="sim-card__subtitle">Cédula {documentLabel}</p>
        {primaryAccount && (
          <div className="sim-card__row">
            <span>Cuenta vinculada</span>
            <strong>{getAccountDisplayLabel(primaryAccount)}</strong>
          </div>
        )}

        <div className="sim-form" style={{ marginTop: 14 }}>
          <label className="sim-field">
            <span>Alias</span>
            <input
              type="text"
              inputMode="text"
              autoComplete="off"
              disabled={isSubmitting}
              placeholder="ej. juan.perez123"
              value={aliasInput}
              onChange={(event) => onAliasChange(event.target.value)}
            />
          </label>
          <p className="sim-field__hint">{ALIAS_FORMAT_ERROR_MESSAGE}</p>
        </div>
      </div>

      {errorMessage && <p className="sim-flow__error">{errorMessage}</p>}

      <div className="sim-flow__actions">
        <button
          type="button"
          className="sim-mobile-btn sim-mobile-btn--primary"
          disabled={isSubmitting}
          onClick={onSubmit}
        >
          {isSubmitting ? 'Registrando alias...' : 'Continuar'}
        </button>
      </div>
    </div>
  );
}
