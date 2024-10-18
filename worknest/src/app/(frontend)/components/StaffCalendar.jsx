import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Button, ButtonGroup } from '@mui/material';

export default function StaffCalendar({ onViewChange }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
//   const staff_id = sessionStorage.getItem("staff_id");
  const [staffId, setStaffId] = useState(null); 

  useEffect(() => {
    // Ensure sessionStorage is available only in the client
    if (typeof window !== 'undefined') {
      const storedStaffId = sessionStorage.getItem('staff_id');
      setStaffId(storedStaffId);
    }
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`http://localhost:5003/request/staff/${staff_id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch requests');
        }
        const data = await response.json();
        console.log('API Response Data:', data);

        // Map requests to events format for FullCalendar
        const mappedEvents = data
          .filter(request => request.status !== 'Withdrawn' && request.status !== 'Cancelled')
          .flatMap(request => {
            const startDate = new Date(request.start_date);
            const duration = request.duration || 1; // Default to 1 day if duration is not provided
            const recurringDays = request.recurring_days || []; // Ensure this is an array

            // Generate events for recurring days
            return recurringDays.flatMap(day => {
              const eventsForDays = [];

              // Loop to generate events for the next 4 weeks (adjust as necessary)
              for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
                const eventDate = new Date(startDate);
                // Calculate the day for this week offset
                const daysUntilNextOccurrence = (day + 7 * weekOffset) - startDate.getDay();
                eventDate.setDate(startDate.getDate() + daysUntilNextOccurrence);

                // Only add if the eventDate is valid (after the start date)
                if (eventDate >= startDate) {
                  const endDate = new Date(eventDate);
                  endDate.setDate(eventDate.getDate() + duration); // Calculate end date based on duration

                  eventsForDays.push({
                    id: String(request.staff_id),
                    title: `${request.reason} - ${request.status}`,
                    start: eventDate.toISOString().split('T')[0], // Format to 'YYYY-MM-DD'
                    end: endDate.toISOString().split('T')[0],
                    extendedProps: {
                      type: request.reason.toLowerCase() === 'wfh' ? 'wfh' : 'general',
                      status: request.status,
                    },
                  });
                }
              }

              return eventsForDays;
            });
          });

        console.log('Mapped Events:', mappedEvents);
        setEvents(mappedEvents);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching requests:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchRequests();
  }, [staffId]);

  if (loading) return <div>Loading requests...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <ButtonGroup variant="contained" aria-label="outlined primary button group">
        <Button onClick={() => handleViewChange('personal')}>Personal Schedule</Button>
        <Button onClick={() => handleViewChange('team')}>Team Schedule</Button>
      </ButtonGroup>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        contentHeight="auto"
        events={events}
        eventContent={renderEventContent}
      />
      {events.length === 0 && <div>No requests found.</div>}
    </>
  );
}

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
