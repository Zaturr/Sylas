import type { AuthSimulationService } from '../../../application/simulation/authSimulation.port';
import { loginByDocument, createAccount } from './auth/authSimulation.service';
import type { AliasSimulationService } from './alias/aliasSimulation.service';

export function createAuthSimulationService(
  aliasSimulation: AliasSimulationService,
): AuthSimulationService {
  return {
    loginByDocument,
    createAccount,
    checkAliasByDocument: aliasSimulation.checkAliasByDocument,
    updateAliasStatus: aliasSimulation.updateAliasStatus,
    registerAlias: aliasSimulation.registerAlias,
    deleteAlias: aliasSimulation.deleteAlias,
  };
}
