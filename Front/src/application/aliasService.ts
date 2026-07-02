import type { Customer } from '../domain/user';
import type { Account } from '../domain/account';
import type { PaginatedAliasResponse } from '../domain/alias';

export interface CreateFullUserService {
  customer: {
    document_type: string;
    document_number: string;
    first_name: string;
    last_name: string;
  };
  alias: {
    alias_value: string;
  };
}

export interface ResolveAliasService {
  alias: string;
  alias_status?: string;
  customer: Customer;
  accounts: Account[];
}

export interface AliasService {
  getAliasDetailsPaginated(
    page: number,
    limit: number,
    search?: string,
    signal?: AbortSignal,
  ): Promise<PaginatedAliasResponse>;

  resolveByDocument(
    documentType: string,
    documentNumber: string,
    signal?: AbortSignal,
  ): Promise<ResolveAliasService>;

  resolveByAliasValue(
    aliasValue: string,
    signal?: AbortSignal,
  ): Promise<ResolveAliasService>;

  createFullUser(data: CreateFullUserService): Promise<void>;

  deleteAliasByCustomerId(customerId: string): Promise<void>;

  deleteAliasByValue(aliasValue: string): Promise<void>;

  deleteAllAliases(): Promise<number>;
}
