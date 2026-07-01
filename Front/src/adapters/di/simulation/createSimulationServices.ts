import type { AliasService } from '../../../application/aliasService';
import type { AuthSimulationService } from '../../../application/simulation/authSimulation.port';
import type { PaymentSimulationService } from '../../../application/simulation/paymentSimulation.port';
import { createAuthSimulationService } from '../../api/simulation/authSimulationAdapter';
import { createPaymentSimulationService } from '../../api/simulation/paymentSimulationAdapter';

export type SimulationServices = {
  authSimulationService: AuthSimulationService;
  paymentSimulationService: PaymentSimulationService;
};

export function createSimulationServices(
  aliasService: AliasService,
): SimulationServices {
  return {
    authSimulationService: createAuthSimulationService(),
    paymentSimulationService: createPaymentSimulationService(aliasService),
  };
}
