"use client";
import React, { useState } from 'react';
import StaffCalendarPage from '../components/StaffCalendarPage';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import StaffCalendar from '../components/StaffCalendar';
import { Grid2 } from '@mui/material';
import StaffSchedule from '../components/StaffSchedule';
import Summary from '../components/Summary';

function Staff() {
  return (
    <div className="App">
      <ResponsiveAppBar />
      {/* <StaffCalendarPage /> */}
      <StaffCalendar />
      <Summary />

    </div>
  );
}
export default Staff;

