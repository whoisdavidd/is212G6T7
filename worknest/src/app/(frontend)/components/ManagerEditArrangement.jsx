// /src/app/(frontend)/components/EditArrangement.jsx
"use client";
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
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Snackbar,
    Alert,
} from '@mui/material';
// import axios from 'axios';

const EditArrangement = () => {
    const [arrangements, setArrangements] = useState([]);
    const [selectedArrangement, setSelectedArrangement] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [notification, setNotification] = useState({ open: false, message: '', severity: '' });

    // useEffect(() => {
    //     const fetchArrangements = async () => {
    //         try {
    //             const response = await axios.get('/api/arrangements'); // Adjust the API endpoint as needed
    //             setArrangements(response.data);
    //         } catch (error) {
    //             console.error('Error fetching arrangements:', error);
    //         }
    //     };
    //     fetchArrangements();
    // }, []);

    const handleSelectArrangement = (arrangement) => {
        setSelectedArrangement(arrangement);
        setNewStatus(arrangement.status); // Pre-fill the current status
    };

    const handleChangeStatus = async () => {
        if (!selectedArrangement) return;

        const confirmChange = window.confirm('Are you sure you want to change the status?');
        if (!confirmChange) return;

        try {
            const updatedArrangement = {
                ...selectedArrangement,
                status: newStatus,
            };

            await axios.put(`/api/arrangements/${selectedArrangement.id}`, updatedArrangement); // Adjust API endpoint

            // Notify the staff member (you can customize this part)
            // Assuming you have a notification mechanism
            // await notifyStaff(selectedArrangement.staffId, newStatus);

            setNotification({
                open: true,
                message: `Status updated to ${newStatus}`,
                severity: 'success',
            });

            // Refresh arrangements
            const response = await axios.get('/api/arrangements');
            setArrangements(response.data);

            // Reset selection
            setSelectedArrangement(null);
            setNewStatus('');
        } catch (error) {
            console.error('Error updating status:', error);
            setNotification({
                open: true,
                message: 'Failed to update status',
                severity: 'error',
            });
        }
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    return (
        <div>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Arrangement ID</TableCell>
                            <TableCell>Staff Member</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {arrangements.map((arrangement) => (
                            <TableRow key={arrangement.id}>
                                <TableCell>{arrangement.id}</TableCell>
                                <TableCell>{arrangement.staffName}</TableCell>
                                <TableCell>{arrangement.status}</TableCell>
                                <TableCell>
                                    <Button onClick={() => handleSelectArrangement(arrangement)}>Edit</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {selectedArrangement && (
                <div style={{ marginTop: '20px' }}>
                    <h2>Edit Status for {selectedArrangement.staffName}</h2>
                    <FormControl fullWidth>
                        <InputLabel id="status-select-label">Status</InputLabel>
                        <Select
                            labelId="status-select-label"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                        >
                            <MenuItem value="Approved">Approved</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="contained" color="primary" onClick={handleChangeStatus}>
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
