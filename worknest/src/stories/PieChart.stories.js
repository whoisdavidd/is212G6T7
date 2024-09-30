import React from 'react';
import HrChart from '@/stories/PieChart';

export default {
  title: 'Components/HrChart',
  component: HrChart,
};

const Template = (args) => <HrChart {...args} />;

// Example data for the chart
const data = [
  { id: 'HR', value: 30 },
  { id: 'Engineering', value: 40 },
  { id: 'Finance', value: 20 },
  { id: 'Marketing', value: 10 },
];

export const Default = Template.bind({});
Default.args = {
  data,  // Pass the example data to the chart
};
