import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppServicesProvider } from './adapters/ui/providers/AppServicesProvider';
import './index.css';
import App from './App.tsx';
import { loadConfig } from './configService';

const initApp = async () => {
  // Esperamos a que cargue la configuración ANTES de montar React
  await loadConfig();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppServicesProvider>
        <App />
      </AppServicesProvider>
    </StrictMode>,
  );
};

initApp();
