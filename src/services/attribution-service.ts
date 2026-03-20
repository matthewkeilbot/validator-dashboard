import { ethers } from 'ethers';
import type { AttributionResult } from '@/types';
import { getProvider } from './rpc-service';

const LIDO_WITHDRAWAL_VAULT = ethers.getAddress(
  '0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1',
);

const MINIPOOL_ABI = [
  'function getNodeAddress() view returns (address)',
] as const;

/**
 * Convert 0x01 withdrawal credentials to an execution-layer address.
 * Returns undefined for BLS (0x00) credentials or malformed inputs.
 */
export function withdrawalCredentialsToAddress(
  credentials?: string,
): string | undefined {
  if (!credentials || !credentials.startsWith('0x') || credentials.length < 42)
    return undefined;
  if (!credentials.startsWith('0x01')) return undefined;
  return ethers.getAddress(`0x${credentials.slice(-40)}`);
}

/**
 * Detect which protocol a validator belongs to by inspecting its
 * withdrawal-credential address on the execution layer.
 */
export async function detectAttribution(
  elRpc: string,
  credentialAddress: string | undefined,
): Promise<AttributionResult> {
  if (!credentialAddress) {
    return {
      protocolTag: 'unknown',
      withdrawalAddress: undefined,
      validatorRewardsAddress: undefined,
      attributionSource: 'No 0x01 execution withdrawal credentials available',
      notes:
        'Could not derive an execution-layer withdrawal address from beacon withdrawal credentials.',
    };
  }

  if (credentialAddress === LIDO_WITHDRAWAL_VAULT) {
    return {
      protocolTag: 'lido',
      withdrawalAddress: credentialAddress,
      validatorRewardsAddress: credentialAddress,
      attributionSource: `Exact match to Lido withdrawal vault ${LIDO_WITHDRAWAL_VAULT}`,
      notes:
        'Lido validator flow detected by canonical withdrawal vault address match.',
    };
  }

  const provider = getProvider(elRpc);

  try {
    const minipool = new ethers.Contract(
      credentialAddress,
      MINIPOOL_ABI,
      provider,
    );
    const nodeAddress = ethers.getAddress(
      (await minipool.getNodeAddress()) as string,
    );

    if (nodeAddress && nodeAddress !== ethers.ZeroAddress) {
      return {
        protocolTag: 'rocketpool',
        withdrawalAddress: nodeAddress,
        validatorRewardsAddress: credentialAddress,
        attributionSource:
          'Rocket Pool minipool proof: getNodeAddress() succeeded on withdrawal-credential contract',
        notes:
          'Consensus rewards route to the Rocket Pool minipool contract, then operator share flows to the node/operator address.',
      };
    }
  } catch {
    // Not a Rocket Pool minipool contract
  }

  const code = await provider.getCode(credentialAddress);
  if (code === '0x') {
    return {
      protocolTag: 'native',
      withdrawalAddress: credentialAddress,
      validatorRewardsAddress: credentialAddress,
      attributionSource:
        'Direct beacon withdrawal-credential address (EOA) via 0x01 credentials',
      notes:
        'Native validator flow: rewards and withdrawals go directly to the execution withdrawal address.',
    };
  }

  return {
    protocolTag: 'unknown',
    withdrawalAddress: credentialAddress,
    validatorRewardsAddress: credentialAddress,
    attributionSource:
      'Execution withdrawal credential points to a contract, but no known Rocket Pool/Lido proof matched',
    notes:
      'Contract-based withdrawal target detected. Protocol attribution is unknown.',
  };
}
