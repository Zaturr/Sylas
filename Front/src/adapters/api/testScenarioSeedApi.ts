import type {
  TestScenarioSeedRequest,
  TestScenarioSeedResponse,
  TestScenarioSeedService,
} from '../../application/testScenarioSeedService';
import { appConfig } from './app.config';

async function readApiError(response: Response, fallback: string): Promise<string> {
  const data = await response.json().catch(() => null);
  if (data && typeof data.error === 'string') {
    return data.error;
  }
  return fallback;
}

export const testScenarioSeedAdapter: TestScenarioSeedService = {
  seedTestScenarios: async (
    request: TestScenarioSeedRequest,
    signal?: AbortSignal,
  ): Promise<TestScenarioSeedResponse> => {
    const response = await fetch(`${appConfig.apiBaseUrl}/seed/test-scenarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, 'Error al cargar escenarios de prueba'));
    }

    return response.json();
  },
};
