import type { AuthSimulationService } from '../../../application/simulation/authSimulation.port';
import { loginByDocument, createAccount } from './auth/authSimulation.service';
import {
  checkAliasByDocument,
  updateAliasStatus,
  registerAlias,
  deleteAlias,
} from './alias/aliasSimulation.service';

export function createAuthSimulationService(): AuthSimulationService {
  return {
    loginByDocument,
    createAccount,
    checkAliasByDocument,
    updateAliasStatus,
    registerAlias,
    deleteAlias,
  };
}
