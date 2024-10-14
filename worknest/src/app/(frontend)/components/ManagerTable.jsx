import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TableSortLabel,
    Button,
    Typography,
    Modal,
    Box,
    TablePagination
} from '@mui/material';
import { styled } from '@mui/system'; // Added import for 'styled'
import FilterForm from './FilterForm';
import '../../styles/App.css';

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
    const [sortConfig, setSortConfig] = useState({ key: 'staff_fname', direction: 'asc' });
    const [filters, setFilters] = useState({
        name: '',
        role: '',
        workLocation: '',
        from: '',
        to: '',
    });
    const [employees, setEmployees] = useState([]); // State to hold employee data
    const [error, setError] = useState(null); // State to hold error messages
    const [open, setOpen] = useState(false); // State to control modal visibility
    const [selectedEmployee, setSelectedEmployee] = useState(null); // State to hold selected employee details
    const [page, setPage] = useState(0); // State for pagination
    const [rowsPerPage, setRowsPerPage] = useState(5); // State for rows per page

    // Fetch employee data from the API
    useEffect(() => {
        const fetchEmployees = async () => {
            const managerId = sessionStorage.getItem('staff_id');
            if (!managerId) {
                setError('Manager ID not found. Please log in again.');
                return;
            }
            try {
                const response = await fetch(`http://127.0.0.1:5003/manager_requests/${managerId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setEmployees(data);
                console.log("EMPLOYEES", employees)
                setError(null);
            } catch (error) {
                console.error('Error fetching employees:', error);
                setError(error.message);
            }
        };

        fetchEmployees();
    }, []);

    // Sorting functionality
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

    // Filtering functionality
    const filteredEmployees = sortedEmployees.filter(employee => {
        const employeeFromDate = new Date(employee.from).getTime();  // Convert to timestamp for comparison
        const employeeToDate = new Date(employee.to).getTime();

        const filterFromDate = filters.from ? new Date(filters.from).getTime() : null;
        const filterToDate = filters.to ? new Date(filters.to).getTime() : null;

        return (
            (filters.name ? (`${employee.staff_fname} ${employee.staff_lname}`.toLowerCase().includes(filters.name.toLowerCase())) : true) &&
            (filters.role ? employee.role.toLowerCase().includes(filters.role.toLowerCase()) : true) &&
            (filters.workLocation ? employee.country.toLowerCase().includes(filters.workLocation.toLowerCase()) : true) &&
            (filterFromDate ? employeeFromDate >= filterFromDate : true) &&  // Compare timestamps
            (filterToDate ? employeeToDate <= filterToDate : true)  // Compare timestamps
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

    // Pagination handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Modal handlers
    const handleRowClick = (employee) => {
        setSelectedEmployee(employee);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedEmployee(null);
    };

    // Define filter options based on employee data
    const filterOptions = [
        {
            key: 'name',
            label: 'Name',
            options: [...new Set(employees.map(employee => `${employee.staff_fname} ${employee.staff_lname}`))],
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
            options: [...new Set(employees.map(employee => employee.country))],
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

    // Utility function to format dates
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
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
                                    active={sortConfig.key === 'staff_fname'}
                                    direction={sortConfig.key === 'staff_fname' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('staff_fname')}
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
                                    active={sortConfig.key === 'country'}
                                    direction={sortConfig.key === 'country' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('country')}
                                >
                                    <strong>Work Location</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'from'}
                                    direction={sortConfig.key === 'from' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('from')}
                                >
                                    <strong>From</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'to'}
                                    direction={sortConfig.key === 'to' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('to')}
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
                                <TableCell>{`${employee.staff_fname || 'N/A'} ${employee.staff_lname || 'N/A'}`}</TableCell>
                                <TableCell>{employee.role || 'N/A'}</TableCell>
                                <TableCell>{employee.country || 'N/A'}</TableCell>
                                <TableCell>{formatDate(employee.from) || 'N/A'}</TableCell>
                                <TableCell>{formatDate(employee.to) || 'N/A'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {/* Pagination Component */}
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

            {/* Modal to display full employee details */}
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="employee-details-title"
                aria-describedby="employee-details-description"
            >
                <Box sx={modalStyle}>
                    {selectedEmployee && (
                        <>
                            <Typography id="employee-details-title" variant="h6" component="h2">
                                Employee Details
                            </Typography>
                            <Typography id="employee-details-description" sx={{ mt: 2 }}>
                                <strong>Name:</strong> {`${selectedEmployee.staff_fname} ${selectedEmployee.staff_lname}`}
                            </Typography>
                            <Typography sx={{ mt: 1 }}>
                                <strong>Department:</strong> {selectedEmployee.department}
                            </Typography>
                            <Typography sx={{ mt: 1 }}>
                                <strong>Position:</strong> {selectedEmployee.position}
                            </Typography>
                            <Typography sx={{ mt: 1 }}>
                                <strong>Location:</strong> {selectedEmployee.location}
                            </Typography>
                            {/* Add more details as needed */}
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
        </div>
    );

};

export default ManagerTable;
