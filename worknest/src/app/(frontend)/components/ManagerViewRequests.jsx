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
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Typography
} from '@mui/material';
import { styled } from '@mui/system';
import FilterForm from './FilterForm';

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

// Helper function to format date as YYYY-MM-DD
const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Invalid Date';
    }
    return date.toISOString().split('T')[0];
};

// Helper function to convert day_id to day of the week
const getDayOfWeek = (dayId) => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return daysOfWeek[dayId - 1]; // Adjust index (1 = Monday, 7 = Sunday)
};

// Recurring day helper function
const recurringDaysString = (recurringDays) => {
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return recurringDays ? recurringDays.map(day => daysOfWeek[day - 1]).join(', ') : '-';
};

const ManagerViewRequests = () => {
    const [requests, setRequests] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        requesterName: '',
        status: '',
        from: '',
        to: '',
    });
    const [sortConfig, setSortConfig] = useState({ key: 'requesterName', direction: 'asc' });
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [currentRequest, setCurrentRequest] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [rejectReason, setRejectReason] = useState('');

    // Fetch all requests from the backend using fetch
    useEffect(() => {
        const fetchRequestsAndProfiles = async () => {
            try {
                const requestsResponse = await fetch('http://127.0.0.1:5003/request');
                const requestsData = await requestsResponse.json();

                const profilesResponse = await fetch('http://127.0.0.1:5002/profile');
                const profilesData = await profilesResponse.json();

                setRequests(requestsData);
                setProfiles(profilesData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching requests or profiles:', error);
                setLoading(false);
            }
        };

        fetchRequestsAndProfiles();
    }, []);

    // Helper function to get full name from profiles
    const getRequesterName = (staffId) => {
        const profile = profiles.find(p => p.staff_id === staffId);
        return profile ? `${profile.staff_fname} ${profile.staff_lname}` : 'Unknown';
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    const handleSort = (column) => {
        const isAsc = sortConfig.key === column && sortConfig.direction === 'asc';
        setSortConfig({ key: column, direction: isAsc ? 'desc' : 'asc' });
    };

    const sortedRequests = [...requests].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const handleStatusChange = (request, newStatus) => {
        setCurrentRequest(request);
        setNewStatus(newStatus);
        setOpenConfirmDialog(true); // Open confirmation dialog
    };

    const handleConfirmStatusChange = async () => {
        if (newStatus === 'Rejected' && rejectReason === '') {
            alert('Please provide a reason for rejection');
            return;
        }

        const updatedRequests = requests.map((req) =>
            req.request_id === currentRequest.request_id
                ? { ...req, status: newStatus, reason: newStatus === 'Rejected' ? rejectReason : '' }
                : req
        );

        setRequests(updatedRequests);
        setOpenConfirmDialog(false);
        setRejectReason('');

        // Send request to the backend (approve or reject)
        if (newStatus === 'Approved') {
            await approveRequest(currentRequest);
        } else if (newStatus === 'Rejected') {
            await rejectRequest(currentRequest, rejectReason);
        }
    };

    const approveRequest = async (request) => {
        try {
            const response = await fetch('http://127.0.0.1:5006/approve_request', {
                method: 'POST',
                credentials: 'include', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    request_id: request.request_id,
                    reporting_manager_id: request.reporting_manager_id,
                    approver_email: request.reporting_manager_email,
                    requester_email: request.requester_email,
                    wfh_date: request.start_date,
                    end_date: request.end_date,  // Include end_date when available
                    approver_comment: ''
                }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to approve request');
            }
    
            console.log('Request approved');
        } catch (error) {
            console.error('Error approving request:', error);
        }
    };    

    const rejectRequest = async (request, reason) => {
        try {
            const response = await fetch('http://127.0.0.1:5006/reject_request', {
                method: 'POST',
                credentials: 'include', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    request_id: request.request_id,
                    reporting_manager_id: request.reporting_manager_id,  // Use reporting_manager_id
                    approver_email: request.reporting_manager_email,
                    requester_email: request.requester_email,  // Requester's email
                    wfh_date: request.start_date,  // WFH date from the request
                    approver_comment: reason  // Rejection reason
                }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to reject request');
            }
    
            console.log('Request rejected');
        } catch (error) {
            console.error('Error rejecting request:', error);
        }
    };
    

    const handleCloseConfirmDialog = () => {
        setOpenConfirmDialog(false);
        setRejectReason('');
    };

    const filteredRequests = sortedRequests.filter((request) => {
        const requestFromDate = new Date(request.start_date).getTime();
        const requestToDate = request.end_date ? new Date(request.end_date).getTime() : requestFromDate;
        const filterFromDate = filters.from ? new Date(filters.from).getTime() : null;
        const filterToDate = filters.to ? new Date(filters.to).getTime() : null;
    
        // Retrieve the requester's name using the getRequesterName function
        const requesterName = getRequesterName(request.staff_id) || 'Unknown';  // Default to 'Unknown' if no match is found
    
        // Check if the status matches one of the three: "Approved", "Pending", "Rejected"
        const matchesStatus = filters.status
            ? request.status.toLowerCase().includes(filters.status.toLowerCase()) ||
              (filters.status.toLowerCase() === 'all')
            : true;
    
        return (
            (filters.requesterName ? requesterName.toLowerCase().includes(filters.requesterName.toLowerCase()) : true) &&
            matchesStatus &&
            (filterFromDate ? requestFromDate >= filterFromDate : true) &&
            (filterToDate ? requestToDate <= filterToDate : true)
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
            requesterName: '',
            status: '',
            from: '',
            to: '',
        });
    };
    
    // Define filterOptions here
    const filterOptions = [
        {
            key: 'requesterName',
            label: 'Requester Name',
            // Get names of users who have submitted requests (from requests, not profiles)
            options: [...new Set(requests.map((request) => getRequesterName(request.staff_id)))],
            value: filters.requesterName,
            fullWidth: true,
        },
        {
            key: 'status',
            label: 'Status',
            options: [...new Set(requests.map((request) => request.status))],
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
                    float: 'right',
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
                                    <strong>Start Date</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'end_date'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('end_date')}
                                >
                                    <strong>End Date</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell><strong>Request Status</strong></TableCell>
                            <TableCell><strong>Day(s)</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRequests.map((request) => (
                            <TableRow key={request.request_id}>
                                <TableCell>{getRequesterName(request.staff_id)}</TableCell>
                                <TableCell>{formatDate(request.start_date)}</TableCell>
                                <TableCell>{request.end_date ? formatDate(request.end_date) : 'N/A'}</TableCell>
                                <TableCell>
                                    <StatusLabel status={request.status}>
                                        {request.status}
                                    </StatusLabel>
                                </TableCell>
                                <TableCell>
                                    {/* Display single day or recurring days */}
                                    {request.day_id 
                                        ? getDayOfWeek(request.day_id) 
                                        : recurringDaysString(request.recurring_days)}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={() => handleStatusChange(request, 'Approved')}
                                        style={{ marginRight: '10px' }}
                                        disabled={request.status === 'Approved'}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => handleStatusChange(request, 'Rejected')}
                                        disabled={request.status === 'Rejected'}
                                    >
                                        Reject
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Confirmation Dialog */}
            <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
                <DialogTitle>Confirm Status Change</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to change the status of this request to <strong>{newStatus}</strong>?
                    </DialogContentText>
                    {newStatus === 'Rejected' && (
                        <>
                            <Typography variant="body1" gutterBottom>
                                Please provide a reason for rejection:
                            </Typography>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Rejection Reason"
                                type="text"
                                fullWidth
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmStatusChange} color="primary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ManagerViewRequests;
