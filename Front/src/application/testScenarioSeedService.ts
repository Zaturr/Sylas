import type { TestScenarioConfig } from '../adapters/api/app.config';

export type TestScenarioSeedRequest = {
  user_bank_id: string;
  account_type: string;
  scenarios: TestScenarioConfig[];
};

export type TestScenarioSeedResponse = {
  message: string;
  created: number;
  updated: number;
  skipped: number;
  purged: number;
  total: number;
  errors?: string[];
};

export interface TestScenarioSeedService {
  seedTestScenarios(
    request: TestScenarioSeedRequest,
    signal?: AbortSignal,
  ): Promise<TestScenarioSeedResponse>;
}
