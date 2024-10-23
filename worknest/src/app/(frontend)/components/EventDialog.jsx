// Dialog for adding events

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const departments = [
  'HR',
  'Engineering',
  'Marketing',
  'Sales',
  'Finance',
  // Add more departments as needed
];

const EventDialog = ({ open, onClose, onEventAdded }) => {
  const [department, setDepartment] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAddEvent = async () => {
    if (!department || !eventName || !eventDate) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        department,
        event_name: eventName,
        event_date: dayjs(eventDate).format('YYYY-MM-DD'),
      };

      const response = await axios.post('http://127.0.0.1:5001/events', payload);

      if (response.status === 201) {
        toast.success('Event added successfully!');
        onEventAdded(); // Refresh events list in the parent component
        handleClose();
      } else {
        toast.error('Failed to add event.');
      }
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('An error occurred while adding the event.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form fields
    setDepartment('');
    setEventName('');
    setEventDate(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>Add New Event</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel id="department-label">Department</InputLabel>
          <Select
            labelId="department-label"
            value={department}
            label="Department"
            onChange={(e) => setDepartment(e.target.value)}
          >
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          margin="normal"
          label="Event Name"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />
        <DatePicker
          label="Event Date"
          value={eventDate}
          onChange={(newValue) => setEventDate(newValue)}
          renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleAddEvent} color="primary" variant="contained" disabled={loading}>
          {loading ? 'Adding...' : 'Add Event'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventDialog;
