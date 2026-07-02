import type { SimfRequestTracePort } from '../../../application/peticiones';
import {
  createInMemorySimfRequestTraceStore,
  createSimfHttpClient,
  type SimfHttpClient,
} from '../../api/peticiones';

export type PeticionesInfrastructure = {
  simfRequestTracePort: SimfRequestTracePort;
  simfHttpClient: SimfHttpClient;
};

export function createPeticionesInfrastructure(): PeticionesInfrastructure {
  const simfRequestTracePort = createInMemorySimfRequestTraceStore();
  const simfHttpClient = createSimfHttpClient(simfRequestTracePort);

  return {
    simfRequestTracePort,
    simfHttpClient,
  };
}
