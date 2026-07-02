import type { SimfRequestTracePort } from '../../../application/peticiones';
import type { AliasService } from '../../../application/aliasService';
import type { AuthSimulationService } from '../../../application/simulation/authSimulation.port';
import type { PaymentSimulationService } from '../../../application/simulation/paymentSimulation.port';
import { createPeticionesInfrastructure } from '../peticiones';
import { createAliasSimulationService } from '../../api/simulation/alias/aliasSimulation.service';
import { createAuthSimulationService } from '../../api/simulation/createAuthSimulationService';
import { createPaymentSimulationService } from '../../api/simulation/paymentSimulationAdapter';
import { createBlockAliasViaSimf } from '../../api/simulation/simf/simfAliasBlock.client';
import { createRegisterAliasViaSimf } from '../../api/simulation/simf/simfAliasCreate.client';
import { createResolveAntiphishingViaSimf } from '../../api/simulation/simf/simfAntiphishing.client';
import { createResolveAliasViaSimf } from '../../api/simulation/simf/simfAliasResolve.client';
import { createUpdateAliasViaSimf } from '../../api/simulation/simf/simfAliasUpdate.client';

export type SimulationServices = {
  authSimulationService: AuthSimulationService;
  paymentSimulationService: PaymentSimulationService;
  simfRequestTracePort: SimfRequestTracePort;
};

export function createSimulationServices(
  aliasService: AliasService,
): SimulationServices {
  void aliasService;
  const { simfRequestTracePort, simfHttpClient } = createPeticionesInfrastructure();
  const simfClients = {
    resolveAliasViaSimf: createResolveAliasViaSimf(simfHttpClient),
    registerAliasViaSimf: createRegisterAliasViaSimf(simfHttpClient),
    blockAliasViaSimf: createBlockAliasViaSimf(simfHttpClient),
    updateAliasViaSimf: createUpdateAliasViaSimf(simfHttpClient),
    resolveAntiphishingViaSimf: createResolveAntiphishingViaSimf(simfHttpClient),
  };
  const aliasSimulation = createAliasSimulationService(simfClients);

  return {
    authSimulationService: createAuthSimulationService(aliasSimulation),
    paymentSimulationService: createPaymentSimulationService({
      resolveAntiphishingViaSimf: simfClients.resolveAntiphishingViaSimf,
    }),
    simfRequestTracePort,
  };
}
