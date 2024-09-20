import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Typography, Box } from '@mui/material';

const columns = [
  { field: 'staff_id', headerName: 'Staff ID', width: 70 }, //field must follow exactly
  { field: 'department', headerName: 'Department', width: 130 },
  { field: 'location', headerName: 'Location', width: 130 },
  
];

// const rows = [

const paginationModel = { page: 0, pageSize: 5 };

export default function DataTable({rows}) {
  return (
    <Paper
      elevation={3}  // Adds shadow for better depth
      sx={{
        padding: '20px',
        borderRadius: '10px', // Rounded corners
        marginTop: '20px',
        width: '100%',
        boxShadow: '0 3px 6px rgba(0,0,0,0.1)', // Subtle shadow for a clean look
      }}
    >
      <Typography variant="h6" sx={{ marginBottom: '10px' }}>
        Departments Overview
      </Typography>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.staff_id}  // Set 'staff_id' as the unique row identifier
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        disableColumnMenu  // Hide the column menu for a cleaner look
        disableSelectionOnClick  // Disable row selection on click
        sx={{
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f5f5f5',  // Light background for header
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-cell': {
            padding: '8px',
          },
          '& .MuiDataGrid-row': {
            '&:nth-of-type(odd)': {
              backgroundColor: '#f9f9f9',  // Alternating row colors for readability
            },
            '&:hover': {
              backgroundColor: '#f1f1f1',  // Light hover effect
            },
          },
        }}
      />
    </Paper>
  );
}