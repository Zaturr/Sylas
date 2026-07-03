export type RandomizerRequest = {
  total_customers: number;
  max_accounts_per_customer: number;
  banks: Array<{ id: string; name: string }>;
};

export type RandomizerResponse = {
  message: string;
  customers_created: number;
};

export interface RandomizerService {
  generateData(request: RandomizerRequest, signal?: AbortSignal): Promise<RandomizerResponse>;
}
