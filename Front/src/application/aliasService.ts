import type { Customer } from "../domain/user";
import type{ Account } from "../domain/account";
import type { Alias, AliasDetail } from "../domain/alias";


export interface CreateFullUserService {
    customer: Omit<Customer, 'id' | 'created_at'>;
    accounts: Omit<Account, 'id' | 'customer_id' | 'created_at'>[];
    alias: Omit<Alias, 'id' | 'customer_id' | 'created_at'>;
}
export interface ResolveAliasService {
    customer: Customer;
    accounts: Account[];
}

export interface AliasService {
    
    getAllAliasDeteails(): Promise<AliasDetail[]>;

    resolveAlias(alias: string): Promise<ResolveAliasService>;
    createFullUser(data: CreateFullUserService): Promise<void>;

    addAccountToCustomer(
        documentNumber: string,
        email: string,
        aliasValue: string,
        account: Omit<Account, 'id' | 'customer_id' | 'created_at'>,
    ): Promise<void>;
}