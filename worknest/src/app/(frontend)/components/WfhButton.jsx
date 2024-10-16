import * as React from "react";
import { useState } from "react";
import axios from 'axios';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

const WfhButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    staff_id: '',
    department: '',
    start_date: '',
    reason: 'Work From Home',
    duration: '',
    recurring_days: '', // Change here
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
    } else if (name === 'recurring_days') {
      // No need to parse here; keep it as a string
      parsedValue = value; // Store as-is for now
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
        recurring_days: recurring_days.split(',').map(day => parseInt(day.trim())).filter(day => !isNaN(day)) // Parse when sending
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
      setShowForm(false);
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
          variant="text" 
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? 'Cancel' : 'Request Work From Home'}
        </Button>
      </Stack>

      {showForm && (
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
              Duration (in days):
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <div>
            <label>
              Recurring Days (e.g., 1,3,5 for Mon, Wed, Fri):
              <input
                type="text"
                name="recurring_days"
                value={formData.recurring_days}
                onChange={handleChange}
                placeholder="e.g. 1,3,5"
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
          <div>
            <label>
              Reporting Manager Email:
              <input
                type="email"
                name="reporting_manager_email"
                value={formData.reporting_manager_email}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <div>
            <label>
              Requester Email:
              <input
                type="email"
                name="requester_email"
                value={formData.requester_email}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <Stack spacing={2} direction="row">
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </Stack>
        </form>
      )}
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default WfhButton;
