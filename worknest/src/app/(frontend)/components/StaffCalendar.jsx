// import React, { useEffect, useState } from 'react';
// import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
// import {
//   createViewDay,
//   createViewMonthAgenda,
//   createViewMonthGrid,
//   createViewWeek,
// } from '@schedule-x/calendar';
// import '@schedule-x/theme-default/dist/index.css';

// function StaffCalendar({ staff_Id }) {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch events for the staff member
//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const response = await fetch(`http://localhost:5000/events/123`);  // Fetch events from Flask API
//         if (!response.ok) {
//           throw new Error('Failed to fetch events');
//         }
//         const data = await response.json();
        
//         // Map data to the calendar's event structure
//         const mappedEvents = data.map(event => ({
//           id: String(event.event_id),                      // Event ID
//           title: event.event_name,                 // Event name mapped to title
//           start: event.event_date,       // Assuming event_date is in 'YYYY-MM-DD' format
//           end: event.event_date,         // For single-day events, start and end are the same
//         }));
//         console.log('Mapped Events:', mappedEvents);
//         console.log(data);
//         setEvents(mappedEvents);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching events:', error);
//         setError(error.message);
//         setLoading(false);
//       }
//     };

//     fetchEvents();
//   }, [staff_Id]);

//   // Calendar setup with fetched events
//   const calendar = useCalendarApp({
//     views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
//     events: events,  // Set the fetched events here
//   });


//   if (loading) return <div>Loading events...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div>
//       <ScheduleXCalendar calendarApp={calendar} />
//     </div>
//   );
// }

// export default StaffCalendar;


// import React, { useEffect, useState } from 'react';
// import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid';

// export default function StaffCalendar({ staff_Id }) {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch events for the staff member
//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const response = await fetch(`http://localhost:5000/events/123`); // Adjusted to use staff_Id
//         if (!response.ok) {
//           throw new Error('Failed to fetch events');
//         }
//         const data = await response.json();

//         // Map data to FullCalendar's event structure
//         const mappedEvents = data.map(event => ({
//           id: String(event.event_id),              // Event ID
//           title: event.event_name,                  // Event name mapped to title
//           start: event.event_date,                  // Assuming event_date is in 'YYYY-MM-DD' format
//           end: event.event_date,                    // For single-day events, start and end are the same
//         }));

//         setEvents(mappedEvents);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching events:', error);
//         setError(error.message);
//         setLoading(false);
//       }
//     };

//     fetchEvents();
//   }, [staff_Id]);

//   if (loading) return <div>Loading events...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <FullCalendar
//       plugins={[ dayGridPlugin ]}
//       initialView="dayGridMonth"
//       events={events}  // Pass the fetched events to FullCalendar
//     />
//   );
// }

// import React, { useEffect, useState } from 'react';
// import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import { Button, Modal, Form } from 'react-bootstrap';

// export default function StaffCalendar({ staff_Id }) {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [newEvent, setNewEvent] = useState({
//     staff_id: staff_Id,
//     event_name: '',
//     event_date: '',
//     event_type: 'General', // Default event type
//   });

//   // Fetch events for the staff member
//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const response = await fetch(`http://localhost:5000/events/210030`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch events');
//         }
//         const data = await response.json();

//         const mappedEvents = data.map(event => ({
//           id: String(event.event_id),
//           title: event.event_name,
//           start: event.event_date,
//           end: event.event_date,
//         }));

//         setEvents(mappedEvents);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching events:', error);
//         setError(error.message);
//         setLoading(false);
//       }
//     };

//     fetchEvents();
//   }, [staff_Id]);

//   // Handle adding a new event
//   const handleAddEvent = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch('http://localhost:5000/add_event', {
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
//       setNewEvent({ staff_id: staff_Id, event_name: '', event_date: '', event_type: 'General' });
//     } catch (error) {
//       console.error('Error adding event:', error);
//       setError(error.message);
//     }
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
//         plugins={[dayGridPlugin]}
//         initialView="dayGridMonth"
//         events={events}
//         dateClick={handleDateClick}
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
//                 {/* Add more event types as needed */}
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



import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Button, Modal, Form } from 'react-bootstrap';

export default function StaffCalendar() {
  const hardcodedStaffId = 210030; // Hardcoded staff ID
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    staff_id: hardcodedStaffId,
    event_name: '',
    event_date: '',
    event_type: 'General', // Default event type
  });

  // Fetch events for the staff member
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`http://localhost:5001/events/${hardcodedStaffId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        const mappedEvents = data.map(event => ({
          id: String(event.event_id),
          title: event.event_name,
          start: event.event_date,
          end: event.event_date,
        }));

        setEvents(mappedEvents);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchEvents();
  }, [hardcodedStaffId]);

  // Handle adding a new event
  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/add_event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });

      if (!response.ok) {
        throw new Error('Failed to add event');
      }

      const addedEvent = await response.json();
      setEvents((prevEvents) => [
        ...prevEvents,
        {
          id: String(addedEvent.event.event_id),
          title: addedEvent.event.event_name,
          start: addedEvent.event.event_date,
          end: addedEvent.event.event_date,
        },
      ]);
      setShowModal(false);
      resetNewEvent();
    } catch (error) {
      console.error('Error adding event:', error);
      setError(error.message);
    }
  };

  // Reset new event state
  const resetNewEvent = () => {
    setNewEvent({ staff_id: hardcodedStaffId, event_name: '', event_date: '', event_type: 'General' });
  };

  const handleDateClick = (arg) => {
    setNewEvent((prev) => ({ ...prev, event_date: arg.dateStr })); // Set the clicked date
    setShowModal(true); // Show modal to add event
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <div>Loading events...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick} // Handle date click
      />

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddEvent}>
            <Form.Group controlId="eventName">
              <Form.Label>Event Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter event name"
                name="event_name"
                value={newEvent.event_name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="eventDate">
              <Form.Label>Event Date</Form.Label>
              <Form.Control
                type="date"
                name="event_date"
                value={newEvent.event_date}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="eventType">
              <Form.Label>Event Type</Form.Label>
              <Form.Control
                as="select"
                name="event_type"
                value={newEvent.event_type}
                onChange={handleChange}
              >
                <option value="General">General</option>
                <option value="WFH">Work From Home</option>
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit">
              Add Event
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}


