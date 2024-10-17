import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Button, ButtonGroup } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function StaffCalendar() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState('personal'); // 'personal' or 'team'

  const fetchRequests = async (type) => {
    try {
      const staffId = sessionStorage.getItem('staff_id');
      const managerId = sessionStorage.getItem('manager_id');
      const url = type === 'personal'
        ? `http://localhost:5003/requests/${staffId}`
        : `http://localhost:5003/manager_requests/${managerId}`;

      const response = await fetch(url);
      const data = await response.json();

      console.log('Fetched data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch requests');
      }

      if (!Array.isArray(data)) {
        throw new Error('Expected an array of requests');
      }

      const mappedEvents = data
        .filter(request => request.status !== 'Withdrawn' && request.status !== 'Cancelled')
        .map(request => {
          const startDateStr = type === 'personal' ? request.start_date : request.from_date;
          const endDateStr = type === 'personal' ? request.start_date : request.to_date;

          if (!startDateStr || !endDateStr) {
            console.error('Missing date:', request);
            return null;
          }

          const startDate = new Date(startDateStr);
          const endDate = new Date(endDateStr);

          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.error('Invalid date:', startDateStr, endDateStr);
            return null;
          }

          return {
            id: String(request.staff_id),
            title: `${request.reason || request.work_location} - ${request.status}`,
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0],
            extendedProps: {
              type: (request.reason || request.work_location).toLowerCase() === 'wfh' ? 'wfh' : 'general',
              status: request.status
            }
          };
        })
        .filter(event => event !== null); // Filter out invalid events

      setEvents(mappedEvents);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(viewType);
  }, [viewType]);

  const handleViewChange = (type) => {
    if (type === 'personal') {
      setViewType('personal');
    } else {
      // Navigate to the StaffViewRequests page
      router.push('/Staff/viewRequests');
    }
  };

  if (loading) return <div>Loading requests...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
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
    </div>
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
