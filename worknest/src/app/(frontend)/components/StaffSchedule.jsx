import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {
  GridRowModes,
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
  GridRowEditStopReasons,
} from '@mui/x-data-grid';

function EditToolbar(props) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = Date.now(); // Using timestamp as a unique ID for new entries
    setRows((oldRows) => [
      ...oldRows,
      { id, event_name: '', event_date: '', event_type: '', department: '', isNew: true },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add Event
      </Button>
    </GridToolbarContainer>
  );
}

export default function FullFeaturedCrudGrid() {
  const [rows, setRows] = React.useState([]);
  const [rowModesModel, setRowModesModel] = React.useState({});
  const staff_id = sessionStorage.getItem('staff_id');

  // Fetch event data from the Flask backend
  React.useEffect(() => {
    const fetchData = async () => {

      try {
        const response = await fetch(`http://localhost:5001/events/${staff_id}`); // Replace with dynamic staff_id if needed
        const data = await response.json();
        const formattedData = data.map((item) => ({
          id: item.event_id, // Assuming there's an event_id as the unique identifier
          event_name: item.event_name,
          event_date: item.event_date,
          event_type: item.event_type,
          department: item.department
        }));
        setRows(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  React.useEffect(() => {
    const fetchData = async () => {
     
      try {
        const response = await fetch(`http://localhost:5002/wfh/${staff_id}`); // Replace with dynamic staff_id if needed
        const data = await response.json();
        const formattedData = data.map((item) => ({
          approve_status: item.approve_status
        }));
        setRows(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleCancelClick = (id) => () => {
    // Handle cancel action for "Pending" status
    console.log(`Cancel request for row with id: ${id}`);
    setRows(rows.map(row => (row.id === id ? { ...row, approve_status: 'Cancelled' } : row)));
  };

  const handleWithdrawClick = (id) => () => {
    // Handle withdraw action for "Approved" status
    console.log(`Withdraw request for row with id: ${id}`);
    setRows(rows.map(row => (row.id === id ? { ...row, approve_status: 'Withdrawn' } : row)));
  };

  const handleDeleteClick = (id) => () => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleCancelEditClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns = [
    {
      field: 'event_name',
      headerName: 'Event Name',
      width: 180,
      editable: true,
    },
    {
      field: 'event_date',
      headerName: 'event Date',
      type: 'date',
      width: 180,
      editable: true,
      valueGetter: (params) => new Date(params.value),
    },
    {
      field: 'event_type',
      headerName: 'End Date',
      type: 'date',
      width: 180,
      editable: true,
      valueGetter: (params) => new Date(params.value),
    },
    {
      field: 'department',
      headerName: 'Approval Status',
      width: 150,
      editable: true,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      cellClassName: 'actions',
      getActions: ({ id, row }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: 'primary.main',
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelEditClick(id)}
              color="inherit"
            />,
          ];
        }

        // Conditional action based on approval status
        if (row.approve_status === 'Pending') {
          return [
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        if (row.approve_status === 'Approved') {
          return [
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Withdraw"
              onClick={handleWithdrawClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Box
      sx={{
        height: 500,
        width: '100%',
        '& .actions': {
          color: 'text.secondary',
        },
        '& .textPrimary': {
          color: 'text.primary',
        },
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{
          toolbar: EditToolbar,
        }}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
      />
    </Box>
  );
}