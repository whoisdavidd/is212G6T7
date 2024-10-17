"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import ResponsiveAppBar from '../../components/ResponsiveAppBar';
import StaffViewTeamSchedule from '../../components/StaffViewTeamSchedule';
import { Button } from '@mui/material';

function StaffViewRequests() {
  const router = useRouter();

  return (
    <div className="App">
      <ResponsiveAppBar />
      <Button 
        variant="contained" 
        onClick={() => router.back()} 
        style={{ margin: '20px' }}
      >
        Back to Personal Schedule
      </Button>
      <StaffViewTeamSchedule />
    </div>
  );
}

export default StaffViewRequests;
