import type { BeaconValidatorData } from '@/types';

interface BeaconApiResponse {
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

/**
 * Fetch a single validator's data from the Beacon API.
 * Returns a normalized BeaconValidatorData object.
 */
export async function fetchValidatorData(
  clRpc: string,
  index: number,
): Promise<BeaconValidatorData> {
  const endpoint = clRpc.replace(/\/$/, '');
  const response = await fetch(
    `${endpoint}/eth/v1/beacon/states/head/validators/${index}`,
  );
  if (!response.ok) {
    throw new Error(
      `CL request failed for validator ${index}: ${response.status}`,
    );
  }

  const json = (await response.json()) as BeaconApiResponse;
  const data = json.data;
  const validator = data?.validator;

  return {
    index,
    status: data?.status,
    pubkey: validator?.pubkey,
    withdrawalCredentials: validator?.withdrawal_credentials,
    effectiveBalance: validator?.effective_balance,
    balance: data?.balance ?? validator?.effective_balance,
  };
}
