import type { Account } from '../../../../domain/account';
import type { Customer } from '../../../../domain/user';

export type ResolveAliasResponse = {
  alias: string;
  alias_status?: string;
  customer: Customer;
  accounts: Account[];
};

export type ResolveByDocumentResult =
  | { ok: true; data: ResolveAliasResponse }
  | { ok: false; status: number; message: string };
