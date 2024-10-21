import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useState, useEffect, useCallback } from "react";

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

const updateWFHRequest = async (requestId, startDate, duration, reason, manager, currentStatus) => {
  const staff_id = sessionStorage.getItem("staff_id");
  const employeeDepartment = sessionStorage.getItem("department");
  try {
    const response = await fetch(`http://localhost:5003/request/update/${requestId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Role": sessionStorage.getItem("role"),
        "X-Staff-ID": staff_id,
        "X-Department": employeeDepartment,
      },
      body: JSON.stringify({
        start_date: startDate,
        duration: duration,
        reason: reason,
        status: currentStatus === "Approved" ? "Pending" : currentStatus,
      }),
    });

    const data = await response.json();
    console.log(data);

    if (response.ok) {
      console.log("WFH Request Updated:", data);
      return data.request;
    } else {
      console.error("Error updating WFH request:", data);
      throw new Error(data.message || "Failed to update request");
    }
  } catch (error) {
    console.error("Error:", error);
    throw new Error(`Failed to update request: ${error.message}`);
  }
};

export default function EditButton({ requestId, onRequestUpdate, currentStatus }) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState("");
  const [reason, setReason] = useState("");
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [status, setStatus] = useState(currentStatus);

  const fetchRequestDetails = useCallback(
    async (requestId) => {
      try {
        const response = await fetch(`http://localhost:5003/request/${requestId}`);
        const data = await response.json();
        if (response.ok) {
          setStartDate(data.start_date);
          setDuration(data.duration);
          setReason(data.reason);
          setStatus(data.status);
          setSelectedManager(managers.find((m) => m.manager_id === data.reporting_manager_id) || null);
        } else {
          console.error("Error fetching request details:", data);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    },
    [managers] // managers as dependency
  );

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        const fetchedManagers = await fetchManagers();
        setManagers(fetchedManagers);
        await fetchRequestDetails(requestId);
      };

      fetchData();
    }
  }, [open, requestId, fetchRequestDetails]);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleManagerChange = (event, value) => setSelectedManager(value);

  const handleSubmit = async () => {
    try {
      const updatedRequest = await updateWFHRequest(
        requestId,
        startDate,
        duration,
        reason,
        selectedManager,
        status
      );

      // If the status was 'approved', we've changed it to 'Pending'
      if (status === "Approved") {
        updatedRequest.status = "Pending";
        alert("Your request has been edited and resubmitted for approval.");
      } else {
        alert("Your request has been updated successfully.");
      }

      onRequestUpdate(updatedRequest);
      handleClose();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert("Failed to update request: " + error.message);
    }
  };

  return (
    <div>
      <Button variant="contained" onClick={handleClickOpen}>
        Edit
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit WFH Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Update the details of your WFH request.
            {status === "Approved" && " This will resubmit your request for approval."}
          </DialogContentText>
          <TextField
            margin="dense"
            id="startDate"
            label="Start Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <TextField
            margin="dense"
            id="duration"
            label="Duration"
            fullWidth
            required
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          <TextField
            margin="dense"
            id="reason"
            label="Reason for WFH"
            fullWidth
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Autocomplete
            options={managers}
            getOptionLabel={(option) => option.reporting_manager_name}
            value={selectedManager}
            onChange={handleManagerChange}
            renderInput={(params) => (
              <TextField {...params} margin="dense" label="Manager's Name" fullWidth />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!startDate || !duration || !reason || !selectedManager}
          >
            Update Request
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}