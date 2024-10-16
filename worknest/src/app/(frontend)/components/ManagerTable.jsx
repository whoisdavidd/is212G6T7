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
    TablePagination
} from '@mui/material';
import { styled } from '@mui/system'; // Added import for 'styled'
import FilterForm from './FilterForm';
import '../../styles/App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

const ManagerTable = () => {
    const [sortConfig, setSortConfig] = useState({ key: 'staff_name', direction: 'asc' });
    const [filters, setFilters] = useState({
        name: '',
        role: '',
        workLocation: '',
        from: '',
        to: '',
    });
    const [employees, setEmployees] = useState([]);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const fetchEmployees = async (retryCount = 3) => {
        const managerId = sessionStorage.getItem('staff_id');
        if (!managerId) {
            setError('Manager ID not found. Please log in again.');
            return;
        }
        try {
            const response = await fetch(`http://localhost:5003/manager_requests/${managerId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setEmployees(data);
            setError(null);
        } catch (error) {
            if (retryCount > 0) {
                setTimeout(() => fetchEmployees(retryCount - 1), 1000);
            } else {
                console.error('Error fetching employees:', error);
                setError(error.message);
            }
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleSort = (column) => {
        const isAsc = sortConfig.key === column && sortConfig.direction === 'asc';
        setSortConfig({ key: column, direction: isAsc ? 'desc' : 'asc' });
    };

    const sortedEmployees = [...employees].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const filteredEmployees = sortedEmployees.filter(employee => {
        const employeeFromDate = new Date(employee.from_date).getTime();
        const employeeToDate = new Date(employee.to_date).getTime();

        const filterFromDate = filters.from ? new Date(filters.from).getTime() : null;
        const filterToDate = filters.to ? new Date(filters.to).getTime() : null;

        return (
            (filters.name ? employee.staff_name.toLowerCase().includes(filters.name.toLowerCase()) : true) &&
            (filters.role ? employee.role.toLowerCase().includes(filters.role.toLowerCase()) : true) &&
            (filters.workLocation ? employee.work_location.toLowerCase().includes(filters.workLocation.toLowerCase()) : true) &&
            (filterFromDate ? employeeFromDate >= filterFromDate : true) &&
            (filterToDate ? employeeToDate <= filterToDate : true)
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
            name: '',
            role: '',
            workLocation: '',
            from: '',
            to: '',
        });
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRowClick = (employee) => {
        setSelectedEmployee(employee);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedEmployee(null);
    };

    const filterOptions = [
        {
            key: 'name',
            label: 'Name',
            options: [...new Set(employees.map(employee => employee.staff_name))],
            value: filters.name,
            fullWidth: true,
        },
        {
            key: 'role',
            label: 'Role',
            options: [...new Set(employees.map(employee => employee.role))],
            value: filters.role,
            fullWidth: true,
        },
        {
            key: 'workLocation',
            label: 'Work Location',
            options: [...new Set(employees.map(employee => employee.work_location))],
            value: filters.workLocation,
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

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const renderActions = (params) => {
        const { status, request_id, staff_id } = params.row;
        const role = sessionStorage.getItem('role');
        const currentStaffId = sessionStorage.getItem('staff_id');

        const isAuthorized = (role == 2 && staff_id == currentStaffId) || role == 3; // Staff or Manager

        return (
            <div>
                {isAuthorized && status === 'Pending' && (
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleCancelClick(request_id)}
                    >
                        Cancel
                    </Button>
                )}
                {isAuthorized && status === 'Approved' && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleWithdrawClick(request_id)}
                    >
                        Withdraw
                    </Button>
                )}
            </div>
        );
    };

    const handleWithdrawClick = async (request_id) => {
        const originalEmployees = [...employees];
        setEmployees(employees.map(emp => (
            emp.request_id === request_id ? { ...emp, status: 'Withdrawn' } : emp
        )));
        try {
            const role = sessionStorage.getItem('role');
            const staffId = sessionStorage.getItem('staff_id');
            const department = sessionStorage.getItem('department');

            if (!role || !staffId || !department) {
                toast.error("User session is invalid. Please log in again.");
                return;
            }

            const response = await fetch(`http://localhost:5003/requests/${request_id}/withdraw`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Role': role,
                    'X-Staff-ID': staffId,
                    'X-Department': department,
                },
                credentials: 'include',
            });

            const data = await response.json();
            if (response.ok) {
                toast.success("Request withdrawn successfully.");
            } else {
                setEmployees(originalEmployees);
                toast.error(`Error: ${data.message}`);
            }
        } catch (error) {
            setEmployees(originalEmployees);
            toast.error("An unexpected error occurred. Please try again.");
        }
    };

    const handleCancelClick = async (request_id) => {
        const originalEmployees = [...employees];
        setEmployees(employees.map(emp => (
            emp.request_id === request_id ? { ...emp, status: 'Cancelled' } : emp
        )));
        try {
            const role = sessionStorage.getItem('role');
            const staffId = sessionStorage.getItem('staff_id');
            const department = sessionStorage.getItem('department');

            if (!role || !staffId || !department) {
                toast.error("User session is invalid. Please log in again.");
                return;
            }

            const response = await fetch(`http://localhost:5003/requests/${request_id}/cancel`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Role': role,
                    'X-Staff-ID': staffId,
                    'X-Department': department,
                },
                credentials: 'include',
            });

            const data = await response.json();
            if (response.ok) {
                toast.success("Request canceled successfully.");
            } else {
                setEmployees(originalEmployees);
                toast.error(`Error: ${data.message}`);
            }
        } catch (error) {
            setEmployees(originalEmployees);
            toast.error("An unexpected error occurred. Please try again.");
        }
    };

    return (
        <div className="table-container">
            {error && (
                <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}
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
                                    active={sortConfig.key === 'staff_name'}
                                    direction={sortConfig.key === 'staff_name' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('staff_name')}
                                >
                                    <strong>Name</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'role'}
                                    direction={sortConfig.key === 'role' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('role')}
                                >
                                    <strong>Role</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'work_location'}
                                    direction={sortConfig.key === 'work_location' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('work_location')}
                                >
                                    <strong>Work Location</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'from_date'}
                                    direction={sortConfig.key === 'from_date' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('from_date')}
                                >
                                    <strong>From</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'to_date'}
                                    direction={sortConfig.key === 'to_date' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('to_date')}
                                >
                                    <strong>To</strong>
                                </TableSortLabel>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(rowsPerPage > 0
                            ? filteredEmployees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : filteredEmployees
                        ).map((employee) => (
                            <TableRow key={employee.staff_id} hover onClick={() => handleRowClick(employee)} style={{ cursor: 'pointer' }}>
                                <TableCell>{employee.staff_name || 'N/A'}</TableCell>
                                <TableCell>{employee.role || 'N/A'}</TableCell>
                                <TableCell>{employee.work_location || 'N/A'}</TableCell>
                                <TableCell>{formatDate(employee.from_date) || 'N/A'}</TableCell>
                                <TableCell>{formatDate(employee.to_date) || 'N/A'}</TableCell>
                                <TableCell align="right">{renderActions(employee)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={filteredEmployees.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                />
            </TableContainer>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="employee-details-title"
                aria-describedby="employee-details-description"
            >
                <Box sx={{ ...modalStyle }}>
                    {selectedEmployee && (
                        <>
                            <Typography id="employee-details-title" variant="h6" component="h2">
                                Employee Details
                            </Typography>
                            <Typography id="employee-details-description" sx={{ mt: 2 }}>
                                <strong>Name:</strong> {selectedEmployee.staff_name}
                            </Typography>
                            <Typography sx={{ mt: 1 }}>
                                <strong>Role:</strong> {selectedEmployee.role}
                            </Typography>
                            <Typography sx={{ mt: 1 }}>
                                <strong>Work Location:</strong> {selectedEmployee.work_location}
                            </Typography>
                            <Typography sx={{ mt: 1 }}>
                                <strong>From:</strong> {formatDate(selectedEmployee.from_date)}
                            </Typography>
                            <Typography sx={{ mt: 1 }}>
                                <strong>To:</strong> {formatDate(selectedEmployee.to_date)}
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
        </div>
    );
};

export default ManagerTable;
