import * as React from "react";
import { useState } from "react";
import axios from 'axios';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

const WfhButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false); // State to toggle form visibility
  
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
      const requestData = {
        ...formData,
        status: 'Pending' // Add status here
      };

      const response = await axios.post(`http://localhost:5003/add_request/${formData.staff_id}`, requestData);
      console.log('Request added:', response.data);
      setSuccess('Request submitted successfully!');
      // Optionally reset form data
      setFormData({
        staff_id: '',
        department: '',
        start_date: '',
        reason: 'Work From Home',
        duration: '',
        reporting_manager_id: '',
        reporting_manager_name: ''
      });
      setShowForm(false); // Hide the form after successful submission
    } catch (error) {
      console.error('Error adding request:', error);
      setError('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Main Button to Show/Hide Form */}
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



