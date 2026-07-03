import type {
  RandomizerRequest,
  RandomizerResponse,
  RandomizerService,
} from '../../application/randomizerService';
import { appConfig } from './app.config';

async function readApiError(response: Response, fallback: string): Promise<string> {
  const data = await response.json().catch(() => null);
  if (data && typeof data.error === 'string') {
    return data.error;
  }
  return fallback;
}

export const randomizerAdapter: RandomizerService = {
  generateData: async (
    request: RandomizerRequest,
    signal?: AbortSignal,
  ): Promise<RandomizerResponse> => {
    const response = await fetch(`${appConfig.apiBaseUrl}/randomizer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, 'Error al generar datos aleatorios'));
    }

    return response.json();
  },
};
