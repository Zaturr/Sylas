import type { SimulationSession } from '../../domain/simulation/auth.types';
import type {
  SimfAliasStatus,
  UserModifiableAliasStatus,
} from '../../domain/simulation/aliasStatus';

export type LoginByDocumentResult =
  | { ok: true; session: SimulationSession }
  | {
      ok: false;
      reason: 'not-found' | 'no-alias' | 'invalid-document' | 'error';
      message: string;
    };

export type CreateAccountInput = {
  documentInput: string;
  firstName: string;
  lastName: string;
};

export type CreateAccountResult =
  | { ok: true; session: SimulationSession }
  | { ok: false; message: string };

export type CheckAliasResult =
  | {
      ok: true;
      status: 'found';
      alias: string;
      message: string;
      agentStatus: SimfAliasStatus;
      bankCode: string;
    }
  | {
      ok: true;
      status: 'not-found';
      reason: 'BE23';
      message: string;
      agentStatus: SimfAliasStatus;
      bankCode: string;
    }
  | { ok: false; message: string };

export type UpdateAliasStatusInput = {
  aliasValue: string;
  bankCode: string;
  targetStatus: UserModifiableAliasStatus;
};

export type UpdateAliasStatusResult =
  | {
      ok: true;
      session: SimulationSession;
      check: Extract<CheckAliasResult, { ok: true }>;
    }
  | { ok: false; message: string };

export type RegisterAliasResult =
  | { ok: true; session: SimulationSession }
  | { ok: false; message: string };

export type DeleteAliasResult =
  | {
      ok: true;
      session: SimulationSession;
      check: Extract<CheckAliasResult, { ok: true }>;
    }
  | { ok: false; message: string };

export interface AuthSimulationService {
  loginByDocument(
    documentInput: string,
    signal?: AbortSignal,
  ): Promise<LoginByDocumentResult>;

  createAccount(
    input: CreateAccountInput,
    signal?: AbortSignal,
  ): Promise<CreateAccountResult>;

  checkAliasByDocument(
    documentInput: string,
    signal?: AbortSignal,
  ): Promise<CheckAliasResult>;

  registerAlias(
    session: SimulationSession,
    aliasValue: string,
    signal?: AbortSignal,
  ): Promise<RegisterAliasResult>;

  updateAliasStatus(
    session: SimulationSession,
    input: UpdateAliasStatusInput,
    signal?: AbortSignal,
  ): Promise<UpdateAliasStatusResult>;

  deleteAlias(
    session: SimulationSession,
    signal?: AbortSignal,
  ): Promise<DeleteAliasResult>;
}
