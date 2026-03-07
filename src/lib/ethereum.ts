import { ethers } from 'ethers';
import type {
  RpcConfig,
  ValidatorRow,
  ValidatorType,
  YieldMode,
} from '@/types';

interface BeaconValidatorResponse {
  data?: {
    index?: string;
    status?: string;
    validator?: {
      pubkey?: string;
      withdrawal_credentials?: string;
      effective_balance?: string;
    };
    balance?: string;
  };
}

interface AttributionResult {
  protocolTag: ValidatorType;
  withdrawalAddress?: string;
  validatorRewardsAddress?: string;
  attributionSource: string;
  notes: string;
}

const RPL_TOKEN_MAINNET = '0xD33526068D116cE69F19A9ee46F0bd304F21A51f';
const LIDO_WITHDRAWAL_VAULT = ethers.getAddress(
  '0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1',
);
const ERC20_TRANSFER_TOPIC = ethers.id('Transfer(address,address,uint256)');

const MINIPOOL_ABI = [
  'function getNodeAddress() view returns (address)',
] as const;

function withdrawalCredentialsToAddress(
  credentials?: string,
): string | undefined {
  if (!credentials || !credentials.startsWith('0x') || credentials.length < 42)
    return undefined;
  if (!credentials.startsWith('0x01')) return undefined;
  return ethers.getAddress(`0x${credentials.slice(-40)}`);
}

async function fetchBeaconValidator(
  clRpc: string,
  index: number,
): Promise<BeaconValidatorResponse> {
  const endpoint = clRpc.replace(/\/$/, '');
  const response = await fetch(
    `${endpoint}/eth/v1/beacon/states/head/validators/${index}`,
  );
  if (!response.ok) {
    throw new Error(
      `CL request failed for validator ${index}: ${response.status}`,
    );
  }
  return (await response.json()) as BeaconValidatorResponse;
}

async function estimateRplRewards(
  provider: ethers.JsonRpcProvider,
  operatorWithdrawalAddress: string | undefined,
  mode: YieldMode,
): Promise<number> {
  if (!operatorWithdrawalAddress) return 0;

  const nowBlock = await provider.getBlockNumber();
  const blockWindow =
    mode === 'daily'
      ? 7200
      : mode === 'monthly'
        ? 216000
        : mode === 'annual'
          ? 2628000
          : 2628000;
  const fromBlock = Math.max(0, nowBlock - blockWindow);

  try {
    const inflowLogs = await provider.getLogs({
      fromBlock,
      toBlock: nowBlock,
      address: RPL_TOKEN_MAINNET,
      topics: [
        ERC20_TRANSFER_TOPIC,
        null,
        ethers.zeroPadValue(operatorWithdrawalAddress, 32),
      ],
    });

    let total = 0n;
    for (const log of inflowLogs) {
      total += BigInt(log.data);
    }

    return Number(ethers.formatUnits(total, 18));
  } catch {
    return 0;
  }
}

async function detectAttribution(
  provider: ethers.JsonRpcProvider,
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
    // Not a Rocket Pool minipool contract (or not callable with this ABI).
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
      'Contract-based withdrawal target detected. Protocol attribution is unknown until mapped to a known operator/protocol contract.',
  };
}

export async function loadValidators(
  indices: number[],
  rpcConfig: RpcConfig,
  mode: YieldMode,
): Promise<ValidatorRow[]> {
  const provider = new ethers.JsonRpcProvider(rpcConfig.elRpc);

  const rows = await Promise.all(
    indices.map(async (index) => {
      const beacon = await fetchBeaconValidator(rpcConfig.clRpc, index);
      const validator = beacon.data?.validator;
      const effectiveBalanceEth =
        Number(validator?.effective_balance ?? '0') / 1e9;
      const currentBalanceEth =
        Number(beacon.data?.balance ?? validator?.effective_balance ?? '0') /
        1e9;
      const principalEth = 32;
      const rewardsEarnedEth = Math.max(0, currentBalanceEth - principalEth);

      const credentialAddress = withdrawalCredentialsToAddress(
        validator?.withdrawal_credentials,
      );

      const attribution = await detectAttribution(provider, credentialAddress);

      let inflowsEth = 0;
      if (attribution.withdrawalAddress) {
        try {
          inflowsEth = Number(
            ethers.formatEther(
              await provider.getBalance(attribution.withdrawalAddress),
            ),
          );
        } catch {
          inflowsEth = 0;
        }
      }

      const rocketPoolRplRewards = await estimateRplRewards(
        provider,
        attribution.withdrawalAddress,
        mode,
      );

      return {
        index,
        pubkey: validator?.pubkey,
        withdrawalAddress: attribution.withdrawalAddress,
        validatorRewardsAddress: attribution.validatorRewardsAddress,
        attributionSource: attribution.attributionSource,
        status: beacon.data?.status,
        effectiveBalanceEth,
        principalEth,
        currentBalanceEth,
        rewardsEarnedEth,
        inflowsEth,
        outflowsEth: 0,
        rocketPoolRplRewards,
        protocolTag: attribution.protocolTag,
        notes: attribution.notes,
      } satisfies ValidatorRow;
    }),
  );

  return rows;
}
