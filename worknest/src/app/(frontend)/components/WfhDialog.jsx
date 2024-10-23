import React, { useState, useEffect } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Grid, Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import axios from "axios";

const WfhDialog = ({ open, onClose, selectedDates = [] }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    staff_id: '',
    department: '',
    reason: 'Work From Home',
    status: 'Pending', // Default status
    reporting_manager_id: '',
    reporting_manager_name: '',
    reporting_manager_email: '',
    requester_email: '',
    approver_comment: '',
    requested_dates: selectedDates,
    time_of_day: 'Full Day'
  });

  useEffect(() => {
    if (open) {
      const fetchProfile = async () => {
        try {
          const staffId = sessionStorage.getItem('staff_id');
          const response = await axios.get(`http://127.0.0.1:5002/profile/${staffId}`);
          const profile = response.data;

          const managerResponse = await axios.get(`http://127.0.0.1:5002/profile/${profile.reporting_manager_id}`);
          const manager = managerResponse.data;

          setFormData((prevData) => ({
            ...prevData,
            staff_id: profile.staff_id,
            department: profile.department,
            reporting_manager_id: profile.reporting_manager_id,
            reporting_manager_name: manager.staff_fname + ' ' + manager.staff_lname,
            reporting_manager_email: manager.email,
            requester_email: profile.email,
            requested_dates: selectedDates
          }));
        } catch (error) {
          console.error('Error fetching profile or manager details:', error);
        }
      };

      fetchProfile();
    }
  }, [open, selectedDates]);

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
      const requestData = {
        ...formData,
        requested_dates: selectedDates // Ensure dates are passed correctly
      };

      const response = await axios.post(`http://127.0.0.1:5003/requests`, requestData);
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
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Selected Dates"
                type="text"
                name="requested_dates"
                value={selectedDates.join(', ')}
                fullWidth
                disabled
              />
            </Grid>
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
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Reason"
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Time of Day</InputLabel>
                <Select
                  name="time_of_day"
                  value={formData.time_of_day}
                  onChange={handleChange}
                >
                  <MenuItem value="Full Day">Full Day</MenuItem>
                  <MenuItem value="AM">AM</MenuItem>
                  <MenuItem value="PM">PM</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Approver Comment"
                type="text"
                name="approver_comment"
                value={formData.approver_comment}
                onChange={handleChange}
                fullWidth
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
