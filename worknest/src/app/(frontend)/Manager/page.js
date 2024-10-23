"use client";
import React from 'react';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import Sidebar from '../components/Sidebar';
import ManagerTable from '../components/ManagerDashboard';
import '../../styles/App.css';

function Manager() {
    return (
        <div className="App">
            <ResponsiveAppBar />
            <div className="staff-calendar-page">
                <Sidebar />
                <div className="main-content">
                    <ManagerTable />
                </div>
            </div>
        </div>
    );
}

export default Manager;
