"use client";
import React, { useState } from 'react';
import StaffCalendarPage from '../components/StaffCalendarPage';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import WfhButton from '../components/WfhButton';

function Staff() {
  return (
    <div className="App">
      <ResponsiveAppBar />
      <div>
      <WfhButton />
      </div>
      <StaffCalendarPage />
    </div>
  );
}
export default Staff;

