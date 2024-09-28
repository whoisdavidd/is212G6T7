import React from 'react';
import ResponsiveAppBar from '@/stories/ResponsiveAppBar';

export default {
  title: 'Components/ResponsiveAppBar',
  component: ResponsiveAppBar,
};

const Template = (args) => <ResponsiveAppBar {...args} />;

export const Default = Template.bind({});
Default.args = {
  // No need for specific args in this case since the state is managed internally
};
