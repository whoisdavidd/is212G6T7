import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import WfhButton from './WfhButton';
import EditButton from './EditButton';
import { DataGrid } from '@mui/x-data-grid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function FullFeaturedCrudGrid() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const staff_id = sessionStorage.getItem("staff_id"); // Assuming this will be used for future actions

  // Fetch event data from the Flask backend
  const fetchEventData = async (retryCount = 3) => {
    try {
      const response = await fetch(`http://localhost:5003/requests`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch requests');
      }
      const data = await response.json();
      const formattedData = data.map((item) => {
        const date = new Date(item.start_date);
        const formattedDate = date.toISOString().split('T')[0];
        return {
          request_id: item.request_id,
          staff_id: item.staff_id,
          department: item.department,
          start_date: formattedDate,
          reason: item.reason,
          duration: item.duration,
          status: item.status,
          reporting_manager_id: item.reporting_manager_id,
          reporting_manager_name: item.reporting_manager_name,
        };
      });
      setRows(formattedData);
      setLoading(false);
    } catch (error) {
      if (retryCount > 0) {
        setTimeout(() => fetchEventData(retryCount - 1), 1000);
      } else {
        console.error('Error fetching event data:', error);
        setError(error.message);
        setLoading(false);
      }
    }
  };

  React.useEffect(() => {
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
            {status === 'Approved' && (
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
        const { request_id, status } = params.row;

        return (
          <div>
            {
              <EditButton 
                requestId={request_id} 
                onRequestUpdate={handleRequestUpdate} 
                currentStatus={status}
              />
            }
          </div>
        );
      },
    },
    // Can remove if done, this is for referencing88
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
    const originalRows = [...rows];
    setRows(rows.map(row => (
      row.request_id === request_id ? { ...row, status: 'Withdrawn' } : row
    )));
    try {
      const role = sessionStorage.getItem('role');
      const staffId = sessionStorage.getItem('staff_id');
      const department = sessionStorage.getItem('department');

      if (!role || !staffId || !department) {
        toast.error("User session is invalid. Please log in again.");
        return;
      }

      const response = await fetch(`http://localhost:5003/requests/${request_id}/withdraw`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Role': role,
          'X-Staff-ID': staffId,
          'X-Department': department,
        },
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Request withdrawn successfully.");
      } else {
        setRows(originalRows);
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      setRows(originalRows);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handleCancelClick = async (request_id) => {
    const originalRows = [...rows];
    setRows(rows.map(row => (
      row.request_id === request_id ? { ...row, status: 'Cancelled' } : row
    )));
    try {
      const role = sessionStorage.getItem('role');
      const staffId = sessionStorage.getItem('staff_id');
      const department = sessionStorage.getItem('department');

      if (!role || !staffId || !department) {
        toast.error("User session is invalid. Please log in again.");
        return;
      }

      const response = await fetch(`http://localhost:5003/requests/${request_id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Role': role,
          'X-Staff-ID': staffId,
          'X-Department': department,
        },
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Request canceled successfully.");
      } else {
        setRows(originalRows);
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      setRows(originalRows);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  if (loading) return <div>Loading requests...</div>;
  if (error) return <div>Error: {error}</div>;

  // Add this function to handle updates after editing
  const handleRequestUpdate = (updatedRequest) => {
    setRows(prevRows => prevRows.map(row => 
      row.request_id === updatedRequest.request_id ? updatedRequest : row
    ));
  };

  return (
    <div>
      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          getRowId={(row) => `${row.staff_id}-${row.start_date}`} // Ensure uniqueness
        />
      </Box>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} />
    </div>
  );
}
