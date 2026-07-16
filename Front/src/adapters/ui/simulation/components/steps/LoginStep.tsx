import { useEffect, useId, useState } from 'react';
import { listLoginDocuments } from '../../../../api/simulation/alias/aliasHttp.client';
import '../simulationSteps.css';

type LoginStepProps = {
  documentInput: string;
  errorMessage: string;
  isSubmitting: boolean;
  canCreateAccount: boolean;
  onDocumentChange: (value: string) => void;
  onSubmit: () => void;
  onCreateAccount: () => void;
};

export function LoginStep({
  documentInput,
  errorMessage,
  isSubmitting,
  canCreateAccount,
  onDocumentChange,
  onSubmit,
  onCreateAccount,
}: LoginStepProps) {
  const documentListId = useId();
  const [documentOptions, setDocumentOptions] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    listLoginDocuments(controller.signal)
      .then(setDocumentOptions)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        setDocumentOptions([]);
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="sim-flow">
      <div className="sim-card">
        <p className="sim-card__title">Ingresa tu cédula</p>
        <p className="sim-card__subtitle">Accede a la banca simulada con tu documento.</p>

        <div className="sim-form" style={{ marginTop: 14 }}>
          <label className="sim-field">
            <span>Cédula</span>
            <input
              type="text"
              inputMode="text"
              autoComplete="off"
              list={documentListId}
              disabled={isSubmitting}
              placeholder="ej. V12345678 o J123456789"
              value={documentInput}
              onChange={(event) => onDocumentChange(event.target.value)}
            />
            <datalist id={documentListId}>
              {documentOptions.map((document) => (
                <option key={document} value={document} />
              ))}
            </datalist>
          </label>
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
          {isSubmitting ? 'Validando...' : 'Continuar'}
        </button>

        {canCreateAccount && (
          <button
            type="button"
            className="sim-mobile-btn sim-mobile-btn--ghost"
            disabled={isSubmitting}
            onClick={onCreateAccount}
          >
            Crear cuenta
          </button>
        )}
      </div>
    </div>
  );
}
