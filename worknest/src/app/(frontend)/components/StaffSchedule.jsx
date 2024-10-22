import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { DataGrid } from '@mui/x-data-grid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditButton from './EditButton';

export default function FullFeaturedCrudGrid() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const staff_id = sessionStorage.getItem("staff_id");

  const fetchEventData = async (retryCount = 3) => {
    try {
      const response = await fetch(`http://127.0.0.1:5003/requests/${staff_id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch requests');
      }
      const data = await response.json();
      if (data.length === 0) {
        setError('No requests found.');
      } else {
        const formattedData = data.map((item) => {
          const formattedDates = Array.isArray(item.requested_dates)
            ? item.requested_dates.map(date => new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }).format(new Date(date))).join(', ')
            : 'N/A';

          return {
            request_id: item.request_id,
            staff_id: item.staff_id,
            department: item.department,
            requested_dates: formattedDates,
            reason: item.reason,
            status: item.status,
            reporting_manager_id: item.reporting_manager_id,
            reporting_manager_name: item.reporting_manager_name,
            time_of_day: item.time_of_day,
          };
        });
        setRows(formattedData);
      }
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
    { field: 'requested_dates', headerName: 'Requested Dates', width: 200 },
    { field: 'reason', headerName: 'Reason', width: 150 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'time_of_day', headerName: 'Time of Day', width: 120 }, // Add time_of_day column
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

      const response = await fetch(`http://127.0.0.1:5003/requests/${request_id}/withdraw`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Role': role,
          'X-Staff-ID': staffId,
          'X-Department': department,
        },
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

      console.log(role, staffId, department);

      const response = await fetch(`http://127.0.0.1:5003/requests/${request_id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Role': role,
          'X-Staff-ID': staffId,
          'X-Department': department,
        },
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
      console.log(error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  if (loading) return <div>Loading requests...</div>;
  if (error) return <div>{error}</div>;

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
          getRowId={(row) => `${row.request_id}`}
        />
      </Box>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} />
    </div>
  );
}
