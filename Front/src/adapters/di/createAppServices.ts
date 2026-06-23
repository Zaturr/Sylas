import type { AliasService } from '../../application/aliasService';
import type { PaymentSimulationService } from '../../application/simulation/paymentSimulation.port';
import { aliasAdapter } from '../api/aliasApi';
import { createPaymentSimulationService } from '../api/simulation/paymentSimulationAdapter';

export type AppServices = {
  aliasService: AliasService;
  paymentSimulationService: PaymentSimulationService;
};

export function createAppServices(): AppServices {
  const aliasService = aliasAdapter;

  return {
    aliasService,
    paymentSimulationService: createPaymentSimulationService(aliasService),
  };
}

export const defaultAppServices = createAppServices();
