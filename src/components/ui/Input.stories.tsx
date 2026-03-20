import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: '1-7,12-15,20' },
};

export const WithValue: Story = {
  args: { value: 'https://ethereum-rpc.publicnode.com' },
};

export const Disabled: Story = {
  args: { value: 'Read-only', disabled: true },
};
