import { ethers } from 'ethers';

/** Singleton provider cache — avoids recreating JsonRpcProvider on every call */
const providerCache = new Map<string, ethers.JsonRpcProvider>();

export function getProvider(rpcUrl: string): ethers.JsonRpcProvider {
  let provider = providerCache.get(rpcUrl);
  if (!provider) {
    provider = new ethers.JsonRpcProvider(rpcUrl);
    providerCache.set(rpcUrl, provider);
  }
  return provider;
}

export function clearProviderCache(): void {
  for (const provider of providerCache.values()) {
    provider.destroy();
  }
  providerCache.clear();
}

/**
 * Generic concurrency limiter.
 * Wraps async functions so at most `maxConcurrent` run simultaneously.
 */
export function createConcurrencyLimiter(maxConcurrent: number) {
  let running = 0;
  const queue: Array<() => void> = [];

  return async function limit<T>(fn: () => Promise<T>): Promise<T> {
    if (running >= maxConcurrent) {
      await new Promise<void>((resolve) => queue.push(resolve));
    }
    running++;
    try {
      return await fn();
    } finally {
      running--;
      const next = queue.shift();
      if (next) next();
    }
  };
}
