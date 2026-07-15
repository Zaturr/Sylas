import type { Account } from '../../../../domain/account';
import type { Customer } from '../../../../domain/user';

export type AliasBankLinkDetail = {
  bank_id: string;
  account_id: string;
  status: string;
};

export type ResolveAliasResponse = {
  alias?: string | null;
  alias_status?: string | null;
  account_id?: string | null;
  bank_links?: AliasBankLinkDetail[];
  customer: Customer;
  accounts: Account[];
};

export type ResolveByDocumentResult =
  | { ok: true; data: ResolveAliasResponse }
  | { ok: false; status: number; message: string };
