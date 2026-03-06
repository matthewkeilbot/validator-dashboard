import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { loadValidators } from '@/lib/ethereum';
import { readQueryState, writeQueryState } from '@/lib/queryParams';
import { parseValidatorInput } from '@/lib/validators';
import { aggregateTotals } from '@/lib/yield';
import type {
  RpcConfig,
  ValidatorRow,
  ValidatorTotals,
  YieldMode,
} from '@/types';

interface DashboardContextValue {
  validatorInput: string;
  validatorIndices: number[];
  setValidatorInput: (value: string) => void;
  rpcConfig: RpcConfig;
  setRpcConfig: (value: RpcConfig) => void;
  yieldMode: YieldMode;
  setYieldMode: (value: YieldMode) => void;
  pageSize: number;
  setPageSize: (value: number) => void;
  page: number;
  setPage: (value: number) => void;
  rows: ValidatorRow[];
  pagedRows: ValidatorRow[];
  totals: ValidatorTotals;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(
  undefined,
);

const defaults = {
  elRpc: 'https://ethereum-rpc.publicnode.com',
  clRpc: 'https://ethereum-beacon-api.publicnode.com',
};

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const initial = readQueryState(defaults);
  const [validatorInput, setValidatorInput] = useState(initial.validatorInput);
  const [validatorIndices, setValidatorIndices] = useState<number[]>(
    initial.validatorIndices,
  );
  const [rpcConfig, setRpcConfig] = useState<RpcConfig>(initial.rpcConfig);
  const [yieldMode, setYieldMode] = useState<YieldMode>(initial.yieldMode);
  const [pageSize, setPageSize] = useState(initial.pageSize);
  const [page, setPage] = useState(initial.page);
  const [rows, setRows] = useState<ValidatorRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValidatorIndices(parseValidatorInput(validatorInput));
    setPage(1);
  }, [validatorInput]);

  useEffect(() => {
    writeQueryState({ validatorIndices, rpcConfig, yieldMode, pageSize, page });
  }, [validatorIndices, rpcConfig, yieldMode, pageSize, page]);

  const refresh = useCallback(async () => {
    if (!validatorIndices.length) {
      setRows([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await loadValidators(validatorIndices, rpcConfig, yieldMode);
      setRows(data);
    } catch (unknownError) {
      const message =
        unknownError instanceof Error ? unknownError.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [validatorIndices, rpcConfig, yieldMode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const totals = useMemo(() => aggregateTotals(rows), [rows]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  const value: DashboardContextValue = {
    validatorInput,
    validatorIndices,
    setValidatorInput,
    rpcConfig,
    setRpcConfig,
    yieldMode,
    setYieldMode,
    pageSize,
    setPageSize,
    page,
    setPage,
    rows,
    pagedRows,
    totals,
    loading,
    error,
    refresh,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}
