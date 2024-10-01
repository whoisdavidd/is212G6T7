import React from 'react';
import Sidebar from '@/stories/Sidebar';

export default {
  title: 'Components/Sidebar',
  component: Sidebar,
};

const Template = (args) => <Sidebar {...args} />;

export const Default = Template.bind({});
Default.args = {
  // No args needed as the component doesn't receive any props in this case
};
