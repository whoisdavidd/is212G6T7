"use client";
import React, { useState } from 'react';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import StaffCalendar from '../components/StaffCalendar';
import { Grid2 } from '@mui/material';
import StaffSchedule from '../components/StaffSchedule';
import Summary from '../components/Summary';
import WfhButton from '../components/WfhButton';

function Staff() {
  return (
    <div className="App">
      <ResponsiveAppBar />
      <StaffSchedule />
      <StaffCalendar />
      <Summary />

      <div>
      <WfhButton />
      </div>
      <StaffCalendarPage />
    </div>
  );
}
export default Staff;

