"use client";
import React from 'react';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import Sidebar from '../components/Sidebar';
import '../../styles/App.css';
import { Button } from '@mui/material';
import ManagerDashboard from '../components/ManagerDashboard';
// import ManagerViewRequests from '../components/ManagerViewRequests';

// function Manager() {
//     return (
//         <div className="App">
//             <ResponsiveAppBar />
//             <div className="staff-calendar-page">
//                 <Sidebar />
//                 <div className="main-content">
//                     <ManagerTable />
//                 </div>
//             </div>
//         </div>
//     );
// }

function Manager() {
    const redirectToStaffPage = () => {
        // Redirect to the Staff page
        window.location.href = "/Staff";
    };

    return (
        <div className="App">
            <ResponsiveAppBar />
            {/* Add a button to redirect to the Staff page */}
            <button onClick={redirectToStaffPage}>
                Go to Staff Page
            </button>
            <div className="staff-calendar-page">
                <Sidebar />
                <div className="main-content">
                    <ManagerDashboard />
                </div>
            </div>
        </div>
    );
}



export default Manager;
