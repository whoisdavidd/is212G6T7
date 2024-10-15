"use client";
import React from 'react';
import ResponsiveAppBar from '../../components/ResponsiveAppBar';
import StaffViewTeamSchedule from '../../components/StaffViewTeamSchedule'



function StaffViewRequests() {
  return (
    <div className="App">
      <ResponsiveAppBar />
      <StaffViewTeamSchedule />
    </div>
  );
}

export default StaffViewRequests;