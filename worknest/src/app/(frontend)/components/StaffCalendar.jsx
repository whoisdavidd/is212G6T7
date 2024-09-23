import React, { useEffect, useState } from 'react';
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar';
import '@schedule-x/theme-default/dist/index.css';

function StaffCalendar({ staffId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch events for the staff member
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`http://localhost:5000/events/123`);  // Fetch events from Flask API
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        
        // Map data to the calendar's event structure
        const mappedEvents = data.map(event => ({
          id: String(event.event_id),                      // Event ID
          title: event.event_name,                 // Event name mapped to title
          start: event.event_date,       // Assuming event_date is in 'YYYY-MM-DD' format
          end: event.event_date,         // For single-day events, start and end are the same
        }));
        console.log('Mapped Events:', mappedEvents);
        setEvents(mappedEvents);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchEvents();
  }, [staffId]);

  // Calendar setup with fetched events
  const calendar = useCalendarApp({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    events: events,  // Set the fetched events here
  });

  if (loading) return <div>Loading events...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  );
}

export default StaffCalendar;
