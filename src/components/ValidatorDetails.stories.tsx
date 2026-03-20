import type { Meta, StoryObj } from '@storybook/react';
import type { ValidatorRow } from '@/types';
import { ValidatorDetails } from './ValidatorDetails';

const mockRow: ValidatorRow = {
  index: 5,
  pubkey:
    '0xaabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff0011223344556677',
  withdrawalAddress: '0x1234567890abcdef1234567890abcdef12345678',
  validatorRewardsAddress: '0x1234567890abcdef1234567890abcdef12345678',
  attributionSource:
    'Direct beacon withdrawal-credential address (EOA) via 0x01 credentials',
  status: 'active_ongoing',
  protocolTag: 'native',
  effectiveBalanceEth: 32,
  principalEth: 32,
  currentBalanceEth: 33.2,
  rewardsEarnedEth: 1.2,
  inflowsEth: 0.8,
  outflowsEth: 0,
  rocketPoolRplRewards: 0,
  notes: 'Native validator flow: rewards go directly to the withdrawal address.',
};

const meta: Meta<typeof ValidatorDetails> = {
  title: 'Dashboard/ValidatorDetails',
  component: ValidatorDetails,
};

export default meta;
type Story = StoryObj<typeof ValidatorDetails>;

export const Default: Story = {
  args: {
    row: mockRow,
    yieldMode: 'lifetime',
    onClose: () => {},
  },
};

export const RocketPool: Story = {
  args: {
    row: {
      ...mockRow,
      protocolTag: 'rocketpool',
      rocketPoolRplRewards: 8.5,
      attributionSource: 'Rocket Pool minipool proof',
      notes: 'Rewards route through minipool contract.',
    },
    yieldMode: 'annual',
    onClose: () => {},
  },
};

export const Loading: Story = {
  args: {
    row: mockRow,
    yieldMode: 'lifetime',
    onClose: () => {},
    loading: true,
  },
};

export const DailyYield: Story = {
  args: {
    row: mockRow,
    yieldMode: 'daily',
    onClose: () => {},
  },
};
