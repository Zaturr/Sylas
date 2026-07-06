import { useState, type FormEvent } from 'react';
import { appConfig } from '../../api/app.config';
import { AppShell } from '../components/AppShell';
import { useRandomizerService } from '../providers/AppServicesProvider';
import type { AppPage } from '../navigation';
import './forms.css';

const MIN_CUSTOMERS = 1;
const MAX_CUSTOMERS = 100;
const MAX_ACCOUNTS_PER_CUSTOMER = 1;

type GenerateDataPageProps = {
  onNavigate: (page: AppPage) => void;
};

export function GenerateDataPage({ onNavigate }: GenerateDataPageProps) {
  const randomizerService = useRandomizerService();
  const [totalCustomers, setTotalCustomers] = useState(20);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleTotalChange = (value: string) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      return;
    }
    setTotalCustomers(Math.min(MAX_CUSTOMERS, Math.max(MIN_CUSTOMERS, parsed)));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const response = await randomizerService.generateData({
        total_customers: totalCustomers,
        max_accounts_per_customer: MAX_ACCOUNTS_PER_CUSTOMER,
        banks: [
          {
            id: appConfig.simulation.bankCode,
            name: appConfig.simulation.bankName,
          },
        ],
      });

      setSuccess(
        `${response.message} Se crearon ${response.customers_created} usuarios.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar los datos');
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = submitting;

  return (
    <AppShell activeItem="generateData" onNavigate={onNavigate}>
      <div className="form-page">
        <div className="table-header">
          <h2 className="section-title">Generar Data</h2>
        </div>

        {error && (
          <div className="dashboard-state dashboard-inline-error">
            <p>Error: {error}</p>
          </div>
        )}

        <form className="form-card" onSubmit={handleSubmit}>
          <h3 className="form-section-title">Cantidad de usuarios</h3>

          <div className="form-grid">
            <div className="form-field form-field--full">
              <label htmlFor="total_customers">
                Usuarios a generar ({MIN_CUSTOMERS}–{MAX_CUSTOMERS})
              </label>
              <input
                id="total_customers"
                type="range"
                min={MIN_CUSTOMERS}
                max={MAX_CUSTOMERS}
                step={1}
                disabled={isBusy}
                value={totalCustomers}
                onChange={(event) => handleTotalChange(event.target.value)}
              />
              <input
                type="number"
                min={MIN_CUSTOMERS}
                max={MAX_CUSTOMERS}
                step={1}
                disabled={isBusy}
                value={totalCustomers}
                onChange={(event) => handleTotalChange(event.target.value)}
              />
            </div>

            <div className="form-field form-field--full">
              <label>Banco</label>
              <input
                type="text"
                value={`${appConfig.simulation.bankName} (${appConfig.simulation.bankCode})`}
                readOnly
                disabled
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-btn" disabled={isBusy}>
              {submitting ? 'Generando...' : 'Generar data'}
            </button>
            <button
              type="button"
              className="secondary-btn"
              disabled={isBusy}
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
