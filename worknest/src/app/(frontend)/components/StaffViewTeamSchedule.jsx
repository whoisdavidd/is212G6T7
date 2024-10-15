import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';

export default function FullFeaturedCrudGrid() {
  const [rows, setRows] = React.useState([]);

  // Fetch schedule data from the Flask backend
  React.useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch(`http://localhost:5004/schedules`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch schedules');
        }
        const data = await response.json();
        const formattedData = data.map((item) => ({
          staff_id: item.staff_id,
          department: item.department,
          start_date: item.date,
          status: item.status,
        }));
        setRows(formattedData);
      } catch (error) {
        console.error('Error fetching schedule data:', error);
      }
    };
    fetchSchedules();
  }, []);

  const columns = [
    { field: 'staff_id', headerName: 'Staff ID', width: 100 },
    { field: 'department', headerName: 'Department', width: 150 },
    { field: 'start_date', headerName: 'Start Date', width: 150 },
    { field: 'status', headerName: 'Status', width: 120 },
  ];

  return (
    <Box sx={{ height: 500, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowId={(row) => `${row.staff_id}-${row.start_date}`}
      />
    </Box>
  );
}
