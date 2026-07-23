import { useEffect, useRef, useState } from 'react';
import { appConfig } from '../../api/app.config';
import { useTestScenarioSeedService } from '../providers/AppServicesProvider';

export type AutoSeedState = {
  ready: boolean;
  error: string | null;
};

/**
 * Al iniciar: asegura los 30 escenarios de prueba y elimina basura (randomizador).
 * No abortamos el request al desmontar (StrictMode): si se corta a mitad, la BD
 * puede quedar inconsistente y Postman responde BE23.
 */
export function useAutoSeedTestScenarios(): AutoSeedState {
  const testScenarioSeedService = useTestScenarioSeedService();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const runIdRef = useRef(0);

  useEffect(() => {
    const runId = ++runIdRef.current;

    setReady(false);
    setError(null);

    testScenarioSeedService
      .seedTestScenarios({
        user_bank_id: appConfig.simulation.bankCode,
        account_type: appConfig.simulation.accountType,
        scenarios: [...appConfig.testScenarios],
      })
      .then((response) => {
        if (runId !== runIdRef.current) {
          return;
        }
        if (response.errors && response.errors.length > 0) {
          console.warn('Errores al cargar escenarios de prueba:', response.errors);
        }

        const loaded = (response.created ?? 0) + (response.updated ?? 0) + (response.skipped ?? 0);
        console.info(
          `[seed] purged=${response.purged ?? 0} created=${response.created} updated=${response.updated ?? 0} skipped=${response.skipped} loaded=${loaded}`,
        );

        if (loaded === 0) {
          setError('El seed no cargó ningún escenario de prueba');
          setReady(false);
          return;
        }

        setReady(true);
      })
      .catch((err) => {
        if (runId !== runIdRef.current) {
          return;
        }
        const message =
          err instanceof Error ? err.message : 'No se pudieron cargar los escenarios de prueba';
        console.warn(message, err);
        setError(message);
        setReady(false);
      });
  }, [testScenarioSeedService]);

  return { ready, error };
}
