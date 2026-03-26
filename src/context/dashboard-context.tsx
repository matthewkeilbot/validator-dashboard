import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { readQueryState, writeQueryState } from '@/lib/queryParams';
import { parseValidatorInputSafe } from '@/lib/validators';
import { loadAllValidators } from '@/services/dashboard-orchestrator';
import { aggregateTotals } from '@/services/rewards-service';
import type {
  RpcConfig,
  ValidatorLoadState,
  ValidatorRow,
  ValidatorTotals,
  YieldMode,
} from '@/types';

interface DashboardContextValue {
  // Inputs
  validatorInput: string;
  validatorIndices: number[];
  inputCapped: boolean;
  inputRequestedCount: number;
  setValidatorInput: (value: string) => void;
  rpcConfig: RpcConfig;
  setRpcConfig: (value: RpcConfig) => void;
  yieldMode: YieldMode;
  setYieldMode: (value: YieldMode) => void;
  pageSize: number;
  setPageSize: (value: number) => void;
  page: number;
  setPage: (value: number) => void;
  mock: boolean;
  setMock: (value: boolean) => void;
  // Data
  rows: ValidatorRow[];
  pagedRows: ValidatorRow[];
  totals: ValidatorTotals;
  validatorLoadStates: Record<number, ValidatorLoadState>;
  // Status
  globalLoading: boolean;
  error: string | null;
  // Actions
  refresh: () => void;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(
  undefined,
);

const defaults = {
  elRpc: 'https://ethereum-rpc.publicnode.com',
  clRpc: 'https://ethereum-beacon-api.publicnode.com',
};

const emptyTotals: ValidatorTotals = {
  count: 0,
  principalEth: 0,
  effectiveBalanceEth: 0,
  currentBalanceEth: 0,
  rewardsEarnedEth: 0,
  inflowsEth: 0,
  outflowsEth: 0,
  rocketPoolRplRewards: 0,
};

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const initial = readQueryState(defaults);

  // Input state
  const [validatorInput, setValidatorInput] = useState(initial.validatorInput);
  const [rpcConfig, setRpcConfig] = useState<RpcConfig>(initial.rpcConfig);
  const [yieldMode, setYieldMode] = useState<YieldMode>(initial.yieldMode);
  const [pageSize, setPageSize] = useState(initial.pageSize);
  const [page, setPage] = useState(initial.page);
  const [mock, setMock] = useState(initial.mock);

  // Parsed indices (derived from input, capped)
  const parsed = useMemo(
    () => parseValidatorInputSafe(validatorInput),
    [validatorInput],
  );

  // Data state — pure store, no logic
  const [rows, setRows] = useState<ValidatorRow[]>([]);
  const [validatorLoadStates, setValidatorLoadStates] = useState<
    Record<number, ValidatorLoadState>
  >({});
  const [globalLoading, setGlobalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref to track in-flight loads for cancellation
  const loadIdRef = useRef(0);

  // Sync query params (no auto-refresh — just bookmarkability)
  useEffect(() => {
    writeQueryState({
      validatorIndices: parsed.indices,
      rpcConfig,
      yieldMode,
      pageSize,
      page,
      mock,
    });
  }, [parsed.indices, rpcConfig, yieldMode, pageSize, page, mock]);

  // Reset page when input changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — reset page on input change
  useEffect(() => {
    setPage(1);
  }, [validatorInput]);

  // Explicit refresh — NOT triggered by dependency changes
  const refresh = useCallback(() => {
    const currentLoadId = ++loadIdRef.current;

    // Clear previous data
    setRows([]);
    setValidatorLoadStates({});

    void loadAllValidators(parsed.indices, rpcConfig, yieldMode, mock, {
      onValidatorLoaded: (row) => {
        if (loadIdRef.current !== currentLoadId) return; // stale
        setRows((prev) => {
          const existing = prev.findIndex((r) => r.index === row.index);
          if (existing >= 0) {
            const next = [...prev];
            next[existing] = row;
            return next;
          }
          return [...prev, row].sort((a, b) => a.index - b.index);
        });
      },
      onValidatorError: (_index, _error) => {
        if (loadIdRef.current !== currentLoadId) return;
        // Individual errors are tracked via load states
      },
      onLoadStateChange: (index, state) => {
        if (loadIdRef.current !== currentLoadId) return;
        setValidatorLoadStates((prev) => ({ ...prev, [index]: state }));
      },
      onGlobalLoadingChange: (loading) => {
        if (loadIdRef.current !== currentLoadId) return;
        setGlobalLoading(loading);
      },
      onGlobalError: (err) => {
        if (loadIdRef.current !== currentLoadId) return;
        setError(err);
      },
    });
  }, [parsed.indices, rpcConfig, yieldMode, mock]);

  // Auto-refresh on first mount only (if there are validators in the URL)
  const hasAutoRefreshed = useRef(false);
  useEffect(() => {
    if (!hasAutoRefreshed.current && parsed.indices.length > 0) {
      hasAutoRefreshed.current = true;
      refresh();
    }
  }, [parsed.indices.length, refresh]);

  // Derived data
  const totals = useMemo(
    () => (rows.length > 0 ? aggregateTotals(rows) : emptyTotals),
    [rows],
  );

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  const value: DashboardContextValue = {
    validatorInput,
    validatorIndices: parsed.indices,
    inputCapped: parsed.capped,
    inputRequestedCount: parsed.requestedCount,
    setValidatorInput,
    rpcConfig,
    setRpcConfig,
    yieldMode,
    setYieldMode,
    pageSize,
    setPageSize,
    page,
    setPage,
    mock,
    setMock,
    rows,
    pagedRows,
    totals,
    validatorLoadStates,
    globalLoading,
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
