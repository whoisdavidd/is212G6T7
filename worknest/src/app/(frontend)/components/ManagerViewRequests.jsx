import React, { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableSortLabel from '@mui/material/TableSortLabel';
import { MainContainer, SectionTitle } from '../styles/IndexStyles';

const ManagerViewRequests = () => {
    const [requests, setRequests] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'requesterName', direction: 'asc' });

    // useEffect(() => {
    //     async function fetchData() {
    //         try {
    //             const response = await fetch('http://localhost:5100/api/wfh-requests'); // Update API endpoint accordingly
    //             if (!response.ok) {
    //                 throw new Error('Network response was not ok');
    //             }
    //             const result = await response.json();
    //             setRequests(result);
    //         } catch (error) {
    //             console.error('Fetch error:', error);
    //         }
    //     }
    //     fetchData();
    // }, []);

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
        // Logic to approve the request
        console.log(`Approved request ID: ${requestId}`);
    };

    const handleDeny = (requestId) => {
        // Logic to deny the request
        console.log(`Denied request ID: ${requestId}`);
    };

    return (
        <MainContainer>
            <SectionTitle>Pending Work-from-Home Requests</SectionTitle>
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
                                    active={sortConfig.key === 'dateOfRequest'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('dateOfRequest')}
                                >
                                    <strong>Date of Request</strong>
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
                                <TableCell>{new Date(request.dateOfRequest).toLocaleDateString()}</TableCell>
                                <TableCell>{request.status}</TableCell>
                                <TableCell>
                                    <button onClick={() => handleApprove(request.id)}>Approve</button>
                                    <button onClick={() => handleDeny(request.id)}>Deny</button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </MainContainer>
    );
};

export default ManagerViewRequests;
