import type { Meta, StoryObj } from '@storybook/react';
import type { ValidatorRow, ValidatorTotals } from '@/types';
import { ValidatorTable } from './ValidatorTable';

const mockRows: ValidatorRow[] = [
  {
    index: 1,
    pubkey: '0xaabb01',
    withdrawalAddress: '0x1234567890abcdef1234567890abcdef12345678',
    status: 'active_ongoing',
    protocolTag: 'native',
    effectiveBalanceEth: 32,
    principalEth: 32,
    currentBalanceEth: 33.2,
    rewardsEarnedEth: 1.2,
    inflowsEth: 0.8,
    outflowsEth: 0,
    rocketPoolRplRewards: 0,
  },
  {
    index: 5,
    pubkey: '0xccdd05',
    withdrawalAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    status: 'active_ongoing',
    protocolTag: 'rocketpool',
    effectiveBalanceEth: 32,
    principalEth: 32,
    currentBalanceEth: 32.8,
    rewardsEarnedEth: 0.8,
    inflowsEth: 0.4,
    outflowsEth: 0.1,
    rocketPoolRplRewards: 3.5,
  },
  {
    index: 12,
    pubkey: '0xeeff12',
    withdrawalAddress: '0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1',
    status: 'active_ongoing',
    protocolTag: 'lido',
    effectiveBalanceEth: 32,
    principalEth: 32,
    currentBalanceEth: 33.5,
    rewardsEarnedEth: 1.5,
    inflowsEth: 1.0,
    outflowsEth: 0,
    rocketPoolRplRewards: 0,
  },
];

const mockTotals: ValidatorTotals = {
  count: 3,
  principalEth: 96,
  effectiveBalanceEth: 96,
  currentBalanceEth: 99.5,
  rewardsEarnedEth: 3.5,
  inflowsEth: 2.2,
  outflowsEth: 0.1,
  rocketPoolRplRewards: 3.5,
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

const meta: Meta<typeof ValidatorTable> = {
  title: 'Dashboard/ValidatorTable',
  component: ValidatorTable,
};

export default meta;
type Story = StoryObj<typeof ValidatorTable>;

export const WithData: Story = {
  args: {
    rows: mockRows,
    totals: mockTotals,
    onSelectRow: () => {},
    loading: false,
  },
};

export const Loading: Story = {
  args: {
    rows: [],
    totals: emptyTotals,
    onSelectRow: () => {},
    loading: true,
  },
};

export const PartiallyLoaded: Story = {
  args: {
    rows: [mockRows[0]],
    totals: { ...emptyTotals, count: 1, principalEth: 32, currentBalanceEth: 33.2, rewardsEarnedEth: 1.2 },
    onSelectRow: () => {},
    loading: true,
    loadStates: {
      1: { status: 'loaded' },
      5: { status: 'loading' },
      12: { status: 'loading' },
    },
  },
};

export const WithErrors: Story = {
  args: {
    rows: [mockRows[0]],
    totals: { ...emptyTotals, count: 1, principalEth: 32, currentBalanceEth: 33.2, rewardsEarnedEth: 1.2 },
    onSelectRow: () => {},
    loading: false,
    loadStates: {
      1: { status: 'loaded' },
      5: { status: 'error', error: 'RPC timeout' },
    },
  },
};

export const Empty: Story = {
  args: {
    rows: [],
    totals: emptyTotals,
    onSelectRow: () => {},
    loading: false,
  },
};
