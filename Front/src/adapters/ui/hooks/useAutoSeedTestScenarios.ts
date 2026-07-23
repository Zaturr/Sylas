import { useEffect, useRef, useState } from 'react';
import { appConfig } from '../../api/app.config';
import { useTestScenarioSeedService } from '../providers/AppServicesProvider';

export type AutoSeedState = {
  ready: boolean;
  error: string | null;
};

/**
 * Al iniciar la app: limpia la BD (borra randomizador/basura) y deja solo
 * los escenarios de prueba. El panel NO se muestra hasta que esto termine.
 */
export function useAutoSeedTestScenarios(): AutoSeedState {
  const testScenarioSeedService = useTestScenarioSeedService();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const runIdRef = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const runId = ++runIdRef.current;

    setReady(false);
    setError(null);

    testScenarioSeedService
      .seedTestScenarios(
        {
          user_bank_id: appConfig.simulation.bankCode,
          account_type: appConfig.simulation.accountType,
          scenarios: [...appConfig.testScenarios],
        },
        controller.signal,
      )
      .then((response) => {
        if (runId !== runIdRef.current) {
          return;
        }
        if (response.errors && response.errors.length > 0) {
          console.warn('Errores al cargar escenarios de prueba:', response.errors);
        }
        console.info(
          `[seed] purged=${response.purged ?? 0} created=${response.created} skipped=${response.skipped}`,
        );
        setReady(true);
      })
      .catch((err) => {
        if (runId !== runIdRef.current || controller.signal.aborted) {
          return;
        }
        const message =
          err instanceof Error ? err.message : 'No se pudieron cargar los escenarios de prueba';
        console.warn(message, err);
        setError(message);
        // Sin seed exitoso no abrimos el panel: evita mostrar data basura (randomizador).
        setReady(false);
      });

    return () => {
      controller.abort();
    };
  }, [testScenarioSeedService]);

  return { ready, error };
}
