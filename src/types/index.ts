export type YieldMode = 'daily' | 'monthly' | 'annual' | 'lifetime';

export interface RpcConfig {
  elRpc: string;
  clRpc: string;
}

export type ValidatorType = 'native' | 'rocketpool' | 'lido' | 'unknown';

export interface ValidatorRow {
  index: number;
  pubkey?: string;
  withdrawalAddress?: string;
  validatorRewardsAddress?: string;
  attributionSource?: string;
  status?: string;
  effectiveBalanceEth: number;
  principalEth: number;
  currentBalanceEth: number;
  rewardsEarnedEth: number;
  inflowsEth: number;
  outflowsEth: number;
  rocketPoolRplRewards?: number;
  protocolTag?: ValidatorType;
  notes?: string;
}

export interface ValidatorTotals {
  count: number;
  principalEth: number;
  effectiveBalanceEth: number;
  currentBalanceEth: number;
  rewardsEarnedEth: number;
  inflowsEth: number;
  outflowsEth: number;
  rocketPoolRplRewards: number;
}

export interface ValidatorLoadState {
  status: 'idle' | 'loading' | 'loaded' | 'error';
  error?: string;
}

export interface BeaconValidatorData {
  index: number;
  status?: string;
  pubkey?: string;
  withdrawalCredentials?: string;
  effectiveBalance?: string;
  balance?: string;
}

export interface AttributionResult {
  protocolTag: ValidatorType;
  withdrawalAddress?: string;
  validatorRewardsAddress?: string;
  attributionSource: string;
  notes: string;
}
