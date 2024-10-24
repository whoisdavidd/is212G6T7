import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Button, ButtonGroup } from '@mui/material';
import WfhDialog from './WfhDialog';

export default function StaffCalendar({ onViewChange }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [staffId, setStaffId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);

  useEffect(() => {
    const storedStaffId = sessionStorage.getItem('staff_id');
    if (storedStaffId) {
      setStaffId(storedStaffId);
    }
  }, []);

  useEffect(() => {
    if (!staffId) return;

    const fetchRequests = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5003/staffRequests/${staffId}`);
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
    if (!request.requested_dates || !Array.isArray(request.requested_dates)) return [];

    return request.requested_dates.map(date => ({
      id: String(request.request_id),
      title: request.reason,
      start: new Date(date).toISOString(),
      end: new Date(date).toISOString(),
      extendedProps: {
        type: request.reason.toLowerCase() === 'wfh' ? 'wfh' : 'general',
        status: request.status,
      },
    }));
  };

  const handleDateSelect = (selectInfo) => {
    const { startStr, endStr } = selectInfo;
    const newDates = [];
    let currentDate = new Date(startStr);

    while (currentDate < new Date(endStr)) {
      newDates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setSelectedDates(newDates);
  };

  const handleRequestClick = () => {
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
        selectable={true}
        select={handleDateSelect}
        eventContent={renderEventContent}
        selectMirror={true}
        unselectAuto={false}
      />
      {selectedDates.length > 0 && (
        <Button variant="contained" color="primary" onClick={handleRequestClick}>
          Request WFH for Selected Dates
        </Button>
      )}
      <WfhDialog open={dialogOpen} onClose={() => setDialogOpen(false)} selectedDates={selectedDates} />
    </>
  );
}

function renderEventContent(eventInfo) {
  const { event } = eventInfo;
  const isWfh = event.extendedProps.type === 'wfh';
  const status = event.extendedProps.status;

  return (
    <div style={{ 
      padding: '5px', 
      borderRadius: '4px', 
      backgroundColor: isWfh ? '#e0f7fa' : '#fff3e0', 
      whiteSpace: 'nowrap', 
      overflow: 'hidden', 
      textOverflow: 'ellipsis',
      width: '100%', // Ensures the content stretches to fit the box
      boxSizing: 'border-box' // Includes padding in the element's total width
    }}>
      <b>{event.title}</b>
      {status && <div style={{ fontSize: '0.75em', color: '#616161' }}>Status: {status}</div>}
    </div>
  );
}
