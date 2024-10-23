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
    Typography,
    Modal,
    Box,
    TablePagination,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
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

// Function to get an array of date strings for a given week
const getWeekDates = (startDate) => {
    const dates = [];
    for (let i = 0; i < 5; i++) { // 5 working days
        const d = startDate.add(i, 'day');
        dates.push(d.format('YYYY-MM-DD'));
    }
    return dates;
};

const ManagerTable = () => {
    const [sortConfig, setSortConfig] = useState({ key: 'staff_fname', direction: 'asc' });
    const [filters, setFilters] = useState({
        workLocation: '',
        department: '',
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [schedules, setSchedules] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [combinedData, setCombinedData] = useState([]);
    const [workFromHomeCount, setWorkFromHomeCount] = useState({});
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [open, setOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [selectedWeekStart, setSelectedWeekStart] = useState(getStartOfCurrentWeek());
    const [dateFilter, setDateFilter] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedManagerId = sessionStorage.getItem('staff_id');
                if (!storedManagerId) {
                    toast.error('Manager ID not found in session.');
                    return;
                }

                // Fetch team schedules from micro_schedule service
                const scheduleResponse = await axios.get(
                    `http://127.0.0.1:5004/schedules/manager/${storedManagerId}`
                );

                // Extract unique staff_ids from schedules
                const staffIds = [
                    ...new Set(scheduleResponse.data.map((sched) => sched.staff_id)),
                ];

                if (staffIds.length === 0) {
                    toast.info('No team schedules found.');
                    setSchedules([]);
                    setProfiles([]);
                    return;
                }

                // Fetch profiles for these staff_ids from micro_profile service
                const profilePromises = staffIds.map(id =>
                    axios.get(`http://127.0.0.1:5002/profile/${id}`)
                );

                const profileResponses = await Promise.all(profilePromises);
                const profilesData = profileResponses.map(res => res.data);

                setSchedules(scheduleResponse.data);
                setProfiles(profilesData);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to fetch data. Please try again later.');
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        // Combine schedules with profiles
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

    const sortedData = [...combinedData].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const filteredData = sortedData.filter((data) => {
        const matchesWorkLocation = filters.workLocation
            ? data.location.toLowerCase() === filters.workLocation.toLowerCase()
            : true;
        const matchesDepartment = filters.department
            ? data.department.toLowerCase().includes(filters.department.toLowerCase())
            : true;
        const matchesSearch = searchQuery
            ? `${data.staff_fname} ${data.staff_lname}`
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
            : true;
        const matchesDate = dateFilter
            ? data.date === dateFilter
            : true;
        return matchesWorkLocation && matchesDepartment && matchesSearch && matchesDate;
    });

    const handleFilterChange = (key, value) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [key]: value,
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            workLocation: '',
            department: '',
        });
        setSearchQuery('');
        setDateFilter(null);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpen = (schedule) => {
        setSelectedSchedule(schedule);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedSchedule(null);
    };

    // Get dates for the selected week
    const selectedWeekDates = getWeekDates(selectedWeekStart);

    // Prepare data for the visual summary (Bar Chart)
    const chartData = {
        labels: selectedWeekDates,
        datasets: [
            {
                label: 'Employees Working from Home',
                data: selectedWeekDates.map(date => workFromHomeCount[date] || 0),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Handlers to navigate weeks
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
                Team Work-from-Home Dashboard
            </Typography>

            {/* Visual Summary */}
            <Paper style={{ padding: '20px', marginBottom: '20px' }}>
                <Typography variant="h6" gutterBottom>
                    Work-from-Home Summary
                </Typography>
                {/* Week Navigation */}
                <Grid container spacing={2} alignItems="center" style={{ marginBottom: '10px' }}>
                    <Grid item>
                        <Button variant="outlined" onClick={handlePrevWeek}>
                            Previous Week
                        </Button>
                    </Grid>
                    <Grid item>
                        <Typography variant="body1">
                            {selectedWeekStart.format('MMM D, YYYY')} - {selectedWeekStart.add(4, 'day').format('MMM D, YYYY')}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Button variant="outlined" onClick={handleNextWeek}>
                            Next Week
                        </Button>
                    </Grid>
                </Grid>
                <Bar data={chartData} />
            </Paper>

            <Grid container spacing={2} alignItems="center" style={{ marginBottom: '20px' }}>
                {/* Search Bar */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Search by Name"
                        variant="outlined"
                        fullWidth
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Grid>

                {/* Filter: Work Location */}
                <Grid item xs={12} sm={3}>
                    <FormControl variant="outlined" fullWidth>
                        <InputLabel>Work Location</InputLabel>
                        <Select
                            value={filters.workLocation}
                            onChange={(e) => handleFilterChange('workLocation', e.target.value)}
                            label="Work Location"
                        >
                            <MenuItem value="">
                                <em>All</em>
                            </MenuItem>
                            <MenuItem value="OFFICE">Office</MenuItem>
                            <MenuItem value="REMOTE">Remote</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {/* Filter: Department */}
                <Grid item xs={12} sm={3}>
                    <TextField
                        label="Department"
                        variant="outlined"
                        fullWidth
                        value={filters.department}
                        onChange={(e) => handleFilterChange('department', e.target.value)}
                    />
                </Grid>

                {/* Date Filter */}
                <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Filter by Date"
                            value={dateFilter ? dayjs(dateFilter) : null}
                            onChange={(newValue) => {
                                if (newValue && newValue.isValid()) {
                                    const formattedDate = newValue.format('YYYY-MM-DD');
                                    setDateFilter(formattedDate);
                                } else {
                                    setDateFilter(null);
                                }
                            }}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                    </LocalizationProvider>
                </Grid>

                {/* Clear Filters Button */}
                <Grid item xs={12} sm={6}>
                    <Button variant="contained" color="secondary" onClick={handleClearFilters} fullWidth>
                        Clear Filters
                    </Button>
                </Grid>
            </Grid>

            {/* Employee Schedules Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'staff_fname'}
                                    direction={sortConfig.key === 'staff_fname' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('staff_fname')}
                                >
                                    <strong>Name</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'position'}
                                    direction={sortConfig.key === 'position' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('position')}
                                >
                                    <strong>Position</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'department'}
                                    direction={sortConfig.key === 'department' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('department')}
                                >
                                    <strong>Department</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'date'}
                                    direction={sortConfig.key === 'date' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('date')}
                                >
                                    <strong>Date</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'location'}
                                    direction={sortConfig.key === 'location' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('location')}
                                >
                                    <strong>Work Location</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'country'}
                                    direction={sortConfig.key === 'country' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('country')}
                                >
                                    <strong>Country</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'status'}
                                    direction={sortConfig.key === 'status' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('status')}
                                >
                                    <strong>Status</strong>
                                </TableSortLabel>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((schedule) => (
                                <TableRow
                                    key={`${schedule.staff_id}-${schedule.date}`}
                                    onClick={() => handleOpen(schedule)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <TableCell>{`${schedule.staff_fname} ${schedule.staff_lname}`}</TableCell>
                                    <TableCell>{schedule.position}</TableCell>
                                    <TableCell>{schedule.department}</TableCell>
                                    <TableCell>{schedule.date}</TableCell>
                                    <TableCell>{schedule.location}</TableCell>
                                    <TableCell>{schedule.country}</TableCell>
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
