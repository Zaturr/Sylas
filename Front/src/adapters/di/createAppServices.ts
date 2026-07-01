import type { AliasService } from '../../application/aliasService';
import { aliasAdapter } from '../api/aliasApi';

export type AppServices = {
  aliasService: AliasService;
};

export function createAppServices(): AppServices {
  return {
    aliasService: aliasAdapter,
  };
}

export const defaultAppServices = createAppServices();
