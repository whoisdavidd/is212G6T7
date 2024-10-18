import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Button, ButtonGroup } from '@mui/material';
import axios from 'axios';
import WfhDialog from './WfhDialog';

export default function StaffCalendar({ onViewChange }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [staffId, setStaffId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedStaffId = sessionStorage.getItem('staff_id');
      setStaffId(storedStaffId);
    }
  }, []);

  useEffect(() => {
    if (!staffId) return;

    const fetchRequests = async () => {
      try {
        const response = await fetch(`http://localhost:5003/requests/${staffId}`);
        if (!response.ok) throw new Error('Failed to fetch requests');

        const data = await response.json();
        const mappedEvents = mapRequestsToEvents(data);
        setEvents(mappedEvents);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [staffId]);

  const mapRequestsToEvents = (data) => {
    return data
      .filter(request => request.status !== 'Withdrawn' && request.status !== 'Cancelled')
      .flatMap(request => generateEventsForRequest(request));
  };

  const generateEventsForRequest = (request) => {
    const startDate = new Date(request.start_date);
    const duration = request.duration || 1;
    const recurringDays = request.recurring_days || [];

    return recurringDays.flatMap(day => {
      const eventsForDays = [];
      for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
        const eventDate = new Date(startDate);
        const daysUntilNextOccurrence = (day + 7 * weekOffset) - startDate.getDay();
        eventDate.setDate(startDate.getDate() + daysUntilNextOccurrence);

        if (eventDate >= startDate) {
          const endDate = new Date(eventDate);
          endDate.setDate(eventDate.getDate() + duration);

          eventsForDays.push({
            id: String(request.staff_id),
            title: `${request.reason} - ${request.status}`,
            start: eventDate.toISOString().split('T')[0],
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
  };

  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
    setDialogOpen(true);
  };

  if (loading) return <div>Loading requests...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <ButtonGroup variant="contained" aria-label="outlined primary button group">
        <Button onClick={() => onViewChange('personal')}>Personal Schedule</Button>
        <Button onClick={() => onViewChange('team')}>Team Schedule</Button>
      </ButtonGroup>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        contentHeight="auto"
        events={events}
        dateClick={handleDateClick}
        eventContent={renderEventContent}
      />
      {events.length === 0 && <div>No requests found.</div>}

      <WfhDialog open={dialogOpen} onClose={() => setDialogOpen(false)} initialStartDate={selectedDate} />
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
