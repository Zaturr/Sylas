import type { SimfTraceSessionKey } from '../../../../domain/peticiones';
import { useSimfLatestRequestTrace } from '../hooks/useSimfLatestRequestTrace';
import { PeticionesRequestCard } from './PeticionesRequestCard';
import '../peticiones.theme.css';

type PeticionesPanelProps = {
  sessionKey: SimfTraceSessionKey | null;
  isTracePanelActive: boolean;
};

function getEmptyMessage(
  sessionKey: SimfTraceSessionKey | null,
  isTracePanelActive: boolean,
): string {
  if (!sessionKey) {
    return 'Inicia sesión en el simulador para ver las peticiones SIMF.';
  }

  if (!isTracePanelActive) {
    return 'Entra al gestor de alias o inicia un pago para ver las peticiones SIMF.';
  }

  return 'Esperando nuevos eventos...';
}

export function PeticionesPanel({
  sessionKey,
  isTracePanelActive,
}: PeticionesPanelProps) {
  const latestTrace = useSimfLatestRequestTrace(sessionKey, isTracePanelActive);

  return (
    <aside className="peticiones-panel" aria-label="Peticiones SIMF del simulador">
      <div className="peticiones-panel__header">
        <h2 className="peticiones-panel__title">Peticiones</h2>
        <p className="peticiones-panel__subtitle">
          Petición SIMF activa del gestor de alias o del flujo de pago para la cédula en sesión.
        </p>
      </div>

      <div className="peticiones-panel__content">
        {latestTrace ? (
          <PeticionesRequestCard key={latestTrace.id} trace={latestTrace} />
        ) : (
          <div className="peticiones-panel__empty">
            <p className="peticiones-panel__empty-text">
              {getEmptyMessage(sessionKey, isTracePanelActive)}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
