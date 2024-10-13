import React from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';

const EditForm = ({ open, onClose, arrangement, newStatus, setNewStatus, handleChangeStatus }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Status for {arrangement.staffName}</DialogTitle>
            <DialogContent>
                <FormControl fullWidth variant="outlined" sx={{ marginTop: '20px' }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        label="Status"
                    >
                        <MenuItem value="Approved">Approved</MenuItem>
                        <MenuItem value="Rejected">Rejected</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" color="primary" onClick={handleChangeStatus}>
                    Change Status
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditForm;
