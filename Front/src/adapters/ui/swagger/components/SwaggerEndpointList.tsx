import type { SwaggerEndpoint } from '../apiCatalog';

type SwaggerEndpointListProps = {
  endpoints: SwaggerEndpoint[];
  selectedEndpointId: string | null;
  onSelectEndpoint: (endpointId: string) => void;
};

function methodClass(method: SwaggerEndpoint['method']) {
  return `swagger-method swagger-method--${method.toLowerCase()}`;
}

export function SwaggerEndpointList({
  endpoints,
  selectedEndpointId,
  onSelectEndpoint,
}: SwaggerEndpointListProps) {
  if (endpoints.length === 0) {
    return <p className="swagger-endpoint-list__empty">No hay endpoints para mostrar.</p>;
  }

  return (
    <div className="swagger-endpoint-list">
      {endpoints.map((endpoint) => (
        <button
          key={endpoint.id}
          type="button"
          className={`swagger-endpoint-list__item${
            selectedEndpointId === endpoint.id ? ' swagger-endpoint-list__item--active' : ''
          }`}
          onClick={() => onSelectEndpoint(endpoint.id)}
        >
          <span className={methodClass(endpoint.method)}>{endpoint.method}</span>
          <span className="swagger-endpoint-list__path">{endpoint.path}</span>
        </button>
      ))}
    </div>
  );
}