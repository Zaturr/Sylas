import type { SwaggerEndpoint } from '../apiCatalog';

type SwaggerEndpointDocProps = {
  endpoint: SwaggerEndpoint | null;
};

function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function SwaggerEndpointDoc({ endpoint }: SwaggerEndpointDocProps) {
  if (!endpoint) {
    return <p className="swagger-endpoint-doc__empty">Selecciona un endpoint.</p>;
  }

  return (
    <article className="swagger-endpoint-doc">
      <header className="swagger-endpoint-doc__header">
        <span className={`swagger-method swagger-method--${endpoint.method.toLowerCase()}`}>
          {endpoint.method}
        </span>
        <h1 className="swagger-endpoint-doc__title">{endpoint.title}</h1>
        <code className="swagger-endpoint-doc__path">{endpoint.path}</code>
      </header>

      <p className="swagger-endpoint-doc__description">{endpoint.description}</p>

      {endpoint.pathParams && endpoint.pathParams.length > 0 && (
        <section className="swagger-endpoint-doc__section">
          <h2>Path parameters</h2>
          <table className="swagger-endpoint-doc__table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {endpoint.pathParams.map((param) => (
                <tr key={param.name}>
                  <td><code>{param.name}</code></td>
                  <td>{param.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {endpoint.bodyFields && endpoint.bodyFields.length > 0 && (
        <section className="swagger-endpoint-doc__section">
          <h2>Reglas de MsgId y EndToEndId</h2>
          <table className="swagger-endpoint-doc__table">
            <thead>
              <tr>
                <th>Campo</th>
                <th>Regla</th>
                <th>Ejemplo válido</th>
              </tr>
            </thead>
            <tbody>
              {endpoint.bodyFields.map((field) => (
                <tr key={field.name}>
                  <td><code>{field.name}</code></td>
                  <td>{field.description}</td>
                  <td><code>{field.example}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {endpoint.bodyExample !== undefined &&
        endpoint.method !== 'POST' &&
        endpoint.method !== 'PUT' && (
        <section className="swagger-endpoint-doc__section">
          <h2>Request body</h2>
          <pre className="swagger-endpoint-doc__body">
            <code>{formatJson(endpoint.bodyExample)}</code>
          </pre>
        </section>
      )}

      <section className="swagger-endpoint-doc__section">
        <h2>Responses</h2>
        <ul className="swagger-endpoint-doc__responses">
          {endpoint.responses.map((response) => (
            <li key={response.id}>
              <strong>{response.tabLabel}</strong> — {response.label}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
