import { useState, type FormEvent } from 'react';
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
  last_name: '',
  email: '',
  phone: '',
  alias_value: '',
};

export function CreateUserPage({ onNavigate }: CreateUserPageProps) {
  const aliasService = useAliasService();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await aliasService.createFullUser({
        customer: {
          document_type: form.document_type,
          document_number: form.document_number.trim(),
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        },
        alias: {
          alias_value: form.alias_value.trim(),
        },
      });

      setSuccess(`Usuario creado correctamente con alias "${form.alias_value.trim()}".`);
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
                <option value="P">P</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="document_number">Número de documento</label>
              <input
                id="document_number"
                type="text"
                required
                disabled={submitting}
                value={form.document_number}
                onChange={(event) => updateField('document_number', event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="first_name">Nombre</label>
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
              <label htmlFor="last_name">Apellido</label>
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
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                required
                disabled={submitting}
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="phone">Teléfono</label>
              <input
                id="phone"
                type="tel"
                required
                disabled={submitting}
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
              />
            </div>

            <div className="form-field form-field--full">
              <label htmlFor="alias_value">Alias</label>
              <input
                id="alias_value"
                type="text"
                required
                disabled={submitting}
                placeholder="ej. maria.gonzalez123456"
                value={form.alias_value}
                onChange={(event) => updateField('alias_value', event.target.value)}
              />
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
