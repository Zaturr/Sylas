import type { AuthSimulationService } from '../../../application/simulation/authSimulation.port';
import type { AliasSimulationService, SimfAliasClients } from './alias/aliasSimulation.service';
import { createAuthSimulationHandlers } from './auth/authSimulation.service';

export function createAuthSimulationService(
  aliasSimulation: AliasSimulationService,
  simfClients: Pick<SimfAliasClients, 'resolveAliasViaSimf'>,
): AuthSimulationService {
  const authHandlers = createAuthSimulationHandlers({
    resolveAliasViaSimf: simfClients.resolveAliasViaSimf,
  });

  return {
    loginByDocument: authHandlers.loginByDocument,
    createAccount: authHandlers.createAccount,
    checkAliasByDocument: aliasSimulation.checkAliasByDocument,
    updateAliasStatus: aliasSimulation.updateAliasStatus,
    registerAlias: aliasSimulation.registerAlias,
    deleteAlias: aliasSimulation.deleteAlias,
  };
}
