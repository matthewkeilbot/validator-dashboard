import type { Meta, StoryObj } from '@storybook/react';
import { ControlsPanel } from './ControlsPanel';

const meta: Meta<typeof ControlsPanel> = {
  title: 'Dashboard/ControlsPanel',
  component: ControlsPanel,
  args: {
    validatorInput: '1-7,12-15,20',
    setValidatorInput: () => {},
    elRpc: 'https://ethereum-rpc.publicnode.com',
    setElRpc: () => {},
    clRpc: 'https://ethereum-beacon-api.publicnode.com',
    setClRpc: () => {},
    yieldMode: 'lifetime',
    setYieldMode: () => {},
    pageSize: 20,
    setPageSize: () => {},
    mock: false,
    setMock: () => {},
    onRefresh: () => {},
    loading: false,
  },
};

export default meta;
type Story = StoryObj<typeof ControlsPanel>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true },
};

export const MockMode: Story = {
  args: { mock: true },
};

export const Empty: Story = {
  args: { validatorInput: '' },
};
