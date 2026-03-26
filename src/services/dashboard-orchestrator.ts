import { loadMockValidators } from '@/lib/mock';
import type {
  BeaconValidatorData,
  RpcConfig,
  ValidatorLoadState,
  ValidatorRow,
  YieldMode,
} from '@/types';
import {
  detectAttribution,
  withdrawalCredentialsToAddress,
} from './attribution-service';
import { estimateRplRewards, getAddressBalance } from './rewards-service';
import { createConcurrencyLimiter } from './rpc-service';
import { fetchValidatorData } from './validator-service';

const MAX_CONCURRENT_RPC = 5;

export interface OrchestratorCallbacks {
  onValidatorLoaded: (row: ValidatorRow) => void;
  onValidatorError: (index: number, error: string) => void;
  onLoadStateChange: (index: number, state: ValidatorLoadState) => void;
  onGlobalLoadingChange: (loading: boolean) => void;
  onGlobalError: (error: string | null) => void;
}

/**
 * Build a single ValidatorRow from beacon data + EL attribution + rewards.
 */
async function buildValidatorRow(
  beaconData: BeaconValidatorData,
  rpcConfig: RpcConfig,
  yieldMode: YieldMode,
): Promise<ValidatorRow> {
  const effectiveBalanceEth = Number(beaconData.effectiveBalance ?? '0') / 1e9;
  const currentBalanceEth =
    Number(beaconData.balance ?? beaconData.effectiveBalance ?? '0') / 1e9;
  const principalEth = 32;
  const rewardsEarnedEth = Math.max(0, currentBalanceEth - principalEth);

  const credentialAddress = withdrawalCredentialsToAddress(
    beaconData.withdrawalCredentials,
  );

  const attribution = await detectAttribution(
    rpcConfig.elRpc,
    credentialAddress,
  );

  let inflowsEth = 0;
  if (attribution.withdrawalAddress) {
    inflowsEth = await getAddressBalance(
      rpcConfig.elRpc,
      attribution.withdrawalAddress,
    );
  }

  const rocketPoolRplRewards = await estimateRplRewards(
    rpcConfig.elRpc,
    attribution.withdrawalAddress,
    yieldMode,
  );

  return {
    index: beaconData.index,
    pubkey: beaconData.pubkey,
    withdrawalAddress: attribution.withdrawalAddress,
    validatorRewardsAddress: attribution.validatorRewardsAddress,
    attributionSource: attribution.attributionSource,
    status: beaconData.status,
    effectiveBalanceEth,
    principalEth,
    currentBalanceEth,
    rewardsEarnedEth,
    inflowsEth,
    outflowsEth: 0,
    rocketPoolRplRewards,
    protocolTag: attribution.protocolTag,
    notes: attribution.notes,
  };
}

/**
 * Load all validators iteratively with concurrency limiting.
 * Calls back after each validator loads so the UI can update progressively.
 */
export async function loadAllValidators(
  indices: number[],
  rpcConfig: RpcConfig,
  yieldMode: YieldMode,
  mock: boolean,
  callbacks: OrchestratorCallbacks,
): Promise<void> {
  if (indices.length === 0) {
    callbacks.onGlobalLoadingChange(false);
    callbacks.onGlobalError(null);
    return;
  }

  callbacks.onGlobalLoadingChange(true);
  callbacks.onGlobalError(null);

  // Mark all as loading
  for (const index of indices) {
    callbacks.onLoadStateChange(index, { status: 'loading' });
  }

  if (mock) {
    const rows = loadMockValidators(indices, yieldMode);
    for (const row of rows) {
      callbacks.onValidatorLoaded(row);
      callbacks.onLoadStateChange(row.index, { status: 'loaded' });
    }
    callbacks.onGlobalLoadingChange(false);
    return;
  }

  const limiter = createConcurrencyLimiter(MAX_CONCURRENT_RPC);
  let errorCount = 0;

  await Promise.all(
    indices.map((index) =>
      limiter(async () => {
        try {
          const beaconData = await fetchValidatorData(rpcConfig.clRpc, index);
          const row = await buildValidatorRow(beaconData, rpcConfig, yieldMode);
          callbacks.onValidatorLoaded(row);
          callbacks.onLoadStateChange(index, { status: 'loaded' });
        } catch (err) {
          errorCount++;
          const message = err instanceof Error ? err.message : 'Unknown error';
          callbacks.onValidatorError(index, message);
          callbacks.onLoadStateChange(index, {
            status: 'error',
            error: message,
          });
        }
      }),
    ),
  );

  if (errorCount === indices.length) {
    callbacks.onGlobalError(
      `All ${errorCount} validators failed to load. Check your RPC endpoints.`,
    );
  } else if (errorCount > 0) {
    callbacks.onGlobalError(
      `${errorCount} of ${indices.length} validators failed to load.`,
    );
  }

  callbacks.onGlobalLoadingChange(false);
}
