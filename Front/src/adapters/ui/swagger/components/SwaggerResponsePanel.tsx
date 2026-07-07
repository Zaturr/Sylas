import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SwaggerEndpoint, SwaggerResponseVariant } from '../apiCatalog';

type SwaggerResponsePanelProps = {
  endpoint: SwaggerEndpoint | null;
};

function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function responseTabClass(variant: SwaggerResponseVariant): string {
  switch (variant) {
    case 'server-error':
      return ' swagger-response-panel__tab--server-error';
    case 'reject':
      return ' swagger-response-panel__tab--client-error';
    default:
      return ' swagger-response-panel__tab--success';
  }
}

function hasRequestBody(endpoint: SwaggerEndpoint): boolean {
  return (
    (endpoint.method === 'POST' || endpoint.method === 'PUT') &&
    endpoint.bodyExample !== undefined
  );
}

export function SwaggerResponsePanel({ endpoint }: SwaggerResponsePanelProps) {
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null);
  const [copiedRequest, setCopiedRequest] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  useEffect(() => {
    setSelectedResponseId(endpoint?.responses[0]?.id ?? null);
    setCopiedRequest(false);
    setCopiedResponse(false);
  }, [endpoint?.id]);

  const activeResponse = useMemo(() => {
    if (!endpoint || endpoint.responses.length === 0) {
      return null;
    }

    return (
      endpoint.responses.find((response) => response.id === selectedResponseId) ??
      endpoint.responses[0]
    );
  }, [endpoint, selectedResponseId]);

  const requestFormatted = endpoint?.bodyExample ? formatJson(endpoint.bodyExample) : '';
  const responseFormatted = formatJson(activeResponse?.example);

  const handleCopyRequest = useCallback(async () => {
    if (!requestFormatted) {
      return;
    }
    try {
      await navigator.clipboard.writeText(requestFormatted);
      setCopiedRequest(true);
      window.setTimeout(() => setCopiedRequest(false), 1500);
    } catch {
      setCopiedRequest(false);
    }
  }, [requestFormatted]);

  const handleCopyResponse = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(responseFormatted);
      setCopiedResponse(true);
      window.setTimeout(() => setCopiedResponse(false), 1500);
    } catch {
      setCopiedResponse(false);
    }
  }, [responseFormatted]);

  if (!endpoint) {
    return <p className="swagger-response-panel__empty">Sin endpoint seleccionado.</p>;
  }

  const showRequest = hasRequestBody(endpoint);

  return (
    <div className="swagger-response-panel">
      <div className="swagger-response-panel__request">
        <span className={`swagger-method swagger-method--${endpoint.method.toLowerCase()}`}>
          {endpoint.method}
        </span>
        <code>{endpoint.path}</code>
      </div>

      {showRequest && (
        <section className="swagger-response-panel__section">
          <div className="swagger-response-panel__section-header">
            <h3 className="swagger-response-panel__section-title">Request</h3>
            <span>application/json</span>
            <button type="button" onClick={handleCopyRequest}>
              {copiedRequest ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <pre className="swagger-response-panel__code swagger-response-panel__code--request">
            <code>{requestFormatted}</code>
          </pre>
        </section>
      )}

      <section className="swagger-response-panel__section">
        <div className="swagger-response-panel__section-header">
          <h3 className="swagger-response-panel__section-title">Response samples</h3>
        </div>

        {!showRequest && (
          <p className="swagger-response-panel__hint">
            SIMF responde HTTP 200 en aceptaciones y rechazos de negocio (Result ACCP / RJCT).
          </p>
        )}

        <div className="swagger-response-panel__tabs" role="tablist" aria-label="Response samples">
          {endpoint.responses.map((response) => (
            <button
              key={response.id}
              type="button"
              role="tab"
              aria-selected={activeResponse?.id === response.id}
              className={`swagger-response-panel__tab${
                activeResponse?.id === response.id ? ' swagger-response-panel__tab--active' : ''
              }${responseTabClass(response.variant)}`}
              title={response.label}
              onClick={() => setSelectedResponseId(response.id)}
            >
              {response.tabLabel}
            </button>
          ))}
        </div>

        <div className="swagger-response-panel__toolbar">
          <span>{activeResponse?.label}</span>
          <span>{activeResponse?.contentType}</span>
          <button type="button" onClick={handleCopyResponse}>
            {copiedResponse ? 'Copiado' : 'Copiar'}
          </button>
        </div>

        <pre className="swagger-response-panel__code">
          <code>{responseFormatted}</code>
        </pre>
      </section>
    </div>
  );
}
