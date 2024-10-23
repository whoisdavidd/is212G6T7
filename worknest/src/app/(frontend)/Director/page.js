"use client";
import React from 'react';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import ManagerTable from '../components/ManagerTable';
import '../../styles/App.css';

function Director() {
    return (
        <div className="App">
            <ResponsiveAppBar />
            <div className="staff-calendar-page">
                <div className="main-content">
                    <ManagerTable />
                </div>
            </div>
        </div>
    );
}

export default Director;