import React from 'react';
import HrTable from '@/stories/HrTable';

export default {
  title: 'Components/HrTable',
  component: HrTable,
};

const Template = (args) => <HrTable {...args} />;

// Example rows for the story
const rows = [
  { staff_id: 1, department: 'HR', location: 'New York' },
  { staff_id: 2, department: 'Engineering', location: 'San Francisco' },
  { staff_id: 3, department: 'Finance', location: 'London' },
  { staff_id: 4, department: 'Marketing', location: 'Tokyo' },
  { staff_id: 5, department: 'Operations', location: 'Berlin' },
  { staff_id: 6, department: 'HR', location: 'Toronto' },
  { staff_id: 7, department: 'Finance', location: 'Paris' },
];

export const Default = Template.bind({});
Default.args = {
  rows,  // Pass the example rows
};
