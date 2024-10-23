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
    Typography,
    Dialog,
    DialogContent,
    DialogContentText,
    TextField
} from '@mui/material';
import { styled } from '@mui/system';

const StatusLabel = styled('span')(({ status }) => ({
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '16px',
    fontWeight: 'bold',
    color: status === 'Approved' ? '#2e7d32' : status === 'Pending' ? '#f57c00' : '#d32f2f',
    backgroundColor: status === 'Approved' ? '#e8f5e9' : status === 'Pending' ? '#fff3e0' : '#ffebee',
}));

const ManagerViewRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [currentRequest, setCurrentRequest] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [approvalComment, setApprovalComment] = useState('');
    const [withdrawReason, setWithdrawReason] = useState('');

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const storedManagerId = sessionStorage.getItem('staff_id');
                const response = await fetch(`http://127.0.0.1:5003/requests/manager/${storedManagerId}`);

                if (!response.ok) {
                    throw new Error(`Error fetching requests: ${response.statusText}`);
                }

                const data = await response.json();
                setRequests(data);
                console.log(data);
            } catch (error) {
                console.error('Error fetching requests:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

    const handleStatusChange = (request, newStatus) => {
        setCurrentRequest(request);
        setNewStatus(newStatus);
        setOpenConfirmDialog(true);
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

        const endpoint = newStatus === 'Approved' ? '/approve_request' : '/reject_request';
        const bodyData = {
            request_id: currentRequest.request_id,
            reporting_manager_id: sessionStorage.getItem('staff_id'),
            approver_comment: newStatus === 'Approved' ? approvalComment : rejectReason,
        };
        console.log('Body data:', bodyData);
        try {
            const response = await fetch(`http://127.0.0.1:5006${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyData),
                
            });

            if (response.ok) {
                setRequests(prevRequests =>
                    prevRequests.map(req =>
                        req.request_id === currentRequest.request_id
                            ? { ...req, status: newStatus }
                            : req
                    )
                );
                setOpenConfirmDialog(false);
                // Reset the appropriate state variables
                setRejectReason('');
                setApprovalComment('');
                setWithdrawReason('');
            } else {
                alert('Failed to update request status');
            }
        } catch (error) {
            console.error('Error updating request status:', error);
            alert('An error occurred while updating the request status');
        }
    };

    return (
        <div>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Requester Name</strong></TableCell>
                            <TableCell><strong>Department</strong></TableCell>
                            <TableCell><strong>Reason</strong></TableCell>
                            <TableCell><strong>Requested Dates</strong></TableCell>
                            <TableCell><strong>Time of Day</strong></TableCell>
                            <TableCell><strong>Request Status</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.map((request) => (
                            <TableRow key={request.request_id}>
                                <TableCell>{request.staff_name}</TableCell>
                                <TableCell>{request.department}</TableCell>
                                <TableCell>{request.reason}</TableCell>
                                <TableCell>{request.requested_dates.join(', ') || 'N/A'}</TableCell>
                                <TableCell>{request.time_of_day}</TableCell>
                                <TableCell>
                                    <StatusLabel status={request.status}>
                                        {request.status}
                                    </StatusLabel>
                                </TableCell>
                                <TableCell>
                                    <Button onClick={() => handleStatusChange(request, 'Approved')}>Approve</Button>
                                    <Button onClick={() => handleStatusChange(request, 'Rejected')}>Reject</Button>
                                    <Button onClick={() => handleStatusChange(request, 'Withdrawn')}>Withdraw</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
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
                <Button onClick={handleConfirmStatusChange} color="primary">
                    Confirm
                </Button>
                <Button onClick={() => setOpenConfirmDialog(false)} color="secondary">
                    Cancel
                </Button>
            </Dialog>
        </div>
    );
};

export default ManagerViewRequests;
