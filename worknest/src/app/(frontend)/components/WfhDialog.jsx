import React, { useState, useEffect } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Grid, Button } from "@mui/material";
import axios from "axios";

const WfhDialog = ({ open, onClose, initialStartDate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    staff_id: '',
    department: '',
    start_date: initialStartDate || '',
    reason: 'Work From Home',
    duration: '',
    recurring_days: '',
    reporting_manager_id: '',
    reporting_manager_name: '',
    reporting_manager_email: '',
    requester_email: ''
  });

  useEffect(() => {
    if (open) {
      const fetchProfile = async () => {
        try {
          const staffId = sessionStorage.getItem('staff_id');
          const response = await axios.get(`http://localhost:5002/profile/${staffId}`);
          const profile = response.data;

          const managerResponse = await axios.get(`http://localhost:5002/profile/${profile.reporting_manager_id}`);
          const manager = managerResponse.data;

          setFormData((prevData) => ({
            ...prevData,
            staff_id: profile.staff_id,
            department: profile.department,
            reporting_manager_id: profile.reporting_manager_id,
            reporting_manager_name: manager.staff_fname + ' ' + manager.staff_lname,
            reporting_manager_email: manager.email,
            requester_email: profile.email,
            start_date: initialStartDate || prevData.start_date
          }));
        } catch (error) {
          console.error('Error fetching profile or manager details:', error);
        }
      };

      fetchProfile();
    }
  }, [open, initialStartDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
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

      const response = await axios.post(`http://localhost:5003/requests`, requestData);
      console.log('Request added:', response.data);
      setSuccess('Request submitted successfully!');
      onClose();
    } catch (error) {
      console.error('Error adding request:', error);
      setError('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Work From Home Request</DialogTitle>
      <DialogContent>
        <form onSubmit={handleWfhRequest}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Staff ID"
                type="number"
                name="staff_id"
                value={formData.staff_id}
                onChange={handleChange}
                fullWidth
                required
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Department"
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                fullWidth
                required
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
            </Grid>
            <Grid item xs={12} sm={6}>
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
            </Grid>
            <Grid item xs={12}>
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Reporting Manager ID"
                type="number"
                name="reporting_manager_id"
                value={formData.reporting_manager_id}
                onChange={handleChange}
                fullWidth
                required
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Reporting Manager Name"
                type="text"
                name="reporting_manager_name"
                value={formData.reporting_manager_name}
                onChange={handleChange}
                fullWidth
                required
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Reporting Manager Email"
                type="email"
                name="reporting_manager_email"
                value={formData.reporting_manager_email}
                onChange={handleChange}
                fullWidth
                required
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Requester Email"
                type="email"
                name="requester_email"
                value={formData.requester_email}
                onChange={handleChange}
                fullWidth
                required
                disabled
              />
            </Grid>
          </Grid>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleWfhRequest} color="primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WfhDialog;
