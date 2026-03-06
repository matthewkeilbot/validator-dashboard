export type YieldMode = 'daily' | 'monthly' | 'annual' | 'lifetime';

export interface RpcConfig {
  elRpc: string;
  clRpc: string;
}

export interface ValidatorRow {
  index: number;
  pubkey?: string;
  withdrawalAddress?: string;
  status?: string;
  effectiveBalanceEth: number;
  principalEth: number;
  currentBalanceEth: number;
  rewardsEarnedEth: number;
  inflowsEth: number;
  outflowsEth: number;
  rocketPoolRplRewards?: number;
  protocolTag?: 'rocketpool' | 'unknown';
  notes?: string;
}

export interface ValidatorTotals {
  count: number;
  principalEth: number;
  currentBalanceEth: number;
  rewardsEarnedEth: number;
  inflowsEth: number;
  outflowsEth: number;
  rocketPoolRplRewards: number;
}
