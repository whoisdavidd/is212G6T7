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

// Function to fetch managers
const fetchManagers = async () => {
  const staff_id = sessionStorage.getItem("staff_id");

  if (!staff_id) {
    console.error("No staff_id found in session storage");
    return [];
  }

  try {
    const response = await fetch(`http://127.0.0.1:5002/managers/${staff_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const managerData = await response.json();

    if (response.ok) {
      // Return the manager data as an array, assuming the response contains a single manager
      return [managerData]; // Wrap single object in array for Autocomplete
    } else {
      console.error("Error fetching managers:", managerData);
      return [];
    }
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
};

// Function to create a WFH event
const createWFHEvent = async (startDate, endDate, reason, manager) => {
  const staff_id = sessionStorage.getItem("staff_id");
  const employeeDepartment = sessionStorage.getItem("department");
  try {
    const response = await fetch("http://127.0.0.1:5001/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        staff_id: staff_id,
        event_name: "WFH",  // Assuming the event name is fixed as WFH
        // event_date: new Date().toISOString(),  // Set to the current date
        start_date: startDate,
        end_date: endDate,
        reason: reason,
        reporting_manager_name: manager.manager_name,  // Use manager's name
        reporting_manager_id: manager.manager_id, // Use manager's ID
        department: employeeDepartment,
        event_type : "WFH"
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("WFH Event Created:", data);
    } else {
      console.error("Error creating WFH event:", data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

export default function WfhButton() {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [managers, setManagers] = useState([]);  // Initialize as an empty array
  const [selectedManager, setSelectedManager] = useState(null);

  // Fetch managers when the dialog is opened
  const handleClickOpen = async () => {
    setOpen(true);
    const managersData = await fetchManagers();
    setManagers(managersData);  // Ensure managers data is an array
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleManagerChange = (event, value) => {
    setSelectedManager(value);
  };

  // Handle form submission
  const handleSubmit = async () => {
    await createWFHEvent(startDate, endDate, reason, selectedManager);
    handleClose();  // Close the dialog after submitting
  };

  return (
    <div>
      <Stack spacing={2} direction="row">
        <Button variant="contained" onClick={handleClickOpen}>
          Request for WFH
        </Button>
      </Stack>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>WFH Request Form</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Fill out the details below to submit your WFH request.
          </DialogContentText>

          {/* Date pickers for start and end dates */}
          <TextField
            margin="dense"
            id="startDate"
            label="Start Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <TextField
            margin="dense"
            id="endDate"
            label="End Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <TextField
            margin="dense"
            id="reason"
            label="Reason for WFH"
            fullWidth
            required
            onChange={(e) => setReason(e.target.value)}
          />

          {/* Autocomplete for manager's name */}
          <Autocomplete
            options={managers}  // managers is now always an array
            getOptionLabel={(option) => option.reporting_manager_name}  // manager_name from API
            onChange={handleManagerChange}
            renderInput={(params) => (
              <TextField
                {...params}
                margin="dense"
                label="Manager's Name"
                fullWidth
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!startDate || !endDate || !reason}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
