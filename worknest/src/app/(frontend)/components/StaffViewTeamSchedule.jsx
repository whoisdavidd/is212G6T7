"use client";
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { Typography, Button } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function StaffViewTeamSchedule() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [staffId, setStaffId] = useState(null);
  const [department, setDepartment] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedStaffId = sessionStorage.getItem('staff_id');
      const storedDepartment = sessionStorage.getItem('department');
      setStaffId(storedStaffId);
      setDepartment(storedDepartment);

      const fetchSchedules = async () => {
        if (!storedStaffId) {
          toast.error('Staff ID not found. Please log in again.');
          setError('Staff ID not found. Please log in again.');
          setLoading(false);
          return;
        }
        try {
          const response = await fetch(`http://localhost:5004/schedules/${storedStaffId}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch schedules');
          }
          const data = await response.json();
          if (data.length === 0) {
            toast.info('No schedules found.');
            setError('No schedules found.');
          } else {
            const formattedData = data.map((item) => ({
              id: `${item.staff_id}-${item.date}`,
              staff_id: item.staff_id,
              department: item.department,
              start_date: item.date,
              status: item.status,
            }));
            setRows(formattedData);
          }
        } catch (error) {
          console.error('Error fetching schedule data:', error);
          toast.error('Failed to fetch schedules. Please try again later.');
          setError('Failed to fetch schedules. Please try again later.');
        } finally {
          setLoading(false);
        }
      };
      fetchSchedules();
    }
  }, []);

  const handleCancelClick = (request_id) => {
    // Implement cancellation logic if applicable
    // This function might be passed down or handled differently
  };

  const columns = [
    { field: 'staff_id', headerName: 'Staff ID', width: 100 },
    { field: 'department', headerName: 'Department', width: 150 },
    { field: 'start_date', headerName: 'Start Date', width: 150 },
    { field: 'status', headerName: 'Status', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => {
        const { staff_id, status } = params.row;
        return (
          <div>
            {staff_id === staffId && status === 'Pending' && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleCancelClick(params.row.request_id)}
              >
                Cancel
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  if (loading) return <Typography>Loading schedules...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ height: 500, width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {department ? `Team Schedule for ${department} Department` : 'All Schedules'}
      </Typography>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowId={(row) => row.id}
      />
    </Box>
  );
}
