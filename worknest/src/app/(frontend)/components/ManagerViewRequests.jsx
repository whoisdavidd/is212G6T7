import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TableSortLabel,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Typography,
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
    return recurringDays ? recurringDays.map((day) => daysOfWeek[day - 1]).join(', ') : '-';
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

    const statusOrder = {
        Pending: 1,
        Approved: 2,
        Rejected: 3,
        Cancelled: 4,
    };

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
        const profile = profiles.find((p) => p.staff_id === staffId);
        return profile ? `${profile.staff_fname} ${profile.staff_lname}` : 'Unknown';
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    const handleSort = (column) => {
        const isAsc = sortConfig.key === column && sortConfig.direction === 'asc';
        setSortConfig({ key: column, direction: isAsc ? 'desc' : 'asc' });
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
            const requesterName = getRequesterName(request.staff_id) || 'Unknown'; // Default to 'Unknown' if no match is found

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
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default ManagerViewRequests;
