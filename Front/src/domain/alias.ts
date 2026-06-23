export interface Alias {
    id: string;
    customer_id: string;
    alias_value: string;
    created_at: string;
}
export interface AccountDetail{
    bank: string;
    account_number: string;
}
export interface AliasDetail{
    customer_id: string;
    document_type: string;
    document_number: string;
    first_name: string;
    last_name: string;
    alias: string;
    email: string;
    phone: string;
    accounts: AccountDetail[];
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total_records: number;
    total_pages: number;
}

export interface PaginatedAliasResponse {
    data: AliasDetail[];
    pagination: PaginationMeta;
}