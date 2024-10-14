// import React, { useEffect, useState } from 'react';
// import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import interactionPlugin from '@fullcalendar/interaction';
// import { Button, Modal, Form } from 'react-bootstrap';

// export default function StaffCalendar() {
//   const hardcodedStaffId = 210030; // Hardcoded staff ID
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [newEvent, setNewEvent] = useState({
//     staff_id: hardcodedStaffId,
//     event_name: '',
//     event_date: '',
//     event_type: 'General', // Default event type
//   });

//   // Fetch events for the staff member
//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         // Fetch regular events
//         const eventsResponse = await fetch(`http://localhost:5001/events/${hardcodedStaffId}`);
//         if (!eventsResponse.ok) {
//           throw new Error('Failed to fetch events');
//         }
//         const eventsData = await eventsResponse.json();
  
//         // Fetch WFH events
//         const wfhResponse = await fetch(`http://localhost:5002/wfh/${hardcodedStaffId}`);
//         if (!wfhResponse.ok) {
//           throw new Error('Failed to fetch WFH events');
//         }
//         const wfhData = await wfhResponse.json();
  
//         // Combine and map events
//         const mappedEvents = [
//           ...eventsData.map(event => ({
//             id: String(event.event_id),
//             title: event.event_name,
//             start: event.event_date,
//             end: event.event_date,
//             extendedProps: { type: 'regular' }
//           })),
//           ...wfhData
//             .filter(wfh => !['Cancelled', 'Withdrawn'].includes(wfh.approve_status))
//             .map(wfh => ({
//               id: String(wfh.event_id),
//               title: `WFH: ${wfh.event_name}`,
//               start: wfh.event_date,
//               end: wfh.event_date,
//               extendedProps: { type: 'wfh', status: wfh.approve_status }
//             }))
//         ];
  
//         setEvents(mappedEvents);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching events:', error);
//         setError(error.message);
//         setLoading(false);
//       }
//     };

//     fetchEvents();
//   }, [hardcodedStaffId]);

//   // Handle adding a new event
//   const handleAddEvent = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch('http://localhost:5001/add_event', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(newEvent),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to add event');
//       }

//       const addedEvent = await response.json();
//       setEvents((prevEvents) => [
//         ...prevEvents,
//         {
//           id: String(addedEvent.event.event_id),
//           title: addedEvent.event.event_name,
//           start: addedEvent.event.event_date,
//           end: addedEvent.event.event_date,
//         },
//       ]);
//       setShowModal(false);
//       resetNewEvent();
//     } catch (error) {
//       console.error('Error adding event:', error);
//       setError(error.message);
//     }
//   };

//   // Reset new event state
//   const resetNewEvent = () => {
//     setNewEvent({ staff_id: hardcodedStaffId, event_name: '', event_date: '', event_type: 'General' });
//   };

//   const handleDateClick = (arg) => {
//     setNewEvent((prev) => ({ ...prev, event_date: arg.dateStr })); // Set the clicked date
//     setShowModal(true); // Show modal to add event
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setNewEvent((prev) => ({ ...prev, [name]: value }));
//   };

//   if (loading) return <div>Loading events...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <>
//       <FullCalendar
//         plugins={[dayGridPlugin, interactionPlugin]}
//         initialView="dayGridMonth"
//         events={events}
//         dateClick={handleDateClick} // Handle date click
//         eventContent={renderEventContent} // Add this line
//       />

//       <Modal show={showModal} onHide={() => setShowModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Add New Event</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={handleAddEvent}>
//             <Form.Group controlId="eventName">
//               <Form.Label>Event Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="Enter event name"
//                 name="event_name"
//                 value={newEvent.event_name}
//                 onChange={handleChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group controlId="eventDate">
//               <Form.Label>Event Date</Form.Label>
//               <Form.Control
//                 type="date"
//                 name="event_date"
//                 value={newEvent.event_date}
//                 onChange={handleChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group controlId="eventType">
//               <Form.Label>Event Type</Form.Label>
//               <Form.Control
//                 as="select"
//                 name="event_type"
//                 value={newEvent.event_type}
//                 onChange={handleChange}
//               >
//                 <option value="General">General</option>
//                 <option value="WFH">Work From Home</option>
//               </Form.Control>
//             </Form.Group>
//             <Button variant="primary" type="submit">
//               Add Event
//             </Button>
//           </Form>
//         </Modal.Body>
//       </Modal>
//     </>
//   );
// }

// function renderEventContent(eventInfo) {
//   const { event } = eventInfo;
//   const isWfh = event.extendedProps.type === 'wfh';
//   const status = event.extendedProps.status;

//   return (
//     <>
//       <b>{event.title}</b>
//       {isWfh && status && <div>Status: {status}</div>}
//     </>
//   );
// }

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
        const response = await fetch(`http://localhost:5003/request`);
        if (!response.ok) {
          throw new Error('Failed to fetch requests');
        }
        const data = await response.json();

        // Map requests to events format for FullCalendar
        const mappedEvents = data
          .filter(request => request.status !== 'Withdrawn' && request.status !== 'Cancelled') // Filter out withdrawn and cancelled
          .map(request => {
            const date = new Date(request.start_date); // Parse the date
            console.log(date);
            
            const formattedDate = date.toISOString().split('T')[0]; // Format to 'YYYY-MM-DD'
            return {
              id: String(request.staff_id),
              title: `${request.reason} - ${request.status}`,
              start: formattedDate, // Use formatted date
              end: formattedDate,   // Use formatted date (assuming single-day events)
              extendedProps: {
                type: request.reason.toLowerCase() === 'wfh' ? 'wfh' : 'general',
                status: request.status
              }
            };
          });        

        console.log('Mapped Events:', mappedEvents); // Log the mapped events

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


