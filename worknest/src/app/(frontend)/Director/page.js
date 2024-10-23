"use client";
import React from 'react';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import DirectorTable from '../components/DirectorTable';
import Sidebar from '../components/Sidebar';
import '../../styles/App.css';

function Director() {
    return (
        <div className="App">
            <ResponsiveAppBar />
            <div className="staff-calendar-page">
                <Sidebar />
                <div className="main-content">
                    <DirectorTable />
                </div>
            </div>
        </div>
    );
}

export default Director;