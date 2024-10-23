"use client";
import React, { useState, useEffect, useMemo } from 'react';
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
    Typography,
    Modal,
    Box,
    TablePagination,
    TextField,
    Grid,
} from '@mui/material';
import { styled } from '@mui/system';
import '../../styles/App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const StatusLabel = styled(Box)(({ status }) => ({
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '16px',
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'center',
    color:
        status === 'Approved'
            ? '#2e7d32'
            : status === 'Pending'
            ? '#f57c00'
            : '#d32f2f',
    backgroundColor:
        status === 'Approved'
            ? '#e8f5e9'
            : status === 'Pending'
            ? '#fff3e0'
            : '#ffebee',
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

// Function to get the start of the current week (Monday)
const getStartOfCurrentWeek = () => {
    const today = dayjs();
    const dayOfWeek = today.day(); // 0 (Sun) - 6 (Sat)
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    return today.add(diff, 'day').startOf('day');
};

// Function to get dates of the current week (Monday to Friday)
const getWeekDates = (startDate) => {
    const dates = [];
    for (let i = 0; i < 5; i++) { // 5 working days
        const d = startDate.add(i, 'day');
        dates.push(d.format('YYYY-MM-DD'));
    }
    return dates;
};

const ManagerTable = () => {
    const [staffId, setStaffId] = useState(null);
    const [department, setDepartment] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [combinedData, setCombinedData] = useState([]);
    const [workFromHomeCount, setWorkFromHomeCount] = useState({});
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });
    const [open, setOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [dateFilter, setDateFilter] = useState(null);
    const [selectedWeekStart, setSelectedWeekStart] = useState(getStartOfCurrentWeek());

    // Retrieve sessionStorage data on client-side and ensure staffId is updated correctly
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedStaffId = sessionStorage.getItem('staff_id');
            const storedDepartment = sessionStorage.getItem('department');

            if (storedStaffId) {
                setStaffId(storedStaffId);
                console.log('staffId set to:', storedStaffId);
            } else {
                console.log('No staff_id found in sessionStorage');
            }

            if (storedDepartment) {
                setDepartment(storedDepartment);
                console.log('department set to:', storedDepartment);
            } else {
                console.log('No department found in sessionStorage');
            }
        }
    }, []);

    // Fetch schedules when staffId changes
    useEffect(() => {
        const fetchSchedules = async () => {
            if (!staffId) {
                toast.error('Staff ID not found in session.');
                return;
            }
            try {
                const response = await axios.get(`http://127.0.0.1:5004/schedules/manager/${staffId}`);
                setSchedules(response.data);
            } catch (error) {
                console.error('Error fetching schedules:', error);
                toast.error('Failed to fetch schedules. Please try again later.');
            }
        };

        fetchSchedules();
    }, [staffId]);

    // Fetch profiles when schedules change
    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const staffIds = [
                    ...new Set(schedules.map((sched) => sched.staff_id)),
                ];
                if (staffIds.length === 0) {
                    setProfiles([]);
                    return;
                }
                const profilePromises = staffIds.map((id) =>
                    axios.get(`http://127.0.0.1:5002/profile/${id}`)
                );
                const profileResponses = await Promise.all(profilePromises);
                const profilesData = profileResponses.map((res) => res.data);
                setProfiles(profilesData);
            } catch (error) {
                console.error('Error fetching profiles:', error);
                toast.error('Failed to fetch profiles. Please try again later.');
            }
        };

        fetchProfiles();
    }, [schedules]);

    // Combine schedules with profiles when schedules or profiles change
    useEffect(() => {
        const combined = schedules.map((sched) => {
            const profile = profiles.find((p) => p.staff_id === sched.staff_id);
            return {
                ...sched,
                staff_fname: profile ? profile.staff_fname : '',
                staff_lname: profile ? profile.staff_lname : '',
                position: profile ? profile.position : '',
                department: profile ? profile.department : '',
                country: profile ? profile.country : '',
                location: profile ? profile.location : 'OFFICE',
            };
        });
        setCombinedData(combined);

        // Calculate work-from-home count per day
        const count = {};
        combined.forEach((item) => {
            if (item.status === 'Approved' && item.location === 'REMOTE') {
                const date = item.date;
                count[date] = count[date] ? count[date] + 1 : 1;
            }
        });
        setWorkFromHomeCount(count);
    }, [schedules, profiles]);

    const handleSort = (column) => {
        const isAsc = sortConfig.key === column && sortConfig.direction === 'asc';
        setSortConfig({ key: column, direction: isAsc ? 'desc' : 'asc' });
    };

    const sortedData = useMemo(() => {
        return [...combinedData].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [combinedData, sortConfig]);

    const handleOpen = (schedule) => {
        setSelectedSchedule(schedule);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedSchedule(null);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDateFilterChange = (newValue) => {
        if (newValue && newValue.isValid()) {
            const formattedDate = newValue.format('YYYY-MM-DD');
            setDateFilter(formattedDate);
        } else {
            setDateFilter(null);
        }
    };

    const filteredData = useMemo(() => {
        return sortedData.filter((schedule) => {
            if (dateFilter) {
                return schedule.date === dateFilter;
            }
            return true;
        });
    }, [sortedData, dateFilter]);

    // Generate data for Bar chart
    const barChartData = {
        labels: getWeekDates(selectedWeekStart),
        datasets: [
            {
                label: 'Work From Home Count',
                data: getWeekDates(selectedWeekStart).map(date => workFromHomeCount[date] || 0),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    };

    const handlePrevWeek = () => {
        const prevWeek = selectedWeekStart.subtract(1, 'week');
        setSelectedWeekStart(prevWeek);
    };

    const handleNextWeek = () => {
        const nextWeek = selectedWeekStart.add(1, 'week');
        setSelectedWeekStart(nextWeek);
    };

    return (
        <>
            <Typography variant="h4" gutterBottom>
                Manager Dashboard
            </Typography>

            <Grid container spacing={2} alignItems="center">
                <Grid item>
                    <Button variant="contained" onClick={handlePrevWeek}>
                        Previous Week
                    </Button>
                </Grid>
                <Grid item>
                    <Typography variant="body1">
                        {selectedWeekStart.format('MMM D, YYYY')} - {selectedWeekStart.add(4, 'day').format('MMM D, YYYY')}
                    </Typography>
                </Grid>
                <Grid item>
                    <Button variant="contained" onClick={handleNextWeek}>
                        Next Week
                    </Button>
                </Grid>
                <Grid item xs>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Filter by Date"
                            value={dateFilter ? dayjs(dateFilter) : null}
                            onChange={handleDateFilterChange}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                    </LocalizationProvider>
                </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
                <Bar data={barChartData} />
            </Box>

            <TableContainer component={Paper} sx={{ mt: 4 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'staff_fname'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('staff_fname')}
                                >
                                    Name
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'position'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('position')}
                                >
                                    Position
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'department'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('department')}
                                >
                                    Department
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'date'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('date')}
                                >
                                    Date
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'location'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('location')}
                                >
                                    Work Location
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'status'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('status')}
                                >
                                    Status
                                </TableSortLabel>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((schedule) => (
                                <TableRow key={`${schedule.staff_id}-${schedule.date}`} onClick={() => handleOpen(schedule)} style={{ cursor: 'pointer' }}>
                                    <TableCell>{`${schedule.staff_fname} ${schedule.staff_lname}`}</TableCell>
                                    <TableCell>{schedule.position}</TableCell>
                                    <TableCell>{schedule.department}</TableCell>
                                    <TableCell>{schedule.date}</TableCell>
                                    <TableCell>{schedule.location}</TableCell>
                                    <TableCell>
                                        <StatusLabel status={schedule.status}>
                                            {schedule.status}
                                        </StatusLabel>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={filteredData.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                />
            </TableContainer>

            {/* Schedule Details Modal */}
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="schedule-details-title"
                aria-describedby="schedule-details-description"
            >
                <Box sx={{ ...modalStyle }}>
                    {selectedSchedule && (
                        <>
                            <Typography id="schedule-details-title" variant="h6" component="h2">
                                Schedule Details
                            </Typography>
                            <Typography id="schedule-details-description" sx={{ mt: 2 }}>
                                <strong>Name:</strong> {`${selectedSchedule.staff_fname} ${selectedSchedule.staff_lname}`}
                            </Typography>
                            <Typography sx={{ mt: 1 }}>
                                <strong>Position:</strong> {selectedSchedule.position}
                            </Typography>
                            <Typography sx={{ mt: 1 }}>
                                <strong>Department:</strong> {selectedSchedule.department}
                            </Typography>
                            <Typography sx={{ mt: 1 }}>
                                <strong>Date:</strong> {selectedSchedule.date}
                            </Typography>
                            <Typography sx={{ mt: 1 }}>
                                <strong>Work Location:</strong> {selectedSchedule.location}
                            </Typography>
                            <Typography sx={{ mt: 1 }}>
                                <strong>Status:</strong> {selectedSchedule.status}
                            </Typography>
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

            <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} />
        </>
    );
};

export default ManagerTable;
