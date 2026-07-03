import { createContext, useContext, type ReactNode } from 'react';
import type { AliasService } from '../../../application/aliasService';
import type { RandomizerService } from '../../../application/randomizerService';
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

export function useAliasService(): AliasService {
  return useAppServices().aliasService;
}

export function useRandomizerService(): RandomizerService {
  return useAppServices().randomizerService;
}
