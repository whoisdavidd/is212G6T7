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
    TableSortLabel,
    Box
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

  // Helper function to format date as YYYY-MM-DD
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
    const [requests, setRequests] = useState([
        { id: 1, requesterName: 'Emily Brown', from: '2024-10-01', to: '2024-10-05', status: 'Rejected' },
        { id: 2, requesterName: 'Jane Smith', from: '2024-10-12', to: '2024-10-15', status: 'Pending' },
        { id: 3, requesterName: 'John Doe', from: '2024-10-10', to: '2024-10-12', status: 'Pending' },
        { id: 4, requesterName: 'Tom Johnson', from: '2024-11-10', to: '2024-11-12', status: 'Approved' },
    ]);

    const [filters, setFilters] = useState({
        requesterName: '',
        status: '',
        from: '',
        to: '',
    });

    const [sortConfig, setSortConfig] = useState({ key: 'requesterName', direction: 'asc' });

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

    const handleApprove = (requestId) => {
        setRequests(requests.map(req => req.id === requestId ? { ...req, status: 'Approved' } : req));
    };

    const handleDeny = (requestId) => {
        setRequests(requests.map(req => req.id === requestId ? { ...req, status: 'Rejected' } : req));
    };

    const filteredRequests = sortedRequests.filter(request => {
        const requestFromDate = new Date(request.from).getTime();  // Convert to timestamp for comparison
        const requestToDate = new Date(request.to).getTime();
    
        const filterFromDate = filters.from ? new Date(filters.from).getTime() : null;
        const filterToDate = filters.to ? new Date(filters.to).getTime() : null;
    
        return (
            (filters.requesterName ? request.requesterName.toLowerCase().includes(filters.requesterName.toLowerCase()) : true) &&
            (filters.status ? request.status.toLowerCase().includes(filters.status.toLowerCase()) : true) &&
            (filterFromDate ? requestFromDate >= filterFromDate : true) &&  // Compare timestamps
            (filterToDate ? requestToDate <= filterToDate : true)  // Compare timestamps
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
            options: [...new Set(requests.map(request => request.requesterName))],
            value: filters.requesterName,
            fullWidth: true,
        },
        {
            key: 'status',
            label: 'Status',
            options: [...new Set(requests.map(request => request.status))],
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
                            <strong>Request Status</strong>
                        </TableCell>
                        <TableCell>
                            <strong>Actions</strong>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedRequests.map((request) => (
                        <TableRow key={request.id}>
                            <TableCell>{request.requesterName}</TableCell>
                            <TableCell>{formatDate(request.from)}</TableCell>
                                <TableCell>{formatDate(request.to)}</TableCell>
                            <TableCell>
                                <StatusLabel status={request.status}>
                                    {request.status}
                                </StatusLabel>
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={() => handleApprove(request.id)}
                                    style={{ marginRight: '10px' }}
                                    disabled={request.status === 'Approved'}
                                >
                                    Approve
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() => handleDeny(request.id)}
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
    </div>
    );
};

export default ManagerViewRequests;
