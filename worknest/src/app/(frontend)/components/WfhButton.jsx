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
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
const createWFHEvent = async (startDate, endDate, reason, manager, dayId, recurringDays) => {
  const staff_id = sessionStorage.getItem("staff_id");
  const employeeDepartment = sessionStorage.getItem("department");
  const requesterEmail = sessionStorage.getItem("email");

  try {
    const response = await fetch("http://localhost:5003/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        staff_id: staff_id,
        event_name: "WFH",
        start_date: startDate,
        end_date: endDate,
        reason: reason,
        reporting_manager_name: manager.reporting_manager_name,
        reporting_manager_id: manager.reporting_manager_id,
        reporting_manager_email: manager.reporting_manager_email,
        requester_email: requesterEmail,
        department: employeeDepartment,
        event_type: "WFH",
        day_id: dayId,
        recurring_days: recurringDays
      }),
    });

    const data = await response.json();

    if (response.ok) {
      toast.success("WFH Event Created Successfully");
      return data;
    } else {
      throw new Error(data.message || "Failed to create WFH event");
    }
  } catch (error) {
    console.error("Error:", error);
    toast.error("An error occurred while creating the WFH event. Please try again.");
    throw error;
  }
};

export default function WfhButton() {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [recurringDays, setRecurringDays] = useState(0);

  // Fetch managers when the dialog is opened
  const handleClickOpen = async () => {
    setOpen(true);
    const managersData = await fetchManagers();
    setManagers(managersData);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleManagerChange = (event, value) => {
    setSelectedManager(value);
  };

  // Calculate day_id based on startDate
  const calculateDayId = (dateString) => {
    const date = new Date(dateString);
    return date.getDay(); // Returns 0 for Sunday, 1 for Monday, etc.
  };

  // Handle form submission
  const handleSubmit = async () => {
    const dayId = calculateDayId(startDate);
    try {
      await createWFHEvent(startDate, endDate, reason, selectedManager, dayId, recurringDays);
      handleClose();
    } catch (error) {
      console.error("Error submitting WFH request:", error);
    }
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

          <Autocomplete
            options={managers}
            getOptionLabel={(option) => option.reporting_manager_name}
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

          <TextField
            select
            margin="dense"
            id="recurringDays"
            label="Recurring"
            fullWidth
            value={recurringDays}
            onChange={(e) => setRecurringDays(e.target.value)}
          >
            <MenuItem value={0}>None</MenuItem>
            <MenuItem value={1}>Weekly</MenuItem>
            <MenuItem value={2}>Biweekly</MenuItem>
            <MenuItem value={3}>Monthly</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!startDate || !endDate || !reason || !selectedManager}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
