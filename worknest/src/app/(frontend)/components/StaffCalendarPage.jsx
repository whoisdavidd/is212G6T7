import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale'; // Locale for date formatting
import Summary from './Summary';
import '../../styles/App.css';

// Configure date-fns as the localizer for React Big Calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const StaffCalendarPage = () => {
  // State for managing events
  const [events, setEvents] = useState([
    {
      title: 'Work From Home',
      start: new Date(2024, 8, 20, 10, 0),
      end: new Date(2024, 8, 20, 14, 0),
    },
    {
      title: 'Office Day',
      start: new Date(2024, 8, 21, 9, 0),
      end: new Date(2024, 8, 21, 17, 0),
    }
  ]);

  // Handler to add events dynamically
  const handleSelectSlot = (slotInfo) => {
    const title = window.prompt("Enter a title for the new event:");  // Prompt user to input event title
    if (title) {
      const newEvent = {
        title,
        start: slotInfo.start,
        end: slotInfo.end,
      };
      setEvents([...events, newEvent]);
    }
  };

  return (
    <div className="staff-calendar-page">
      <div className="main-container">
        <div className="calendar-container">
          <h2>Overview</h2>
          {/* React Big Calendar */}
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            defaultView="month"
            selectable={true}  // Enable date selection
            onSelectSlot={handleSelectSlot}  // Handler for adding events on click
          />
          <div className="action-buttons">
            <button className="btn-request">Request for WFH</button>
            <button className="btn-approval">Pending approval</button>
          </div>
        </div>
        <div className="summary-container">
          <Summary />
        </div>
      </div>
    </div>
  );
};

export default StaffCalendarPage;






