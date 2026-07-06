import { useEffect } from 'react';
import { appConfig } from '../../api/app.config';
import { useTestScenarioSeedService } from '../providers/AppServicesProvider';

export function useAutoSeedTestScenarios(): void {
  const testScenarioSeedService = useTestScenarioSeedService();

  useEffect(() => {
    const controller = new AbortController();

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
        if (response.errors && response.errors.length > 0) {
          console.warn('Errores al cargar escenarios de prueba:', response.errors);
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) {
          return;
        }
        console.warn('No se pudieron cargar los escenarios de prueba:', err);
      });

    return () => controller.abort();
  }, [testScenarioSeedService]);
}
