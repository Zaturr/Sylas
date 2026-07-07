import { useMemo, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import type { AppPage } from '../../navigation';
import { SWAGGER_ENDPOINTS } from '../apiCatalog';
import { SwaggerSidebar } from '../components/SwaggerSidebar';
import { SwaggerEndpointList } from '../components/SwaggerEndpointList';
import { SwaggerEndpointDoc } from '../components/SwaggerEndpointDoc';
import { SwaggerResponsePanel } from '../components/SwaggerResponsePanel';
import '../swagger_layout.css';
import '../swagger_theme.css';

type SwaggerPageProps = {
  onNavigate: (page: AppPage) => void;
};

export function SwaggerPage({ onNavigate }: SwaggerPageProps) {
  const [selectedEndpointId, setSelectedEndpointId] = useState('resolve-alias-by-agent');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEndpoints = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return SWAGGER_ENDPOINTS;
    }

    return SWAGGER_ENDPOINTS.filter(
      (endpoint) =>
        endpoint.title.toLowerCase().includes(term) ||
        endpoint.path.toLowerCase().includes(term) ||
        endpoint.method.toLowerCase().includes(term),
    );
  }, [searchTerm]);

  const selectedEndpoint =
    SWAGGER_ENDPOINTS.find((endpoint) => endpoint.id === selectedEndpointId) ??
    filteredEndpoints[0] ??
    null;

  return (
    <AppShell
      activeItem="swagger"
      onNavigate={onNavigate}
      pageClassName="dashboard-page--swagger"
      mainClassName="dashboard-main--swagger"
    >
      <div className="swagger-page">
        <aside className="swagger-page__sidebar">
          <SwaggerSidebar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          <SwaggerEndpointList
            endpoints={filteredEndpoints}
            selectedEndpointId={selectedEndpoint?.id ?? null}
            onSelectEndpoint={setSelectedEndpointId}
          />
        </aside>

        <section className="swagger-page__doc">
          <SwaggerEndpointDoc endpoint={selectedEndpoint} />
        </section>

        <aside className="swagger-page__panel">
          <SwaggerResponsePanel endpoint={selectedEndpoint} />
        </aside>
      </div>
    </AppShell>
  );
}
