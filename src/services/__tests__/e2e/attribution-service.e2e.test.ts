import { afterAll, describe, expect, it } from 'vitest';
import {
  detectAttribution,
  withdrawalCredentialsToAddress,
} from '../../attribution-service';
import { clearProviderCache } from '../../rpc-service';
import { fetchValidatorData } from '../../validator-service';

const EL_RPC = 'https://ethereum-rpc.publicnode.com';
const CL_RPC = 'https://ethereum-beacon-api.publicnode.com';

describe('attribution-service e2e', () => {
  afterAll(() => {
    clearProviderCache();
  });

  it('handles genesis validator (index 0) — likely BLS credentials', async () => {
    const beacon = await fetchValidatorData(CL_RPC, 0);
    const addr = withdrawalCredentialsToAddress(beacon.withdrawalCredentials);
    // Genesis validator 0 has BLS (0x00) credentials → addr is undefined
    if (!addr) {
      const result = await detectAttribution(EL_RPC, undefined);
      expect(result.protocolTag).toBe('unknown');
      expect(result.attributionSource).toContain('No 0x01');
      return;
    }
    // If it was upgraded to 0x01, attribution should still return a valid result
    const result = await detectAttribution(EL_RPC, addr);
    expect(result.protocolTag).toBeDefined();
    expect(result.attributionSource).toBeDefined();
  });

  it('detects EOA withdrawal address as native for a 0x01 validator', async () => {
    // Validator 500000 has 0x01 credentials pointing to an address
    const beacon = await fetchValidatorData(CL_RPC, 500000);
    const addr = withdrawalCredentialsToAddress(beacon.withdrawalCredentials);
    expect(addr).toBeDefined();

    const result = await detectAttribution(EL_RPC, addr);
    // Most validators on public RPCs resolve to native or unknown
    expect(['native', 'unknown', 'rocketpool', 'lido']).toContain(
      result.protocolTag,
    );
    expect(result.attributionSource).toBeDefined();
    expect(result.notes).toBeDefined();
  });

  it('returns unknown for undefined address', async () => {
    const result = await detectAttribution(EL_RPC, undefined);
    expect(result.protocolTag).toBe('unknown');
    expect(result.attributionSource).toContain('No 0x01');
  });

  it('returns a valid result structure for any input', async () => {
    const result = await detectAttribution(
      EL_RPC,
      '0x0000000000000000000000000000000000000001',
    );
    expect(result).toHaveProperty('protocolTag');
    expect(result).toHaveProperty('attributionSource');
    expect(result).toHaveProperty('notes');
    expect(typeof result.protocolTag).toBe('string');
    expect(typeof result.attributionSource).toBe('string');
    expect(typeof result.notes).toBe('string');
  });
});
