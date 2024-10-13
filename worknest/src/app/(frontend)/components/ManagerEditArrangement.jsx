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
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Snackbar,
    Alert,
    TextField
} from '@mui/material';
// Import CSS for styling if needed
import '../../styles/EditArrangement.css';
import FilterForm from './FilterForm';

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
        status: ''
    });

    const handleSelectArrangement = (arrangement) => {
        setSelectedArrangement(arrangement);
        setNewStatus(arrangement.status);
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

        setSelectedArrangement(null);
        setNewStatus('');
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

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
                            <TableCell><strong>Arrangement ID</strong></TableCell>
                            <TableCell><strong>Staff Name</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>From</strong></TableCell>
                            <TableCell><strong>To</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredArrangements.map((arrangement) => (
                            <TableRow key={arrangement.id}>
                                <TableCell>{arrangement.id}</TableCell>
                                <TableCell>{arrangement.staffName}</TableCell>
                                <TableCell>{arrangement.status}</TableCell>
                                <TableCell>{arrangement.from}</TableCell>
                                <TableCell>{arrangement.to}</TableCell>
                                <TableCell>
                                    <Button onClick={() => handleSelectArrangement(arrangement)}>Edit</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {selectedArrangement && (
                <div className="edit-status-section">
                    <h2>Edit Status for {selectedArrangement.staffName}</h2>
                    <FormControl fullWidth variant="outlined" className="form-control" sx={{ marginTop: '20px' }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            label="Status"
                            className="select-status"
                        >
                            <MenuItem value="Approved">Approved</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                            <MenuItem value="Pending">Pending</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="contained" color="primary" className="change-status-btn" onClick={handleChangeStatus}>
                        Change Status
                    </Button>
                </div>
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
