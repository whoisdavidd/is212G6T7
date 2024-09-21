"use client";
import React, { useState } from 'react';
import StaffCalendarPage from '../components/StaffCalendarPage';
import ResponsiveAppBar from '../components/ResponsiveAppBar';

function Staff() {
  return (
    <div className="App">
      <ResponsiveAppBar />
      <StaffCalendarPage />
    </div>
  );
}
export default Staff;

