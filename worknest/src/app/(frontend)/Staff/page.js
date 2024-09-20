"use client";
import React, { useState } from 'react';
import StaffCalendarPage from '../components/StaffCalendarPage';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import Test from '../components/Test';

function App() {
  return (
    <div className="App">
      <ResponsiveAppBar />
      <StaffCalendarPage />
      <Test />

    </div>
  );
}

export default App;