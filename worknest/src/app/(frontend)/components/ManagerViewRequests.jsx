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
    color:
        status === 'Approved' ? '#2e7d32' :
        status === 'Pending' ? '#f57c00' :
        status === 'Rejected' ? '#d32f2f' :
        status === 'Withdrawn' ? '#808080' : // For Withdrawn (shown as Cancelled)
        '#808080',
    backgroundColor:
        status === 'Approved' ? '#e8f5e9' :
        status === 'Pending' ? '#fff3e0' :
        status === 'Rejected' ? '#ffebee' :
        status === 'Withdrawn' ? '#f0f0f0' : // For Withdrawn (shown as Cancelled)
        '#f0f0f0',
}));

// Helper function to display status text
const getStatusText = (status) => {
    if (status === 'Withdrawn') {
        return 'Cancelled'; // Show Withdrawn status as Cancelled
    }
    return status;
};


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
    const [approvalComment, setApprovalComment] = useState(''); // New state for approval comment
    const [withdrawReason, setWithdrawReason] = useState(''); // New state for withdraw reason

    const statusOrder = {
        'Pending': 1,
        'Approved': 2,
        'Rejected': 3,
        'Cancelled': 4
    };

    useEffect(() => {
        const fetchRequestsAndProfiles = async () => {
            try {
                // const storedManagerId = localStorage.getItem('managerId');
                const storedManagerId = 140879; // Replace with dynamic fetching or localStorage
                
                // Fetch all requests for the current manager's department
                const requestsResponse = await fetch(`http://127.0.0.1:5001/requests/manager/${storedManagerId}`);
                const requestsData = await requestsResponse.json();
    
                if (requestsResponse.ok) {
                    setRequests(requestsData);
                } else {
                    console.error('No requests found for this manager.');
                }
    
                // Fetch all profiles (if needed)
                const profilesResponse = await fetch('http://127.0.0.1:5000/profile');
                const profilesData = await profilesResponse.json();
    
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

        if (newStatus === 'Approved' && approvalComment === '') {
            alert('Please provide a comment for approval');
            return;
        }

        const updatedRequests = requests.map((req) =>
            req.request_id === currentRequest.request_id
                ? { ...req, status: newStatus, reason: newStatus === 'Rejected' ? rejectReason : '', approvalComment: newStatus === 'Approved' ? approvalComment : '' }
                : req
        );

        setRequests(updatedRequests);
        setOpenConfirmDialog(false);
        setRejectReason('');
        setApprovalComment(''); // Reset approval comment

        // Send request to the backend (approve, reject, or withdraw)
        if (newStatus === 'Approved') {
            await approveRequest(currentRequest, approvalComment); // Pass the approval comment
        } else if (newStatus === 'Rejected') {
            await rejectRequest(currentRequest, rejectReason);
        } else if (newStatus === 'Withdrawn') {
            await withdrawRequest(currentRequest, withdrawReason);
        }

        // Re-sort requests to reflect the latest status changes
        setRequests(prevRequests => {
            return [...prevRequests]
                .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        });
    };

    const approveRequest = async (request, comment) => {
        try {
            const response = await fetch('http://127.0.0.1:5004/approve_request', {
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
                    approver_comment: comment // Include the approval comment
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
            const response = await fetch('http://127.0.0.1:5004/reject_request', {
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

    const handleWithdrawRequest = async (request) => {
        try {
            const requestId = request.request_id;
            
            // Fetch dynamic values from localStorage
            const role = localStorage.getItem('role'); // Assuming 'role' is saved in localStorage
            const staffId = localStorage.getItem('staffId'); // Assuming 'staffId' is saved in localStorage
            const department = localStorage.getItem('department'); // Assuming 'department' is saved in localStorage

            // localStorage.setItem('role', '3'); // Replace '3' with the actual role obtained dynamically
            // localStorage.setItem('staffId', '140879'); // Replace '140879' with the actual staff ID
            // localStorage.setItem('department', 'Sales'); // Replace 'Sales' with the actual department

    
            if (!role || !staffId || !department) {
                throw new Error('Missing required user information');
            }
    
            // Make the request to withdraw
            const response = await fetch(`http://127.0.0.1:5001/request/withdraw/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Role': role,
                    'X-Staff-ID': staffId,
                    'X-Department': department,
                },
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }
    
            // Update the state to reflect the withdrawn request
            setRequests((prevRequests) => 
                prevRequests.map((req) => 
                    req.request_id === requestId ? { ...req, status: 'Withdrawn' } : req
                )
            );
    
            console.log('Request withdrawn successfully');
        } catch (error) {
            console.error('Error withdrawing request:', error.message);
        }
    };
        

    const handleCloseConfirmDialog = () => {
        setOpenConfirmDialog(false);
        setRejectReason('');
        setApprovalComment(''); // Reset approval comment when dialog is closed
        setWithdrawReason('');  // Reset withdraw reason when dialog is closed
    };

    // Sorting and filtering logic
    const filteredRequests = [...requests]
        .sort((a, b) => {
            // Sort by status order first
            const statusComparison = statusOrder[a.status] - statusOrder[b.status];
            if (statusComparison !== 0) {
                return statusComparison;
            }

            // If the statuses are the same, sort by the sortConfig key
            if (sortConfig.key && a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (sortConfig.key && a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        })
        .filter((request) => {
            const requestFromDate = new Date(request.start_date).getTime();
            const requestToDate = request.end_date ? new Date(request.end_date).getTime() : requestFromDate;
            const filterFromDate = filters.from ? new Date(filters.from).getTime() : null;
            const filterToDate = filters.to ? new Date(filters.to).getTime() : null;

            // Retrieve the requester's name using the getRequesterName function
            const requesterName = getRequesterName(request.staff_id) || 'Unknown';  // Default to 'Unknown' if no match is found

            return (
                (filters.requesterName ? requesterName.toLowerCase().includes(filters.requesterName.toLowerCase()) : true) &&
                (filters.status ? request.status.toLowerCase().includes(filters.status.toLowerCase()) : true) &&
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
                                        {getStatusText(request.status)}
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
                                        disabled={request.status === 'Approved' || request.status === 'Cancelled' || request.status === 'Withdrawn'}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => handleStatusChange(request, 'Rejected')}
                                        style={{ marginRight: '10px' }}
                                        disabled={request.status === 'Rejected' || request.status === 'Cancelled' || request.status === 'Approved' || request.status === 'Withdrawn'}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleWithdrawRequest(request)}
                                        disabled={request.status !== 'Approved'}
                                    >
                                        Withdraw
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
                    {newStatus === 'Approved' && (
                        <>
                            <Typography variant="body1" gutterBottom>
                                Please provide a comment for approval:
                            </Typography>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Approval Comment"
                                type="text"
                                fullWidth
                                value={approvalComment}
                                onChange={(e) => setApprovalComment(e.target.value)}
                            />
                        </>
                    )}
                    {newStatus === 'Withdrawn' && (
                        <>
                            <Typography variant="body1" gutterBottom>
                                Please provide a reason for withdrawal:
                            </Typography>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Withdraw Reason"
                                type="text"
                                fullWidth
                                value={withdrawReason}
                                onChange={(e) => setWithdrawReason(e.target.value)}
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
