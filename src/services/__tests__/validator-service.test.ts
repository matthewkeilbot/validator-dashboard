import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchValidatorData } from '../validator-service';

describe('fetchValidatorData', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('parses a valid beacon API response', async () => {
    const mockResponse = {
      data: {
        index: '1',
        status: 'active_ongoing',
        validator: {
          pubkey: '0xaabb',
          withdrawal_credentials: '0x01creds',
          effective_balance: '32000000000',
        },
        balance: '32500000000',
      },
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await fetchValidatorData('https://beacon.example.com', 1);
    expect(result.index).toBe(1);
    expect(result.status).toBe('active_ongoing');
    expect(result.pubkey).toBe('0xaabb');
    expect(result.withdrawalCredentials).toBe('0x01creds');
    expect(result.effectiveBalance).toBe('32000000000');
    expect(result.balance).toBe('32500000000');
  });

  it('throws on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    await expect(
      fetchValidatorData('https://beacon.example.com', 999999),
    ).rejects.toThrow('CL request failed for validator 999999: 404');
  });

  it('falls back to effective_balance when balance is missing', async () => {
    const mockResponse = {
      data: {
        index: '2',
        status: 'active_ongoing',
        validator: {
          pubkey: '0xccdd',
          effective_balance: '32000000000',
        },
      },
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await fetchValidatorData('https://beacon.example.com', 2);
    expect(result.balance).toBe('32000000000');
  });

  it('calls the correct beacon URL', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ data: { index: '5' } }),
    } as Response);

    await fetchValidatorData('https://beacon.example.com/', 5);

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://beacon.example.com/eth/v1/beacon/states/head/validators/5',
    );
  });
});
