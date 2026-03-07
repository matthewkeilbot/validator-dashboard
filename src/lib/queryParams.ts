import type { RpcConfig, YieldMode } from '@/types';
import { compressValidatorRanges, parseValidatorInput } from './validators';

const validYieldModes: YieldMode[] = ['daily', 'monthly', 'annual', 'lifetime'];

export interface QueryState {
  validatorInput: string;
  validatorIndices: number[];
  rpcConfig: RpcConfig;
  yieldMode: YieldMode;
  pageSize: number;
  page: number;
  mock: boolean;
}

export function readQueryState(defaults: RpcConfig): QueryState {
  const params = new URLSearchParams(window.location.search);
  const validatorInput = params.get('validators') ?? '';
  const validatorIndices = parseValidatorInput(validatorInput);
  const yieldCandidate = params.get('yieldMode');
  const yieldMode = validYieldModes.includes(yieldCandidate as YieldMode)
    ? (yieldCandidate as YieldMode)
    : 'lifetime';
  const pageSizeRaw = Number.parseInt(params.get('pageSize') ?? '20', 10);
  const pageRaw = Number.parseInt(params.get('page') ?? '1', 10);

  return {
    validatorInput,
    validatorIndices,
    rpcConfig: {
      elRpc: params.get('elRpc') ?? defaults.elRpc,
      clRpc: params.get('clRpc') ?? defaults.clRpc,
    },
    yieldMode,
    pageSize: [20, 50, 100].includes(pageSizeRaw) ? pageSizeRaw : 20,
    page: Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1,
    mock: params.get('mock') === '1' || params.get('mock') === 'true',
  };
}

export function writeQueryState(state: {
  validatorIndices: number[];
  rpcConfig: RpcConfig;
  yieldMode: YieldMode;
  pageSize: number;
  page: number;
  mock: boolean;
}) {
  const params = new URLSearchParams(window.location.search);

  const validators = compressValidatorRanges(state.validatorIndices);
  if (validators) params.set('validators', validators);
  else params.delete('validators');

  if (state.rpcConfig.elRpc) params.set('elRpc', state.rpcConfig.elRpc);
  else params.delete('elRpc');

  if (state.rpcConfig.clRpc) params.set('clRpc', state.rpcConfig.clRpc);
  else params.delete('clRpc');

  params.set('yieldMode', state.yieldMode);
  params.set('pageSize', String(state.pageSize));
  params.set('page', String(state.page));

  if (state.mock) params.set('mock', '1');
  else params.delete('mock');

  const search = params.toString();
  const newUrl = `${window.location.pathname}${search ? `?${search}` : ''}`;
  window.history.replaceState({}, '', newUrl);
}
