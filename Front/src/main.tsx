import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppServicesProvider } from './adapters/ui/providers/AppServicesProvider';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppServicesProvider>
      <App />
    </AppServicesProvider>
  </StrictMode>,
);
