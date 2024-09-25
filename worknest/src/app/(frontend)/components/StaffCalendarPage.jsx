import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Sidebar from './Sidebar';
import Summary from './Summary';
import '../../styles/App.css'

const StaffCalendarPage = () => {
  const [date, setDate] = useState(new Date());

  return (
    <div className="staff-calendar-page">
      <Sidebar />
      <div className="main-content">
        <h2>Overview</h2>
        <Calendar onChange={setDate} value={date} />
        <div className="action-buttons">
          <button className="btn-approval">Pending approval</button>
        </div>
      </div>
      <Summary />
    </div>
  );
};

export default StaffCalendarPage;
