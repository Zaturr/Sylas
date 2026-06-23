import { createContext, useContext, type ReactNode } from 'react';
import type { AliasService } from '../../../application/aliasService';
import type { PaymentSimulationService } from '../../../application/simulation/paymentSimulation.port';
import {
  defaultAppServices,
  type AppServices,
} from '../../di/createAppServices';

const AppServicesContext = createContext<AppServices>(defaultAppServices);

type AppServicesProviderProps = {
  children: ReactNode;
  services?: AppServices;
};

export function AppServicesProvider({
  children,
  services = defaultAppServices,
}: AppServicesProviderProps) {
  return (
    <AppServicesContext.Provider value={services}>{children}</AppServicesContext.Provider>
  );
}

export function useAppServices(): AppServices {
  return useContext(AppServicesContext);
}

export function usePaymentSimulationService(): PaymentSimulationService {
  return useAppServices().paymentSimulationService;
}

export function useAliasService(): AliasService {
  return useAppServices().aliasService;
}
