
"use client";
import React, { useState } from 'react';
import StaffCalendarPage from './(frontend)/components/StaffCalendarPage';
import ResponsiveAppBar from './(frontend)/components/ResponsiveAppBar';

function App() {
  return (
    <div className="App">
      <StaffCalendarPage />
      <ResponsiveAppBar />
    </div>
  );
}

export default App;
