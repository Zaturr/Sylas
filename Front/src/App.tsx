import { useState } from 'react';
import { Dashboard } from './adapters/ui/pages/dashboard';
import { CreateUserPage } from './adapters/ui/pages/createUser';
import { GenerateDataPage } from './adapters/ui/pages/generateData';
import { useAutoSeedTestScenarios } from './adapters/ui/hooks/useAutoSeedTestScenarios';
import { RulesPage } from './adapters/ui/rules';
import {
  SimulationPage,
  SimulationServicesProvider,
} from './adapters/ui/simulation';
import type { AppPage } from './adapters/ui/navigation';
import { SwaggerPage } from './adapters/ui/swagger';

function App() {
  useAutoSeedTestScenarios();

  const [page, setPage] = useState<AppPage>('alias');

  if (page === 'users') {
    return <CreateUserPage onNavigate={setPage} />;
  }

  if (page === 'generateData') {
    return <GenerateDataPage onNavigate={setPage} />;
  }

  if (page === 'simulation') {
    return (
      <SimulationServicesProvider>
        <SimulationPage onNavigate={setPage} />
      </SimulationServicesProvider>
    );
  }
  if (page === 'swagger'){
    return <SwaggerPage onNavigate={setPage} />;
  }
  if (page === 'rules'){
    return <RulesPage onNavigate={setPage} />;
  }

  return <Dashboard onNavigate={setPage} />;
}

export default App;
