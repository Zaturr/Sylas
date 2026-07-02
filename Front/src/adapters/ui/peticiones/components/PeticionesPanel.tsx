import type { SimfTraceSessionKey } from '../../../../domain/peticiones';
import { useSimfRequestTraces } from '../hooks/useSimfRequestTraces';
import { PeticionesRequestCard } from './PeticionesRequestCard';
import '../peticiones.theme.css';

type PeticionesPanelProps = {
  sessionKey: SimfTraceSessionKey | null;
};

export function PeticionesPanel({ sessionKey }: PeticionesPanelProps) {
  const traces = useSimfRequestTraces(sessionKey);
  const hasTraces = traces.length > 0;

  return (
    <aside className="peticiones-panel" aria-label="Peticiones SIMF de la sesión">
      <div className="peticiones-panel__header">
        <h2 className="peticiones-panel__title">Peticiones</h2>
        <p className="peticiones-panel__subtitle">
          Peticiones SIMF del simulador para la cédula activa.
        </p>
      </div>

      <div className="peticiones-panel__list">
        {hasTraces ? (
          traces.map((trace) => (
            <PeticionesRequestCard key={trace.id} trace={trace} />
          ))
        ) : (
          <div className="peticiones-panel__empty">
            <p className="peticiones-panel__empty-text">
              {sessionKey
                ? 'Esperando nuevos eventos...'
                : 'Inicia sesión en el simulador para ver las peticiones SIMF.'}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
