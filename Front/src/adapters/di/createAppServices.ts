import type { AliasService } from '../../application/aliasService';
import type { RandomizerService } from '../../application/randomizerService';
import type { TestScenarioSeedService } from '../../application/testScenarioSeedService';
import { aliasAdapter } from '../api/aliasApi';
import { randomizerAdapter } from '../api/randomizerApi';
import { testScenarioSeedAdapter } from '../api/testScenarioSeedApi';

export type AppServices = {
  aliasService: AliasService;
  randomizerService: RandomizerService;
  testScenarioSeedService: TestScenarioSeedService;
};

export function createAppServices(): AppServices {
  return {
    aliasService: aliasAdapter,
    randomizerService: randomizerAdapter,
    testScenarioSeedService: testScenarioSeedAdapter,
  };
}

export const defaultAppServices = createAppServices();
