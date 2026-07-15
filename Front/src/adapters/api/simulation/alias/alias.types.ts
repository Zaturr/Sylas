import type { Account } from '../../../../domain/account';
import type { Customer } from '../../../../domain/user';

export type AliasBankLinkDetail = {
  bank_id: string;
  account_id: string;
  status: string;
};

export type AliasResolveEntry = {
  alias_value: string;
  alias_status: string;
  account_id: string;
  bank_links?: AliasBankLinkDetail[];
};

export type ResolveAliasResponse = {
  alias?: string | null;
  alias_status?: string | null;
  account_id?: string | null;
  bank_links?: AliasBankLinkDetail[];
  aliases?: AliasResolveEntry[];
  is_legal_entity?: boolean;
  document_profile?: 'LEGAL_ENTITY' | 'NATURAL';
  customer: Customer;
  accounts: Account[];
};

export type ResolveByDocumentResult =
  | { ok: true; data: ResolveAliasResponse }
  | { ok: false; status: number; message: string };
