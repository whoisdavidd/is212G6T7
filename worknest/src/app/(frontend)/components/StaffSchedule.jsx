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
  const [errorMessage, setErrorMessage] = React.useState(null);

  // Fetch staff_id from sessionStorage
  const staff_id = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem("staff_id");
    }
    return null;
  }, []); // UseMemo to avoid re-fetching

  // Fetch event data from the Flask backend
  React.useEffect(() => {
    const fetchEventData = async () => {
      if (!staff_id) {
        console.error("No staff_id found in session storage.");
        setErrorMessage("No staff_id found in session storage.");
        return;
      }

      try {
        const response = await fetch(`http://localhost:5003/request/staff/${staff_id}`);
        const data = await response.json();
        console.log("Fetched Data:", data);

        // Format the data before setting the rows
        const formattedData = data.map((item) => {
          const date = new Date(item.start_date);
          const formattedDate = date.toISOString().split('T')[0]; // Format to 'YYYY-MM-DD'
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
      }
      setLoading(false);
    } catch (error) {
      if (retryCount > 0) {
        setTimeout(() => fetchEventData(retryCount - 1), 1000);
      } else {
        console.error('Error fetching event data:', error);
        setErrorMessage("Failed to fetch event data.");
      }
    };

    fetchEventData();
  }, [staff_id]); // Add staff_id as a dependency

  // Column definitions for DataGrid
  const columns = [
    { field: 'staff_id', headerName: 'Staff ID', width: 100 },
    { field: 'department', headerName: 'Department', width: 150 },
    {
      field: 'start_date',
      headerName: 'Start Date',
      width: 180,
      valueFormatter: (params) => params.value, // Return the formatted string directly
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
          <EditButton
            requestId={request_id}
            onRequestUpdate={handleRequestUpdate}
            currentStatus={status}
          />
        );
      },
    },
    {
      field: 'request_id',
      headerName: 'Request ID',
      width: 150,
      renderCell: (params) => params.row.request_id,
    },
  ];

  // Handle Withdraw Request
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
        alert("User session is invalid. Please log in again.");
        return;
      }

      const response = await fetch(`http://localhost:5003/request/withdraw/${request_id}`, {
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
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.request_id === request_id ? { ...row, status: 'Withdrawn' } : row
          )
        );
        alert("Request withdrawn successfully.");
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert("An unexpected error occurred. Please try again.");
    }
  };

  // Handle Cancel Request
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
        alert("User session is invalid. Please log in again.");
        return;
      }

      const response = await fetch(`http://localhost:5003/request/cancel/${request_id}`, {
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
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.request_id === request_id ? { ...row, status: 'Cancelled' } : row
          )
        );
        alert("Request canceled successfully.");
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert("An unexpected error occurred. Please try again.");
    }
  };

  // Handle Updates after Editing
  const handleRequestUpdate = (updatedRequest) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.request_id === updatedRequest.request_id ? updatedRequest : row
      )
    );
  };

  return (
    <div>
      <Box sx={{ height: 500, width: '100%' }}>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          getRowId={(row) => `${row.staff_id}-${row.start_date}`}
        />
      </Box>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} />
    </div>
  );
}