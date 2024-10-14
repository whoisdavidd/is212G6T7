import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    TableSortLabel,
    Box,
    Modal,
    Typography
} from '@mui/material';
import { styled } from '@mui/system';
import FilterForm from './FilterForm';
import { MainContainer, SectionTitle } from '../styles/IndexStyles';

// Styled components for status labels
const StatusLabel = styled(Box)(({ status }) => ({
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '16px',
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'center',
    color: status === 'Approved' ? '#2e7d32' : status === 'Pending' ? '#f57c00' : '#d32f2f',
    backgroundColor:
        status === 'Approved' ? '#e8f5e9' : status === 'Pending' ? '#fff3e0' : '#ffebee',
}));

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const formatDate = (dateString) => {
    const date = new Date(dateString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Invalid Date'; // You can return 'Invalid Date' or handle it differently
    }

    // Extract YYYY-MM-DD from the ISO string
    return date.toISOString().split('T')[0];
};

const ManagerViewRequests = () => {
    const [requests, setRequests] = useState([]);
    const [filters, setFilters] = useState({
        requesterName: '',
        status: '',
        from: '',
        to: '',
    });

    const [sortConfig, setSortConfig] = useState({ key: 'requesterName', direction: 'asc' });
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [open, setOpen] = useState(false);

    // Fetch manager's team requests
    useEffect(() => {
        const fetchManagerRequests = async () => {
            const managerId = sessionStorage.getItem('staff_id');
            const authToken = sessionStorage.getItem('authToken'); // If using tokens

            if (!managerId) {
                console.error('Manager ID not found in session storage.');
                return;
            }

            try {
                const response = await fetch(`http://localhost:5003/manager_requests/${managerId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authToken}`, // If using tokens
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch manager requests');
                }

                const data = await response.json();
                console.log(data);
                setRequests(data);
            } catch (error) {
                console.error('Error fetching manager requests:', error);
            }
        };

        fetchManagerRequests();
    }, []);

    // Handle sorting
    const handleSort = (column) => {
        const isAsc = sortConfig.key === column && sortConfig.direction === 'asc';
        setSortConfig({ key: column, direction: isAsc ? 'desc' : 'asc' });
    };

    // Sort requests
    const sortedRequests = [...requests].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    // Filter requests
    useEffect(() => {
        const filtered = sortedRequests.filter(request => {
            const requestFromDate = new Date(request.start_date).getTime();
            // Assuming 'to' date is same as 'start_date' for simplicity
            const requestToDate = new Date(request.start_date).getTime();

            const filterFromDate = filters.from ? new Date(filters.from).getTime() : null;
            const filterToDate = filters.to ? new Date(filters.to).getTime() : null;

            return (
                (filters.requesterName
                    ? `${request.requesterName}`.toLowerCase().includes(filters.requesterName.toLowerCase())
                    : true) &&
                (filters.status
                    ? request.status.toLowerCase().includes(filters.status.toLowerCase())
                    : true) &&
                (filterFromDate ? requestFromDate >= filterFromDate : true) &&
                (filterToDate ? requestToDate <= filterToDate : true)
            );
        });
        setFilteredRequests(filtered);
    }, [sortedRequests, filters]);

    const handleFilterChange = (key, value) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [key]: value,
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            requesterName: '',
            status: '',
            from: '',
            to: '',
        });
    };

    const handleRowClick = (request) => {
        setSelectedRequest(request);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedRequest(null);
    };

    // Define filterOptions
    const filterOptions = [
        {
            key: 'requesterName',
            label: 'Requester Name',
            options: [...new Set(requests.map(request => request.requesterName))],
            value: filters.requesterName,
            fullWidth: true,
        },
        {
            key: 'status',
            label: 'Status',
            options: ['Pending', 'Approved', 'Rejected'],
            value: filters.status,
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
        <div className="table-container">
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
                                    active={sortConfig.key === 'requesterName'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('requesterName')}
                                >
                                    <strong>Requester Name</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'start_date'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('start_date')}
                                >
                                    <strong>Requested Date</strong>
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
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRequests.map((request) => (
                            <TableRow 
                                key={request.request_id} 
                                hover 
                                onClick={() => handleRowClick(request)} 
                                style={{ cursor: 'pointer' }}
                            >
                                <TableCell>{request.requesterName}</TableCell>
                                <TableCell>{formatDate(request.start_date)}</TableCell>
                                <TableCell>
                                    <StatusLabel status={request.status}>
                                        {request.status}
                                    </StatusLabel>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredRequests.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    No requests found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal to display full request details */}
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="request-details-title"
                aria-describedby="request-details-description"
            >
                <Box sx={modalStyle}>
                    {selectedRequest && (
                        <>
                            <Typography id="request-details-title" variant="h6" component="h2">
                                Request Details
                            </Typography>
                            <Typography id="request-details-description" sx={{ mt: 2 }}>
                                <strong>Requester Name:</strong> {selectedRequest.requesterName}
                            </Typography>
                            <Typography sx={{ mt: 1 }}>
                                <strong>Requested Date:</strong> {formatDate(selectedRequest.start_date)}
                            </Typography>
                            <Typography sx={{ mt: 1 }}>
                                <strong>Status:</strong> {selectedRequest.status}
                            </Typography>
                            <Typography sx={{ mt: 1 }}>
                                <strong>Reason:</strong> {selectedRequest.reason}
                            </Typography>
                            <Typography sx={{ mt: 1 }}>
                                <strong>Duration:</strong> {selectedRequest.duration}
                            </Typography>
                            {selectedRequest.approver_comment && (
                                <Typography sx={{ mt: 1 }}>
                                    <strong>Approver Comment:</strong> {selectedRequest.approver_comment}
                                </Typography>
                            )}
                            <Button 
                                onClick={handleClose} 
                                variant="contained" 
                                color="primary" 
                                sx={{ mt: 2 }}
                            >
                                Close
                            </Button>
                        </>
                    )}
                </Box>
            </Modal>
        </div>
    );

};

export default ManagerViewRequests;