import type { Meta, StoryObj } from '@storybook/react';
import { PaginationControls } from './PaginationControls';

const meta: Meta<typeof PaginationControls> = {
  title: 'Dashboard/PaginationControls',
  component: PaginationControls,
  args: {
    page: 1,
    totalRows: 100,
    pageSize: 20,
    setPage: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof PaginationControls>;

export const FirstPage: Story = {};

export const MiddlePage: Story = {
  args: { page: 3 },
};

export const LastPage: Story = {
  args: { page: 5 },
};

export const SinglePage: Story = {
  args: { totalRows: 10, pageSize: 20 },
};

export const LargeDataset: Story = {
  args: { page: 1, totalRows: 200, pageSize: 50 },
};
