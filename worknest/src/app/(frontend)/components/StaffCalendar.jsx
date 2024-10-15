import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function StaffCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch requests for the staff member from Flask API
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`http://localhost:5003/requests`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch requests');
        }
        const data = await response.json();

        // Map requests to events format for FullCalendar
        const mappedEvents = data
          .filter(request => request.status !== 'Withdrawn' && request.status !== 'Cancelled')
          .map(request => {
            const date = new Date(request.start_date);
            const formattedDate = date.toISOString().split('T')[0];
            return {
              id: String(request.staff_id),
              title: `${request.reason} - ${request.status}`,
              start: formattedDate,
              end: formattedDate,
              extendedProps: {
                type: request.reason.toLowerCase() === 'wfh' ? 'wfh' : 'general',
                status: request.status
              }
            };
          });

        setEvents(mappedEvents);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching requests:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) return <div>Loading requests...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        contentHeight="auto"
        events={events}
        eventContent={renderEventContent} // Render custom event content
      />
    </>
  );
}

// Render event content in the calendar
function renderEventContent(eventInfo) {
  const { event } = eventInfo;
  const isWfh = event.extendedProps.type === 'wfh';
  const status = event.extendedProps.status;

  return (
    <>
      <b>{event.title}</b>
      {isWfh && status && <div>Status: {status}</div>}
    </>
  );
}
