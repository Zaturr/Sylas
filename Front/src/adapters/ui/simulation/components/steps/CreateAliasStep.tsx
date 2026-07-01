import { formatDocumentInput, ALIAS_FORMAT_ERROR_MESSAGE } from '../../../../../domain/simulation';
import type { ParsedDocument } from '../../../../../domain/simulation/documentParser';
import '../simulationSteps.css';

type CreateAliasStepProps = {
  mappedDocument: ParsedDocument;
  aliasInput: string;
  errorMessage: string;
  isSubmitting: boolean;
  onAliasChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export function CreateAliasStep({
  mappedDocument,
  aliasInput,
  errorMessage,
  isSubmitting,
  onAliasChange,
  onSubmit,
  onBack,
}: CreateAliasStepProps) {
  const documentLabel = formatDocumentInput(
    mappedDocument.documentType,
    mappedDocument.documentNumber,
  );

  return (
    <div className="sim-flow">
      <div className="sim-flow__intro">
        <h2 className="sim-flow__title">Crear alias</h2>
        <p className="sim-flow__subtitle">
          Registra el alias para la cédula {documentLabel}.
        </p>
      </div>

      <div className="sim-form">
        <label className="sim-field">
          <span>Nuevo alias</span>
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

      {errorMessage && <p className="sim-flow__error">{errorMessage}</p>}

      <div className="sim-flow__actions">
        <button
          type="button"
          className="sim-mobile-btn sim-mobile-btn--primary"
          disabled={isSubmitting}
          onClick={onSubmit}
        >
          {isSubmitting ? 'Registrando alias...' : 'Confirmar alias'}
        </button>
        <button
          type="button"
          className="sim-mobile-btn sim-mobile-btn--ghost"
          disabled={isSubmitting}
          onClick={onBack}
        >
          Volver
        </button>
      </div>
    </div>
  );
}
