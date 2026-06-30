import type { Customer } from '../domain/user';
import type { Account } from '../domain/account';
import type { Alias, PaginatedAliasResponse } from '../domain/alias';

export interface CreateFullUserService {
  customer: Omit<Customer, 'id' | 'created_at'>;
  alias: Omit<Alias, 'id' | 'customer_id' | 'created_at'>;
}

export interface ResolveAliasService {
  alias: string;
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

  createFullUser(data: CreateFullUserService): Promise<void>;

  deleteAliasByCustomerId(customerId: string): Promise<void>;

  deleteAliasByValue(aliasValue: string): Promise<void>;

  deleteAllAliases(): Promise<number>;
}
