"use client";
import React from 'react';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import StaffCalendar from '../components/StaffCalendar';
import StaffSchedule from '../components/StaffSchedule';
import WfhButton from '../components/WfhButton';

import Stack from '@mui/material/Stack';


function Staff() {
  return (
    <div className="App">
      <ResponsiveAppBar />

      <Stack spacing={2} alignItems="center"> {/* Centered alignment for the column layout */}
        <Stack sx={{ width: '100%', height: '400px', overflow: 'auto' }}> {/* Fixed height for calendar */}
          <StaffCalendar />
        </Stack>
        <Stack alignItems="flex-start" sx={{ width: '100%' }}>
          <WfhButton/>
        </Stack>
        <Stack sx={{ width: '100%' }}> {/* Schedule takes full width */}
          <StaffSchedule />
        </Stack>
      </Stack>
      {/* <Summary /> */}
    </div>
  );
}

export default Staff;


