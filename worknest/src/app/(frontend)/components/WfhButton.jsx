import * as React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useState } from "react";
import axios from 'axios';


// // Function to fetch managers
// const fetchManagers = async () => {
//   const staff_id = sessionStorage.getItem("staff_id");

//   if (!staff_id) {
//     console.error("No staff_id found in session storage");
//     return [];
//   }

//   try {
//     const response = await fetch(`http://127.0.0.1:5000/managers/${staff_id}`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     const managerData = await response.json();

//     if (response.ok) {
//       // Return the manager data as an array, assuming the response contains a single manager
//       return [managerData]; // Wrap single object in array for Autocomplete
//     } else {
//       console.error("Error fetching managers:", managerData);
//       return [];
//     }
//   } catch (error) {
//     console.error("Fetch error:", error);
//     return [];
//   }
// };

// // Function to create a WFH event
// const createWFHEvent = async (startDate, endDate, reason, manager) => {
//   const staff_id = sessionStorage.getItem("staff_id");
//   const employeeDepartment = sessionStorage.getItem("department");
//   try {
//     const response = await fetch("http://127.0.0.1:5001/event", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         staff_id: staff_id,
//         event_name: "WFH",  // Assuming the event name is fixed as WFH
//         // event_date: new Date().toISOString(),  // Set to the current date
//         start_date: startDate,
//         end_date: endDate,
//         reason: reason,
//         reporting_manager: manager.manager_name,  // Use manager's name
//         reporting_manager_id: manager.manager_id, // Use manager's ID
//         department: employeeDepartment,
//         event_type : "WFH"
//       }),
//     });

//     const data = await response.json();

//     if (response.ok) {
//       console.log("WFH Event Created:", data);
//     } else {
//       console.error("Error creating WFH event:", data);
//     }
//   } catch (error) {
//     console.error("Error:", error);
//   }
// };

// export default function WfhButton() {
//   const [open, setOpen] = useState(false);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [reason, setReason] = useState("");
//   const [managers, setManagers] = useState([]);  // Initialize as an empty array
//   const [selectedManager, setSelectedManager] = useState(null);

//   // Fetch managers when the dialog is opened
//   const handleClickOpen = async () => {
//     setOpen(true);
//     const managersData = await fetchManagers();
//     setManagers(managersData);  // Ensure managers data is an array
//   };

//   const handleClose = () => {
//     setOpen(false);
//   };

//   const handleManagerChange = (event, value) => {
//     setSelectedManager(value);
//   };

//   // Handle form submission
//   const handleSubmit = async () => {
//     await createWFHEvent(startDate, endDate, reason, selectedManager);
//     handleClose();  // Close the dialog after submitting
//   };

//   return (
//     <div>
//       <Stack spacing={2} direction="row">
//         <Button variant="contained" onClick={handleClickOpen}>
//           Request for WFH
//         </Button>
//       </Stack>
//       <Dialog open={open} onClose={handleClose}>
//         <DialogTitle>WFH Request Form</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Fill out the details below to submit your WFH request.
//           </DialogContentText>

//           {/* Date pickers for start and end dates */}
//           <TextField
//             margin="dense"
//             id="startDate"
//             label="Start Date"
//             type="date"
//             fullWidth
//             InputLabelProps={{ shrink: true }}
//             onChange={(e) => setStartDate(e.target.value)}
//           />
//           <TextField
//             margin="dense"
//             id="endDate"
//             label="End Date"
//             type="date"
//             fullWidth
//             InputLabelProps={{ shrink: true }}
//             onChange={(e) => setEndDate(e.target.value)}
//           />
//           <TextField
//             margin="dense"
//             id="reason"
//             label="Reason for WFH"
//             fullWidth
//             required
//             onChange={(e) => setReason(e.target.value)}
//           />

//           {/* Autocomplete for manager's name */}
//           <Autocomplete
//             options={managers}  // managers is now always an array
//             getOptionLabel={(option) => option.manager_name}  // manager_name from API
//             onChange={handleManagerChange}
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 margin="dense"
//                 label="Manager's Name"
//                 fullWidth
//               />
//             )}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleClose}>Cancel</Button>
//           <Button
//             onClick={handleSubmit}
//             variant="contained"
//             disabled={!startDate || !endDate || !reason}
//           >
//             Submit Request
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// }




const WfhButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // State to hold user input
  const [formData, setFormData] = useState({
    staff_id: '',
    department: '',
    start_date: '',
    reason: 'Work From Home',
    duration: '',
    reporting_manager_id: '',
    reporting_manager_name: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Parse staff_id and reporting_manager_id as integers and format date
    let parsedValue = value;
    if (name === 'staff_id' || name === 'reporting_manager_id') {
      parsedValue = parseInt(value);
    } else if (name === 'start_date') {
      // Convert to ISO date string format
      parsedValue = new Date(value).toISOString().split('T')[0];
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: parsedValue
    }));
  };

  const handleWfhRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Set the status directly here
      const requestData = {
        ...formData,
        status: 'Pending' // Add status here
      };

      const response = await axios.post(`http://localhost:5003/add_request/${formData.staff_id}`, requestData);
      console.log('Request added:', response.data);
      setSuccess('Request submitted successfully!');
    } catch (error) {
      console.error('Error adding request:', error);
      setError('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleWfhRequest}>
        <div>
          <label>
            Staff ID:
            <input
              type="number"
              name="staff_id"
              value={formData.staff_id}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Department:
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Start Date:
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Duration:
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Reporting Manager ID:
            <input
              type="number"
              name="reporting_manager_id"
              value={formData.reporting_manager_id}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Reporting Manager Name:
            <input
              type="text"
              name="reporting_manager_name"
              value={formData.reporting_manager_name}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Request WFH'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default WfhButton;


