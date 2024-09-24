"use client";
import React, { useState } from 'react';
import StaffCalendarPage from '../components/StaffCalendarPage';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import StaffCalendar from '../components/StaffCalendar';
import { Grid2 } from '@mui/material';
import StaffSchedule from '../components/StaffSchedule';

function Staff() {
  return (
    <div className="App">
      <ResponsiveAppBar />
      <Grid2 container spacing={2}>
        <Grid2 size={4}>
        </Grid2>
        <Grid2 size={4}>
          <StaffCalendar />
          <StaffSchedule />
        </Grid2>
        <Grid2 size={4}>
        </Grid2>
      </Grid2>
    </div>
  );
}
export default Staff;

