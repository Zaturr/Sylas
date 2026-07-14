import { useState, type FormEvent } from 'react';
import { validateAliasValue } from '../../../domain/simulation/aliasValidation';
import {
  mapDocumentTypeToSimfScheme,
  validateDocumentFields,
} from '../../../domain/validations';
import { AppShell } from '../components/AppShell';
import { useAliasService } from '../providers/AppServicesProvider';
import type { AppPage } from '../navigation';
import './forms.css';

type CreateUserPageProps = {
  onNavigate: (page: AppPage) => void;
};

const initialForm = {
  document_type: 'V',
  document_number: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  second_last_name: '',
  alias_value: '',
};

export function CreateUserPage({ onNavigate }: CreateUserPageProps) {
  const aliasService = useAliasService();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedScheme = mapDocumentTypeToSimfScheme(form.document_type);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateDocumentNumber = (value: string) => {
    updateField('document_number', value.replace(/\D/g, ''));
  };

  const updateAliasValue = (value: string) => {
    updateField('alias_value', value.toLowerCase());
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const documentValidation = validateDocumentFields(
      form.document_type,
      form.document_number,
    );
    if (documentValidation.ok === false) {
      setError(documentValidation.error);
      return;
    }

    const aliasValidation = validateAliasValue(form.alias_value);
    if (aliasValidation.ok === false) {
      setError(aliasValidation.error);
      return;
    }

    setSubmitting(true);

    try {
      await aliasService.createFullUser({
        customer: {
          document_type: documentValidation.documentType,
          document_number: documentValidation.documentNumber,
          first_name: form.first_name.trim(),
          middle_name: form.middle_name.trim(),
          last_name: form.last_name.trim(),
          second_last_name: form.second_last_name.trim(),
        },
        alias: {
          alias_value: aliasValidation.value,
        },
      });

      setSuccess(`Usuario creado correctamente con alias "${aliasValidation.value}".`);
      setForm(initialForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el usuario');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell activeItem="users" onNavigate={onNavigate}>
      <div className="form-page">
        <div className="table-header">
          <h2 className="section-title">Registrar Usuario</h2>
        </div>

        {error && (
          <div className="dashboard-state dashboard-inline-error">
            <p>Error: {error}</p>
          </div>
        )}

        <form className="form-card" onSubmit={handleSubmit}>
          <h3 className="form-section-title">Datos del cliente</h3>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="document_type">Tipo de documento</label>
              <select
                id="document_type"
                value={form.document_type}
                disabled={submitting}
                onChange={(event) => updateField('document_type', event.target.value)}
              >
                <option value="V">V</option>
                <option value="E">E</option>
                <option value="J">J</option>
                <option value="G">G</option>
                <option value="C">C</option>
                <option value="P">P</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="document_number">Número de documento</label>
              <input
                id="document_number"
                type="text"
                inputMode="numeric"
                pattern="[0-9]+"
                title="Solo se permiten números"
                required
                disabled={submitting}
                value={form.document_number}
                onChange={(event) => updateDocumentNumber(event.target.value)}
              />
              {selectedScheme === 'SRIF' && (
                <small className="form-hint">
                  Tipo J, G o C usa esquema SRIF: el número debe tener exactamente 9 dígitos.
                </small>
              )}
              {selectedScheme === 'SCID' && (
                <small className="form-hint">Tipo V o E usa esquema SCID.</small>
              )}
              {selectedScheme === 'SPAS' && (
                <small className="form-hint">
                  Tipo P usa esquema SPAS: el número debe tener entre 1 y 34 dígitos.
                </small>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="first_name">Primer Nombre</label>
              <input
                id="first_name"
                type="text"
                required
                disabled={submitting}
                value={form.first_name}
                onChange={(event) => updateField('first_name', event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="middle_name">Segundo Nombre (Opcional)</label>
              <input
                id="middle_name"
                type="text"
                disabled={submitting}
                value={form.middle_name}
                onChange={(event) => updateField('middle_name', event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="last_name">Primer Apellido</label>
              <input
                id="last_name"
                type="text"
                required
                disabled={submitting}
                value={form.last_name}
                onChange={(event) => updateField('last_name', event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="second_last_name">Segundo Apellido</label>
              <input
                id="second_last_name"
                type="text"
                required
                disabled={submitting}
                value={form.second_last_name}
                onChange={(event) => updateField('second_last_name', event.target.value)}
              />
            </div>

            <div className="form-field form-field--full">
              <label htmlFor="alias_value">Alias</label>
              <input
                id="alias_value"
                type="text"
                required
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                disabled={submitting}
                placeholder="ej. maria.gonzalez123456"
                value={form.alias_value}
                onChange={(event) => updateAliasValue(event.target.value)}
              />
              <small className="form-hint">Solo minúsculas, números y un punto (.).</small>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Crear usuario'}
            </button>
            <button
              type="button"
              className="secondary-btn"
              disabled={submitting}
              onClick={() => onNavigate('alias')}
            >
              Volver al panel
            </button>
          </div>

          {success && <div className="form-success">{success}</div>}
        </form>
      </div>
    </AppShell>
  );
}
