import { useEffect, useState } from 'react';
import { ControlsPanel } from '@/components/ControlsPanel';
import { PaginationControls } from '@/components/PaginationControls';
import { ValidatorDetails } from '@/components/ValidatorDetails';
import { ValidatorTable } from '@/components/ValidatorTable';
import { DashboardProvider, useDashboard } from '@/context/dashboard-context';
import type { ValidatorRow } from '@/types';

function DashboardPage() {
  const [selectedRow, setSelectedRow] = useState<ValidatorRow | null>(null);

  const {
    validatorInput,
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
    loading,
    error,
    refresh,
  } = useDashboard();

  useEffect(() => {
    if (!selectedRow) return;
    const match = rows.find((row) => row.index === selectedRow.index) ?? null;
    setSelectedRow(match);
  }, [rows, selectedRow]);

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4 p-4 md:p-8">
        <header>
          <h1 className="text-2xl font-semibold text-amber-400">
            Validator Dashboard
          </h1>
          <p className="text-sm text-zinc-400">
            Mainnet-only. RPL is displayed separately and excluded from ETH
            yield calculations.
          </p>
        </header>

        <ControlsPanel
          validatorInput={validatorInput}
          setValidatorInput={setValidatorInput}
          elRpc={rpcConfig.elRpc}
          setElRpc={(value) => setRpcConfig({ ...rpcConfig, elRpc: value })}
          clRpc={rpcConfig.clRpc}
          setClRpc={(value) => setRpcConfig({ ...rpcConfig, clRpc: value })}
          yieldMode={yieldMode}
          setYieldMode={setYieldMode}
          pageSize={pageSize}
          setPageSize={(value) => {
            setPageSize(value);
            setPage(1);
          }}
          mock={mock}
          setMock={setMock}
          onRefresh={() => void refresh()}
          loading={loading}
        />

        {error ? (
          <div className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">
            Error loading validator data: {error}
          </div>
        ) : null}

        {!loading && rows.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-sm text-zinc-400">
            Enter validator indices (e.g. 1-7,12,20-22) to load data.
          </div>
        ) : null}

        {rows.length > 0 ? (
          <>
            <PaginationControls
              page={page}
              totalRows={rows.length}
              pageSize={pageSize}
              setPage={setPage}
            />
            <ValidatorTable
              rows={pagedRows}
              totals={totals}
              onSelectRow={setSelectedRow}
            />
            {selectedRow ? (
              <ValidatorDetails
                row={selectedRow}
                yieldMode={yieldMode}
                onClose={() => setSelectedRow(null)}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}

export default function App() {
  return (
    <DashboardProvider>
      <DashboardPage />
    </DashboardProvider>
  );
}
