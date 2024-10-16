// /pages/Manager/view-requests.js
"use client"; // This is used if you're using React's new features
import React from 'react';
import ResponsiveAppBar from '../../components/ResponsiveAppBar';
import Sidebar from '../../components/Sidebar';
import ManagerViewRequests from '../../components/ManagerViewRequests'; // Ensure this component exists
import '../../../styles/App.css';

const ViewRequests = () => {
    return (
        <div className="App">
            <ResponsiveAppBar />
            <div className="staff-calendar-page">
                <Sidebar />
                <div className="main-content">
                    <ManagerViewRequests /> {/* Ensure this component works */}
                </div>
            </div>
        </div>
    );
};

export default ViewRequests;
