import { appConfig } from '../../../../../adapters/api/app.config';
import {
  getLegalEntityAccountCounts,
  isLegalEntityDocumentType,
} from '../../../../../domain/simulation';
import { parseDocumentInput } from '../../../../../domain/simulation/documentParser';
import '../simulationSteps.css';
type CreateAccountStepProps = {
  documentInput: string;
  firstNameInput: string;
  middleNameInput: string;
  lastNameInput: string;
  secondLastNameInput: string;
  errorMessage: string;
  isSubmitting: boolean;
  onDocumentChange: (value: string) => void;
  onFirstNameChange: (value: string) => void;
  onMiddleNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onSecondLastNameChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export function CreateAccountStep({
  documentInput,
  firstNameInput,
  middleNameInput,
  lastNameInput,
  secondLastNameInput,
  errorMessage,
  isSubmitting,
  onDocumentChange,
  onFirstNameChange,
  onMiddleNameChange,
  onLastNameChange,
  onSecondLastNameChange,
  onSubmit,
  onBack,
}: CreateAccountStepProps) {
  const parsedDocument = parseDocumentInput(documentInput.trim());
  const isLegalEntity =
    parsedDocument !== null && isLegalEntityDocumentType(parsedDocument.documentType);
  const legalEntityCounts = isLegalEntity ? getLegalEntityAccountCounts() : null;

  return (    <div className="sim-flow">
      <div className="sim-flow__intro">
        <h2 className="sim-flow__title">Crear cuenta</h2>
        <p className="sim-flow__subtitle">
          Registra tus datos y una cuenta en el banco {appConfig.simulation.bankCode}.
          El alias se configurará en un paso posterior.
        </p>
      </div>

      <div className="sim-form">
        <label className="sim-field">
          <span>Documento</span>
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            disabled={isSubmitting}
            placeholder="ej. V12345678 o J123456789"
            value={documentInput}
            onChange={(event) => onDocumentChange(event.target.value)}
          />
        </label>

        <label className="sim-field">
          <span>Primer Nombre</span>
          <input
            type="text"
            autoComplete="given-name"
            disabled={isSubmitting}
            placeholder="ej. Juan"
            value={firstNameInput}
            onChange={(event) => onFirstNameChange(event.target.value)}
          />
        </label>

        <label className="sim-field">
          <span>Segundo Nombre (Opcional)</span>
          <input
            type="text"
            autoComplete="additional-name"
            disabled={isSubmitting}
            placeholder="ej. Carlos"
            value={middleNameInput}
            onChange={(event) => onMiddleNameChange(event.target.value)}
          />
        </label>

        <label className="sim-field">
          <span>Primer Apellido</span>
          <input
            type="text"
            autoComplete="family-name"
            disabled={isSubmitting}
            placeholder="ej. Pérez"
            value={lastNameInput}
            onChange={(event) => onLastNameChange(event.target.value)}
          />
        </label>

        <label className="sim-field">
          <span>Segundo Apellido</span>
          <input
            type="text"
            disabled={isSubmitting}
            placeholder="ej. Gómez"
            value={secondLastNameInput}
            onChange={(event) => onSecondLastNameChange(event.target.value)}
          />
        </label>
      </div>

      <div className="sim-summary-card">
        <div className="sim-summary-card__row">
          <span>Banco</span>
          <strong>{appConfig.simulation.bankCode}</strong>
        </div>
        {isLegalEntity && legalEntityCounts ? (
          <>
            <div className="sim-summary-card__row">
              <span>Cuentas corrientes</span>
              <strong>{legalEntityCounts.ctsCorrientes}</strong>
            </div>
            <div className="sim-summary-card__row">
              <span>Cuentas ahorro</span>
              <strong>{legalEntityCounts.ctsAhorro}</strong>
            </div>
            <div className="sim-summary-card__row">
              <span>Cuentas divisa</span>
              <strong>{legalEntityCounts.ctsDivisa}</strong>
            </div>
          </>
        ) : (
          <div className="sim-summary-card__row">
            <span>Tipo de cuenta</span>
            <strong>{appConfig.simulation.accountType}</strong>
          </div>
        )}
      </div>

      {errorMessage && <p className="sim-flow__error">{errorMessage}</p>}

      <div className="sim-flow__actions">
        <button
          type="button"
          className="sim-mobile-btn sim-mobile-btn--primary"
          disabled={isSubmitting}
          onClick={onSubmit}
        >
          {isSubmitting ? 'Creando cuenta...' : 'Confirmar creación'}
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
