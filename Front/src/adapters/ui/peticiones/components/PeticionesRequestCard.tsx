import type { SimfRequestTrace } from '../../../../domain/peticiones';
import {
  formatSimfTraceEndpointBadge,
  formatSimfTraceHttpStatus,
  isSimfTraceHttpSuccess,
} from '../../../../domain/peticiones';
import { PeticionesJsonBlock } from './PeticionesJsonBlock';

type PeticionesRequestCardProps = {
  trace: SimfRequestTrace;
};

export function PeticionesRequestCard({ trace }: PeticionesRequestCardProps) {
  const endpointBadge = formatSimfTraceEndpointBadge(trace.method, trace.path);
  const statusLabel = formatSimfTraceHttpStatus(trace.responseStatus);
  const statusSuccess = isSimfTraceHttpSuccess(trace.responseStatus);

  return (
    <article className="peticiones-card">
      <header className="peticiones-card__header">
        <div className="peticiones-card__title-row">
          <span className="peticiones-card__icon" aria-hidden="true">
            &gt;_
          </span>
          <h3 className="peticiones-card__title">Detalles de la Petición</h3>
        </div>
        <span className="peticiones-card__endpoint">{endpointBadge}</span>
      </header>

      <PeticionesJsonBlock label="REQUEST JSON" value={trace.requestBody} />

      <PeticionesJsonBlock
        label="RESPONSE JSON"
        value={trace.responseBody}
        statusLabel={statusLabel}
        statusSuccess={statusSuccess}
      />

      <footer className="peticiones-card__meta">
        <span>{new Date(trace.timestamp).toLocaleTimeString('es-VE')}</span>
        <span>{trace.durationMs} ms</span>
      </footer>
    </article>
  );
}
