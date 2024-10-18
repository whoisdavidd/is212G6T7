"use client";
import React, { useState } from 'react';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import StaffCalendar from '../components/StaffCalendar';
import StaffSchedule from '../components/StaffSchedule';
import StaffViewTeamSchedule from '../components/StaffViewTeamSchedule';
import WfhButton from '../components/WfhButton';
import Stack from '@mui/material/Stack';

function Staff() {
  const [viewType, setViewType] = useState('personal');

  return (
    <div className="App">
      <ResponsiveAppBar />

      <Stack spacing={2} alignItems="center">
        <Stack sx={{ width: '100%', height: '400px', overflow: 'auto' }}>
          <StaffCalendar onViewChange={setViewType} />
        </Stack>
        <Stack alignItems="flex-start" sx={{ width: '100%' }}>
          <WfhButton />
        </Stack>
        <Stack sx={{ width: '100%' }}>
          {viewType === 'personal' ? <StaffSchedule /> : <StaffViewTeamSchedule />}
        </Stack>
      </Stack>
    </div>
  );
}

export default Staff;
