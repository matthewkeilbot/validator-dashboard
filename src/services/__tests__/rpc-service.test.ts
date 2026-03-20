import { describe, expect, it, afterEach } from 'vitest';
import {
  clearProviderCache,
  createConcurrencyLimiter,
  getProvider,
} from '../rpc-service';

afterEach(() => {
  clearProviderCache();
});

describe('getProvider', () => {
  it('returns a provider instance', () => {
    const provider = getProvider('https://ethereum-rpc.publicnode.com');
    expect(provider).toBeDefined();
  });

  it('returns the same instance for the same URL (singleton)', () => {
    const a = getProvider('https://ethereum-rpc.publicnode.com');
    const b = getProvider('https://ethereum-rpc.publicnode.com');
    expect(a).toBe(b);
  });

  it('returns different instances for different URLs', () => {
    const a = getProvider('https://ethereum-rpc.publicnode.com');
    const b = getProvider('https://rpc.ankr.com/eth');
    expect(a).not.toBe(b);
  });
});

describe('createConcurrencyLimiter', () => {
  it('limits concurrent execution', async () => {
    const limiter = createConcurrencyLimiter(2);
    let running = 0;
    let maxRunning = 0;

    const task = () =>
      limiter(async () => {
        running++;
        maxRunning = Math.max(maxRunning, running);
        await new Promise((r) => setTimeout(r, 50));
        running--;
        return running;
      });

    await Promise.all([task(), task(), task(), task(), task()]);
    expect(maxRunning).toBeLessThanOrEqual(2);
  });

  it('resolves all tasks even under concurrency limit', async () => {
    const limiter = createConcurrencyLimiter(2);
    const results: number[] = [];

    const tasks = Array.from({ length: 5 }, (_, i) =>
      limiter(async () => {
        await new Promise((r) => setTimeout(r, 10));
        results.push(i);
        return i;
      }),
    );

    const returned = await Promise.all(tasks);
    expect(returned).toEqual([0, 1, 2, 3, 4]);
    expect(results).toHaveLength(5);
  });

  it('propagates errors without breaking the queue', async () => {
    const limiter = createConcurrencyLimiter(1);
    const results: string[] = [];

    const p1 = limiter(async () => {
      throw new Error('fail');
    }).catch((e: Error) => {
      results.push(`error:${e.message}`);
    });

    const p2 = limiter(async () => {
      results.push('ok');
    });

    await Promise.all([p1, p2]);
    expect(results).toContain('error:fail');
    expect(results).toContain('ok');
    expect(results).toHaveLength(2);
  });
});
