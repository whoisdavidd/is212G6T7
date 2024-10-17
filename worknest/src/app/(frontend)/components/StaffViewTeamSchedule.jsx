import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { Typography } from '@mui/material';

export default function StaffViewTeamSchedule() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const staffId = sessionStorage.getItem('staff_id');
  const department = sessionStorage.getItem('department');

  // Fetch schedule data from the Flask backend
  React.useEffect(() => {
    const fetchSchedules = async () => {
      if (!staffId) {
        setError('Staff ID not found. Please log in again.');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`http://localhost:5004/schedules?staff_id=${staffId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch schedules');
        }
        const data = await response.json();
        const formattedData = data.map((item) => ({
          id: `${item.staff_id}-${item.date}`,
          staff_id: item.staff_id,
          department: item.department,
          start_date: item.date,
          status: item.status,
        }));
        setRows(formattedData);
      } catch (error) {
        console.error('Error fetching schedule data:', error);
        setError('Failed to fetch schedules. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [staffId]);

  const columns = [
    { field: 'staff_id', headerName: 'Staff ID', width: 100 },
    { field: 'department', headerName: 'Department', width: 150 },
    { field: 'start_date', headerName: 'Start Date', width: 150 },
    { field: 'status', headerName: 'Status', width: 120 },
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
