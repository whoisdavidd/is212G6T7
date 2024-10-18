import * as React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const WfhButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    staff_id: '',
    department: '',
    start_date: '',
    reason: 'Work From Home',
    duration: '',
    recurring_days: '',
    reporting_manager_id: '',
    reporting_manager_name: '',
    reporting_manager_email: '',
    requester_email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;

    if (name === 'staff_id' || name === 'reporting_manager_id') {
      parsedValue = parseInt(value);
    } else if (name === 'start_date') {
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
      const { start_date, duration, recurring_days } = formData;
      const durationDays = parseInt(duration);
      const startDate = new Date(start_date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + durationDays);

      const requestData = {
        ...formData,
        status: 'Pending',
        end_date: endDate.toISOString().split('T')[0],
        recurring_days: recurring_days.split(',').map(day => parseInt(day.trim())).filter(day => !isNaN(day))
      };

      const response = await axios.post(`http://localhost:5003/add_request/${formData.staff_id}`, requestData);
      console.log('Request added:', response.data);
      setSuccess('Request submitted successfully!');
      setFormData({
        staff_id: '',
        department: '',
        start_date: '',
        reason: 'Work From Home',
        duration: '',
        recurring_days: '',
        reporting_manager_id: '',
        reporting_manager_name: '',
        reporting_manager_email: '',
        requester_email: ''
      });
      setOpen(false);
    } catch (error) {
      console.error('Error adding request:', error);
      setError('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Stack spacing={2} direction="row">
        <Button 
          variant="contained" 
          onClick={() => setOpen(true)}
        >
          Request Work From Home
        </Button>
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Work From Home Request</DialogTitle>
        <DialogContent>
          <form onSubmit={handleWfhRequest}>
            <TextField
              margin="dense"
              label="Staff ID"
              type="number"
              name="staff_id"
              value={formData.staff_id}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              margin="dense"
              label="Department"
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              margin="dense"
              label="Start Date"
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              margin="dense"
              label="Duration (in days)"
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              margin="dense"
              label="Recurring Days (e.g., 1,3,5 for Mon, Wed, Fri)"
              type="text"
              name="recurring_days"
              value={formData.recurring_days}
              onChange={handleChange}
              fullWidth
              placeholder="e.g. 1,3,5"
            />
            <TextField
              margin="dense"
              label="Reporting Manager ID"
              type="number"
              name="reporting_manager_id"
              value={formData.reporting_manager_id}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              margin="dense"
              label="Reporting Manager Name"
              type="text"
              name="reporting_manager_name"
              value={formData.reporting_manager_name}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              margin="dense"
              label="Reporting Manager Email"
              type="email"
              name="reporting_manager_email"
              value={formData.reporting_manager_email}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              margin="dense"
              label="Requester Email"
              type="email"
              name="requester_email"
              value={formData.requester_email}
              onChange={handleChange}
              fullWidth
              required
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleWfhRequest} color="primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default WfhButton;
