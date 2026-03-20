import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './select';

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  render: (args) => (
    <Select {...args}>
      <option value="daily">Daily</option>
      <option value="monthly">Monthly</option>
      <option value="annual">Annual</option>
      <option value="lifetime">Lifetime</option>
    </Select>
  ),
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {};

export const WithSelection: Story = {
  args: { value: 'annual' },
};
