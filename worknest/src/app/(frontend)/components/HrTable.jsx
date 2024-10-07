import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Typography, Link, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';



const columns = [
  { field: 'staff_id', headerName: 'Staff ID', width: 70 }, //field must follow exactly
  { field: 'department', headerName: 'Department', width: 130 },
  { field: 'staff_name', headerName: 'Staff Name', width: 130 },
  { field: 'location', headerName: 'Location', width: 130 },
  { field: 'date', headerName: 'Date', width: 130 },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 150,
    renderCell: (params) => <ViewMoreDetails row={params.row} />
  }
  
];

// const rows = [

const paginationModel = { page: 0, pageSize: 10 };

function ViewMoreDetails({ row }) {
  const [open, setOpen] = React.useState(false); // State to control modal open/close
  const handleClickOpen = () => {
    setOpen(true); // Open the modal
  };
  const handleClose = () => {
    setOpen(false); // Close the modal
  };

  return (
    <>
      <Link onClick={handleClickOpen} style={{ cursor: 'pointer' }}>
        View More Details
      </Link>

      {/* Modal (Dialog) for viewing more details */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Details for {row.staff_name}</DialogTitle>
        <DialogContent>
          <p><strong>Staff ID:</strong> {row.staff_id}</p>
          <p><strong>Department:</strong> {row.department}</p>
          <p><strong>Location:</strong> {row.location}</p>
          <p><strong>Date:</strong> {row.date}</p>
          {/* Add more detailed info if needed */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function HrTable({ rows }) {
  return (
    <Paper
      elevation={3}
      sx={{
        padding: '20px',
        borderRadius: '10px',
        marginTop: '20px',
        width: '100%',
        boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
      }}
    >
      <Typography variant="h6" sx={{ marginBottom: '10px' }}>
        Departments Overview
      </Typography>

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.staff_id}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[10, 20, 100]}
        disableSelectionOnClick
        filterMode="client"
        sx={{
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f5f5f5',
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-cell': {
            padding: '8px',
          },
          '& .MuiDataGrid-row': {
            '&:nth-of-type(odd)': {
              backgroundColor: '#f9f9f9',
            },
            '&:hover': {
              backgroundColor: '#f1f1f1',
            },
          },
        }}
      />
    </Paper>
  );
}