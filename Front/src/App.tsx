import { useState } from 'react';
import { Dashboard } from './adapters/ui/pages/dashboard';
import { CreateUserPage } from './adapters/ui/pages/createUser';
import { SimulationPage } from './adapters/ui/pages/simulation/SimulationPage';
import type { AppPage } from './adapters/ui/navigation';

function App() {
  const [page, setPage] = useState<AppPage>('alias');

  if (page === 'users') {
    return <CreateUserPage onNavigate={setPage} />;
  }

  if (page === 'simulation') {
    return <SimulationPage onNavigate={setPage} />;
  }

  return <Dashboard onNavigate={setPage} />;
}

export default App;
