import { ethers } from 'ethers';
import type { RpcConfig, ValidatorRow, YieldMode } from '@/types';

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

const RPL_TOKEN_MAINNET = '0xD33526068D116cE69F19A9ee46F0bd304F21A51f';
const LIDO_WITHDRAWAL_VAULT = ethers.getAddress(
  '0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1',
);
const ROCKET_POOL_REWARDS_ADDRESS = 'Rocket Pool protocol distribution';
const ERC20_TRANSFER_TOPIC = ethers.id('Transfer(address,address,uint256)');

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
  withdrawalAddress: string | undefined,
  mode: YieldMode,
): Promise<number> {
  if (!withdrawalAddress) return 0;

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
        ethers.zeroPadValue(withdrawalAddress, 32),
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

      const withdrawalAddress = withdrawalCredentialsToAddress(
        validator?.withdrawal_credentials,
      );
      let inflowsEth = 0;
      if (withdrawalAddress) {
        try {
          inflowsEth = Number(
            ethers.formatEther(await provider.getBalance(withdrawalAddress)),
          );
        } catch {
          inflowsEth = 0;
        }
      }

      const rocketPoolRplRewards = await estimateRplRewards(
        provider,
        withdrawalAddress,
        mode,
      );

      const protocolTag = !withdrawalAddress
        ? 'unknown'
        : withdrawalAddress === LIDO_WITHDRAWAL_VAULT
          ? 'lido'
          : rocketPoolRplRewards > 0
            ? 'rocketpool'
            : 'native';

      const validatorRewardsAddress =
        protocolTag === 'rocketpool'
          ? ROCKET_POOL_REWARDS_ADDRESS
          : withdrawalAddress;

      return {
        index,
        pubkey: validator?.pubkey,
        withdrawalAddress,
        validatorRewardsAddress,
        status: beacon.data?.status,
        effectiveBalanceEth,
        principalEth,
        currentBalanceEth,
        rewardsEarnedEth,
        inflowsEth,
        outflowsEth: 0,
        rocketPoolRplRewards,
        protocolTag,
        notes:
          'Withdrawal address is operator destination. For Rocket Pool validators, consensus rewards route through Rocket Pool first, then operator share flows to withdrawal address.',
      } satisfies ValidatorRow;
    }),
  );

  return rows;
}
