import { createContext, useContext, type ReactNode } from 'react';
import type { SimfRequestTracePort } from '../../../../application/peticiones';
import { useSimfRequestTracePort } from '../../simulation/providers/SimulationServicesProvider';

const PeticionesContext = createContext<SimfRequestTracePort | null>(null);

type PeticionesProviderProps = {
  children: ReactNode;
  tracePort?: SimfRequestTracePort;
};

export function PeticionesProvider({
  children,
  tracePort,
}: PeticionesProviderProps) {
  const defaultTracePort = useSimfRequestTracePort();
  const resolvedTracePort = tracePort ?? defaultTracePort;

  return (
    <PeticionesContext.Provider value={resolvedTracePort}>
      {children}
    </PeticionesContext.Provider>
  );
}

export function usePeticionesTracePort(): SimfRequestTracePort {
  const tracePort = useContext(PeticionesContext);

  if (!tracePort) {
    throw new Error('usePeticionesTracePort debe usarse dentro de PeticionesProvider.');
  }

  return tracePort;
}
