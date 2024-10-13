"use client";
import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Snackbar,
    Alert,
    TableSortLabel,
} from '@mui/material';
import '../../styles/EditArrangement.css';
import FilterForm from './FilterForm';
import EditForm from './ManagerEditForm'; // Import the new EditForm component

const EditArrangement = () => {
    const [arrangements, setArrangements] = useState([
        {
            id: 1,
            staffName: "John Doe",
            status: "Approved",
            from: "2023-01-10",
            to: "2023-12-31"
        },
        {
            id: 2,
            staffName: "Jane Smith",
            status: "Rejected",
            from: "2023-02-15",
            to: "2023-06-30"
        },
        {
            id: 3,
            staffName: "Tom Johnson",
            status: "Approved",
            from: "2023-03-20",
            to: "2023-12-31"
        },
        {
            id: 4,
            staffName: "Emily Brown",
            status: "Pending",
            from: "2023-04-01",
            to: "2023-10-31"
        },
    ]);

    const [selectedArrangement, setSelectedArrangement] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [notification, setNotification] = useState({ open: false, message: '', severity: '' });
    // Filter states
    const [filters, setFilters] = useState({
        staffName: '',
        status: '',
        from: '',
        to: '',
    });

    // Modal open state
    const [openDialog, setOpenDialog] = useState(false);

    const handleSelectArrangement = (arrangement) => {
        setSelectedArrangement(arrangement);
        setNewStatus(arrangement.status);
        setOpenDialog(true); // Open the dialog when "Edit" is clicked
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleChangeStatus = () => {
        if (!selectedArrangement) return;

        const updatedArrangements = arrangements.map(arr =>
            arr.id === selectedArrangement.id ? { ...arr, status: newStatus } : arr
        );
        setArrangements(updatedArrangements);

        setNotification({
            open: true,
            message: `Status updated to ${newStatus}`,
            severity: 'success',
        });

        setOpenDialog(false); // Close the dialog after the status is changed
        setSelectedArrangement(null);
        setNewStatus('');
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    // Sorting state and logic
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

    const handleSort = (column) => {
        const isAsc = sortConfig.key === column && sortConfig.direction === 'asc';
        setSortConfig({ key: column, direction: isAsc ? 'desc' : 'asc' });
    };

    const sortedArrangements = [...arrangements].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Filtering logic
    const filteredArrangements = arrangements.filter((arrangement) => {
        return (
            (filters.staffName ? arrangement.staffName.toLowerCase().includes(filters.staffName.toLowerCase()) : true) &&
            (filters.status ? arrangement.status === filters.status : true)
        );
    });

    const handleFilterChange = (key, value) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [key]: value,
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            staffName: '',
            status: ''
        });
    };

    const filterOptions = [
        {
            key: 'staffName',
            label: 'Staff Name',
            options: [...new Set(arrangements.map(arrangement => `${arrangement.staffName}`))],
            value: filters.name,
            fullWidth: true,
        },
        {
            key: 'status',
            label: 'Status',
            options: [...new Set(arrangements.map(arrangement => arrangement.status))],
            value: filters.role,
            fullWidth: true,
        },
        {
            key: 'from',
            label: 'From Date',
            options: [],
            value: filters.from,
            fullWidth: false,
            type: 'date',
        },
        {
            key: 'to',
            label: 'To Date',
            options: [],
            value: filters.to,
            fullWidth: false,
            type: 'date',
        },
    ];

    // Conditional styling for status
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Approved':
                return {
                    backgroundColor: 'rgba(76, 175, 80, 0.1)', // Light green background
                    color: 'green',
                    padding: '6px 12px',
                    width: '100%',
                    borderRadius: '20px',
                    display: 'inline-block',
                    fontWeight: 'bold',
                    textAlign: 'center',
                };
            case 'Pending':
                return {
                    backgroundColor: 'rgba(255, 165, 0, 0.1)', // Light orange background
                    color: 'orange',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    width: '100%',
                    display: 'inline-block',
                    fontWeight: 'bold',
                    textAlign: 'center',
                };
            case 'Rejected':
                return {
                    backgroundColor: 'rgba(244, 67, 54, 0.1)', // Light red background
                    color: 'red',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    width: '100%',
                    display: 'inline-block',
                    fontWeight: 'bold',
                    textAlign: 'center',
                };
            default:
                return {};
        }
    };

    return (
        <div className="edit-arrangement-container">
            {/* Filter Form */}
            <FilterForm filters={filterOptions} onFilterChange={handleFilterChange} />
            <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleClearFilters} 
                style={{ 
                    backgroundColor: '#21005D', 
                    color: 'white', 
                    marginTop: '20px', 
                    marginBottom: '20px', 
                    float: 'right' 
                }}
            >
                Clear Filters
            </Button>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'id'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('id')}
                                >
                                    <strong>Arrangement ID</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'staffName'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('staffName')}
                                >
                                    <strong>Staff Name</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'from'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('from')}
                                >
                                    <strong>From</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'to'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('to')}
                                >
                                    <strong>To</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'status'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('status')}
                                >
                                    <strong>Status</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedArrangements.map((arrangement) => (
                            <TableRow key={arrangement.id}>
                                <TableCell>{arrangement.id}</TableCell>
                                <TableCell>{arrangement.staffName}</TableCell>
                                <TableCell>{arrangement.from}</TableCell>
                                <TableCell>{arrangement.to}</TableCell>
                                <TableCell>
                                    <div style={getStatusStyle(arrangement.status)}>
                                        {arrangement.status}
                                    </div></TableCell>
                                <TableCell>
                                    <Button onClick={() => handleSelectArrangement(arrangement)}>Edit</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Edit Form Modal */}
            {selectedArrangement && (
                <EditForm
                    open={openDialog}
                    onClose={handleCloseDialog}
                    arrangement={selectedArrangement}
                    newStatus={newStatus}
                    setNewStatus={setNewStatus}
                    handleChangeStatus={handleChangeStatus}
                />
            )}

            <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
                <Alert onClose={handleCloseNotification} severity={notification.severity}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default EditArrangement;
