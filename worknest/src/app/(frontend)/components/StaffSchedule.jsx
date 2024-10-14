import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import WfhButton from './WfhButton';
import EditButton from './EditButton';
import { DataGrid } from '@mui/x-data-grid';

export default function FullFeaturedCrudGrid() {
  const [rows, setRows] = React.useState([]);
  const staff_id = 210030; // Assuming this will be used for future actions

  // Fetch event data from the Flask backend
  React.useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await fetch(`http://localhost:5003/request`);
        const data = await response.json();
        console.log("Fetched Data:", data); // Log the fetched data
        const formattedData = data.map((item) => {
          const date = new Date(item.start_date); // Parse the date
          const formattedDate = date.toISOString().split('T')[0]; // Format to 'YYYY-MM-DD'
          return {
            request_id: item.request_id,
            staff_id: item.staff_id,
            department: item.department,
            start_date: formattedDate, // Ensure the parsed date is valid
            reason: item.reason,
            duration: item.duration,
            status: item.status,
            reporting_manager_id: item.reporting_manager_id,
            reporting_manager_name: item.reporting_manager_name,
            // Add other fields as needed
          };
        });
        setRows(formattedData);
      } catch (error) {
        console.error('Error fetching event data:', error);
      }
    };
    fetchEventData();
  }, []);

  const columns = [
    { field: 'staff_id', headerName: 'Staff ID', width: 100 },
    { field: 'department', headerName: 'Department', width: 150 },
    {
      field: 'start_date',
      headerName: 'Start Date',
      width: 180,
      valueFormatter: (params) => {
        return params.value; // Return the formatted string directly
      },
    },
    { field: 'reason', headerName: 'Reason', width: 150 },
    { field: 'duration', headerName: 'Duration', width: 100 },
    { field: 'status', headerName: 'Status', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => {
        const { status, request_id } = params.row;

        return (
          <div>
            {status === 'Pending' && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleCancelClick(request_id)}
              >
                Cancel
              </Button>
            )}
            {status === 'approved' && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleWithdrawClick(request_id)}
              >
                Withdraw
              </Button>
            )}
          </div>
        );
      },
    },
    {
      field: 'edit',
      headerName: 'Edit',
      width: 150,
      renderCell: (params) => {
        const { request_id } = params.row;

        return (
          <div>
            {
              <EditButton requestId={request_id} onRequestUpdate={handleRequestUpdate} />
            }
          </div>
        );
      },
    },
    {
      field: "Request ID",
      headerName: "Request ID",
      width: 150,
      renderCell: (params) => {
        return params.row.request_id;
      } 
    },
  ];

  const handleWithdrawClick = async (request_id) => {
    try {
      // Retrieve data from sessionStorage
      const role = sessionStorage.getItem('role');
      const staffId = sessionStorage.getItem('staff_id');
      const department = sessionStorage.getItem('department');
  
      // Validate that the necessary data exists
      if (!role || !staffId || !department) {
        setErrorMessage("User session is invalid. Please log in again.");
        alert("User session is invalid. Please log in again.");
        return;
      }
  
      // Make the PUT request with custom headers
      const response = await fetch(`http://localhost:5003/request/withdraw/${request_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Role': role,
          'X-Staff-ID': staffId,
          'X-Department': department,
        },
        credentials: 'include', // Include cookies in the request
      });
  
      const data = await response.json();
      if (response.ok) {
        // Update the rows state to reflect the withdrawn status
        setRows(rows.map(row => (
          row.request_id === request_id ? { ...row, status: 'Withdrawn' } : row
        )));
        console.log(`Withdrawn request for Request ID: ${request_id}`);
        alert("Request withdrawn successfully.");
      } else {
        console.error('Failed to withdraw request:', data.message);
        setErrorMessage(data.message || "Failed to withdraw the request.");
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error withdrawing request:', error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const handleCancelClick = async (request_id) => {
    try {
      // Retrieve data from sessionStorage
      const role = sessionStorage.getItem('role');
      const staffId = sessionStorage.getItem('staff_id');
      const department = sessionStorage.getItem('department');
  
      // Validate that the necessary data exists
      if (!role || !staffId || !department) {
        setErrorMessage("User session is invalid. Please log in again.");
        alert("User session is invalid. Please log in again.");
        return;
      }
  
      // Make the PUT request with custom headers
      const response = await fetch(`http://localhost:5003/request/cancel/${request_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Role': role,
          'X-Staff-ID': staffId,
          'X-Department': department,
        },
        credentials: 'include', // Include cookies in the request
      });
  
      const data = await response.json();
      if (response.ok) {
        // Update the rows state to reflect the cancelled status
        setRows(rows.map(row => (
          row.request_id === request_id ? { ...row, status: 'Cancelled' } : row
        )));
        console.log(`Cancelled request for Request ID: ${request_id}`);
        alert("Request canceled successfully.");
      } else {
        console.error('Failed to cancel request:', data.message);
        setErrorMessage(data.message || "Failed to cancel the request.");
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      alert("An unexpected error occurred. Please try again.");
    }
  };

  // Add this function to handle updates after editing
  const handleRequestUpdate = (updatedRequest) => {
    setRows(rows.map(row => 
      row.request_id === updatedRequest.request_id ? updatedRequest : row
    ));
  };

  return (
    <div>
      <WfhButton />
      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          getRowId={(row) => `${row.staff_id}-${row.start_date}`} // Ensure uniqueness
        />
      </Box>
    </div>
  );
}