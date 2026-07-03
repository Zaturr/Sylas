import type { AliasService } from '../../application/aliasService';
import type { RandomizerService } from '../../application/randomizerService';
import { aliasAdapter } from '../api/aliasApi';
import { randomizerAdapter } from '../api/randomizerApi';

export type AppServices = {
  aliasService: AliasService;
  randomizerService: RandomizerService;
};

export function createAppServices(): AppServices {
  return {
    aliasService: aliasAdapter,
    randomizerService: randomizerAdapter,
  };
}

export const defaultAppServices = createAppServices();
