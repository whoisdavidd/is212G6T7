"use client";
import React from 'react';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import StaffCalendar from '../components/StaffCalendar';
import StaffSchedule from '../components/StaffSchedule';

import Stack from '@mui/material/Stack';

function Staff() {
  return (
    <div className="App">
      <ResponsiveAppBar />

      <Stack spacing={2} alignItems="center">
        <Stack sx={{ width: '100%', height: '400px', overflow: 'auto' }}>
          <StaffCalendar />
        </Stack>
        <Stack sx={{ width: '100%' }}>
          <StaffSchedule />
        </Stack>
      </Stack>
    </div>
  );
}

export default Staff;
