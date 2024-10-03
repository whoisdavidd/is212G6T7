// import * as React from 'react';
// import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
// import AddIcon from '@mui/icons-material/Add';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/DeleteOutlined';
// import SaveIcon from '@mui/icons-material/Save';
// import CancelIcon from '@mui/icons-material/Close';
// import WfhButton from './WfhButton';

// import {
//   GridRowModes,
//   DataGrid,
//   GridToolbarContainer,
//   GridActionsCellItem,
//   GridRowEditStopReasons,
// } from '@mui/x-data-grid';

// // function EditToolbar(props) {
// //   const { setRows, setRowModesModel } = props;

// //   const handleClick = () => {
// //     const id = Date.now(); // Using timestamp as a unique ID for new entries
// //     setRows((oldRows) => [
// //       ...oldRows,
// //       { id, event_name: '', event_date: '', event_type: '', department: '', isNew: true },
// //     ]);
// //     setRowModesModel((oldModel) => ({
// //       ...oldModel,
// //       [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
// //     }));
// //   };

// //   return (
// //     <GridToolbarContainer>
// //       <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
// //         Add Event
// //       </Button>
// //     </GridToolbarContainer>
// //   );
// // }

// export default function FullFeaturedCrudGrid() {
//   const [rows, setRows] = React.useState([]);
//   const [rowModesModel, setRowModesModel] = React.useState({});
//   const staff_id = 210030;

//   // Fetch event data from the Flask backend
//   React.useEffect(() => {
//     const fetchEventData = async () => {
//       try {
//         const response = await fetch(`http://localhost:5001/events/${staff_id}`);
//         const data = await response.json();
//         const formattedData = data.map((item) => ({
//           event_id: item.event_id,
//           event_name: item.event_name,
//           event_date: new Date(item.event_date),
//           start_date: new Date(item.start_date),
//           end_date: new Date(item.end_date),
//           reason: item.reason,
//           event_type: item.event_type,
//           department: item.department
//         }));
//         setRows(formattedData);
//       } catch (error) {
//         console.error('Error fetching event data:', error);
//       }
//     };
//     fetchEventData();
//   }, []);

//   // Fetch WFH data and update existing rows
//   React.useEffect(() => {
//     const fetchWFHData = async () => {
//       try {
//         const response = await fetch(`http://localhost:5002/wfh/${staff_id}`);
//         const data = await response.json();
//         setRows(prevRows => prevRows.map((row, index) => ({
//           ...row,
//           approve_status: data[index]?.approve_status || 'N/A'
//         })));
//       } catch (error) {
//         console.error('Error fetching WFH data:', error);
//       }
//     };
//     fetchWFHData();
//   }, []);

//   const handleRowEditStop = (params, event) => {
//     if (params.reason === GridRowEditStopReasons.rowFocusOut) {
//       event.defaultMuiPrevented = true;
//     }
//   };

//   // const handleEditClick = (id) => () => {
//   //   setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
//   // };

//   // const handleSaveClick = (id) => () => {
//   //   setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
//   // };

//   const handleCancelClick = (event_id) => async () => {
//     try {
//       const response = await fetch(`http://localhost:5002/wfh/${event_id}/cancel`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         const updatedWfh = await response.json();
//         setRows(rows.map(row => (row.event_id === event_id ? { ...row, approve_status: 'Cancelled' } : row)));
//         console.log(`Cancelled request for event with id: ${event_id}`);
//       } else {
//         console.error('Failed to cancel request');
//       }
//     } catch (error) {
//       console.error('Error cancelling request:', error);
//     }
//   };

//   const handleWithdrawClick = (event_id) => async () => {
//     try {
//       const response = await fetch(`http://localhost:5002/wfh/${event_id}/withdraw`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         const updatedWfh = await response.json();
//         setRows(rows.map(row => (row.event_id === event_id ? { ...row, approve_status: 'Withdrawn' } : row)));
//         console.log(`Withdrawn request for event with id: ${event_id}`);
//       } else {
//         console.error('Failed to withdraw request');
//       }
//     } catch (error) {
//       console.error('Error withdrawing request:', error);
//     }
//   };

//   const handleDeleteClick = (event_id) => () => {
//     setRows(rows.filter((row) => row.event_id !== event_id));
//   };

//   const handleCancelEditClick = (event_id) => () => {
//     setRowModesModel({
//       ...rowModesModel,
//     [event_id]: { mode: GridRowModes.View, ignoreModifications: true },
//     });

//     const editedRow = rows.find((row) => row.event_id === event_id);
//     if (editedRow.isNew) {
//       setRows(rows.filter((row) => row.event_id !== event_id));
//     }
//   };

//   const processRowUpdate = (newRow) => {
//     const updatedRow = { ...newRow, isNew: false };
//     setRows(rows.map((row) => (row.event_id === newRow.event_id ? updatedRow : row)));
//     return updatedRow;
//   };

//   const handleRowModesModelChange = (newRowModesModel) => {
//     setRowModesModel(newRowModesModel);
//   };

//   const columns = [
//     {
//       field: 'event_name',
//       headerName: 'Event Name',
//       width: 180,
//       editable: false,
//     },
//     {
//       field: 'event_date',
//       headerName: 'Event Date',
//       type: 'date',
//       width: 180,
//       editable: false,
//       valueGetter: (params) => {
//         // Ensure the value is a Date object
//         return params.value instanceof Date ? params.value : new Date(params.value);
//       },
//     },
//     {
//       field: 'start_date',
//       headerName: 'Start Date',
//       type: 'date',
//       width: 180,
//       editable: false,
//       valueGetter: (params) => {
//         // Ensure the value is a Date object
//         return params.value instanceof Date ? params.value : new Date(params.value);
//       },
//     },
//     {
//       field: 'end_date',
//       headerName: 'End Date',
//       type: 'date',
//       width: 180,
//       editable: false,
//       valueGetter: (params) => {
//         // Ensure the value is a Date object
//         return params.value instanceof Date ? params.value : new Date(params.value);
//       },
//     },
//     {
//       field: 'approve_status',
//       headerName: 'Approval Status',
//       width: 150,
//       editable: false,
//     },
//     {
//       field: 'actions',
//       headerName: 'Actions',
//       width: 150,
//       cellClassName: 'actions',
//       renderCell: (params) => {
//         const { row } = params;
  
//         if (row.approve_status === 'Pending') {
//           return (
//             <Button
//               variant="contained"
//               color="secondary"
//               size="small"
//               onClick={handleCancelClick(row.event_id)}
//             >
//               Cancel
//             </Button>
//           );
//         }
  
//         if (row.approve_status === 'Approved') {
//           return (
//             <Button
//               variant="contained"
//               color="primary"
//               size="small"
//               onClick={handleWithdrawClick(row.event_id)}
//             >
//               Withdraw
//             </Button>
//           );
//         }
//         // No action button for 'Cancelled', 'Withdrawn', or other statuses
//         return null;
//       },
//     },
//   ];

//   return (
//     <div>
//       <WfhButton />
//       <Box
//         sx={{
//           height: 500,
//           width: '100%',
//           '& .actions': {
//             color: 'text.secondary',
//           },
//           '& .textPrimary': {
//             color: 'text.primary',
//           },
//         }}
//       >
//         <DataGrid
//           rows={rows}
//           columns={columns}
//           editMode="row"
//           rowModesModel={rowModesModel}
//           onRowModesModelChange={handleRowModesModelChange}
//           onRowEditStop={handleRowEditStop}
//           processRowUpdate={processRowUpdate}
//           getRowId={(row) => row.event_id}  // Add this line
//         // slots={{
//         //   toolbar: EditToolbar,
//         // }}
//         slotProps={{
//           toolbar: { setRows, setRowModesModel },
//         }}
//       />
//     </Box>
//     </div>
//   );
// }


import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import WfhButton from './WfhButton';
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




