"use client";
import React, { useState } from 'react';
import StaffCalendarPage from '../components/StaffCalendarPage';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import StaffCalendar from '../components/StaffCalendar';
import Summary from '../components/Summary';

function App() {
  return (
    <div className="App">
      <ResponsiveAppBar />
      {/* <StaffCalendarPage /> */}
      <StaffCalendar />
      {/* <Summary /> */}

    </div>
  );
}

export default App;