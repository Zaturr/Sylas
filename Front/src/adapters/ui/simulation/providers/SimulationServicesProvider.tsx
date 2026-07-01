import { createContext, useContext, type ReactNode } from 'react';
import type { AuthSimulationService } from '../../../../application/simulation/authSimulation.port';
import type { PaymentSimulationService } from '../../../../application/simulation/paymentSimulation.port';
import { defaultAppServices } from '../../../di/createAppServices';
import {
  createSimulationServices,
  type SimulationServices,
} from '../../../di/simulation/createSimulationServices';

const defaultSimulationServices = createSimulationServices(
  defaultAppServices.aliasService,
);

const SimulationServicesContext = createContext<SimulationServices>(
  defaultSimulationServices,
);

type SimulationServicesProviderProps = {
  children: ReactNode;
  services?: SimulationServices;
};

export function SimulationServicesProvider({
  children,
  services = defaultSimulationServices,
}: SimulationServicesProviderProps) {
  return (
    <SimulationServicesContext.Provider value={services}>
      {children}
    </SimulationServicesContext.Provider>
  );
}

export function useSimulationServices(): SimulationServices {
  return useContext(SimulationServicesContext);
}

export function usePaymentSimulationService(): PaymentSimulationService {
  return useSimulationServices().paymentSimulationService;
}

export function useAuthSimulationService(): AuthSimulationService {
  return useSimulationServices().authSimulationService;
}
