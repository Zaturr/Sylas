import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppServicesProvider } from './adapters/ui/providers/AppServicesProvider';
import './index.css';
import App from './App.tsx';
import { loadConfig, ConfigError } from './configService';

const initApp = async () => {
  const root = document.getElementById('root');
  if (!root) {
    return;
  }

  try {
    await loadConfig();
  } catch (error) {
    const message =
      error instanceof ConfigError
        ? error.message
        : 'No se pudo cargar la configuración de la aplicación.';

    root.innerHTML = `
      <div style="font-family: system-ui, sans-serif; max-width: 640px; margin: 2rem auto; padding: 1.5rem; border: 1px solid #fca5a5; border-radius: 8px; background: #fef2f2; color: #991b1b;">
        <h1 style="margin: 0 0 1rem; font-size: 1.25rem;">Configuración requerida</h1>
        <p style="margin: 0 0 1rem; line-height: 1.5;">${message}</p>
        <p style="margin: 0; line-height: 1.5; color: #7f1d1d;">
          Revisa <code>config.json</code> e incluye <code>VITE_API_BASE_URL</code> y
          <code>VITE_SIMF_BASE_URL</code> con las URLs completas (host y puerto).
        </p>
      </div>
    `;
    return;
  }

  createRoot(root).render(
    <StrictMode>
      <AppServicesProvider>
        <App />
      </AppServicesProvider>
    </StrictMode>,
  );
};

initApp();
