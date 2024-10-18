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
        position: '',
        workLocation: '',
        country: ''
    });
    const [employees, setEmployees] = useState([]); // State to hold employee data
    const [managerId, setManagerId] = useState(null); // State to hold manager ID
    const [departmentName, setDepartmentName] = useState('Department Name');

    // Fetch employee data from the API
    useEffect(() => {
        const storedManagerId = 140879;  // Set dynamically or from localStorage
        setManagerId(storedManagerId);

        const fetchEmployees = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5002/managers/${storedManagerId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.code === 200) {
                    setEmployees(data.data.employees);  // Now the data is coming from data.data.employees
                    setDepartmentName(data.data.department);
                } else {
                    console.error("Failed to fetch employees:", data.message);
                }
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };

        if (storedManagerId) {
            fetchEmployees();
        }
    }, []);

    const handleSort = (column) => {
        const isAsc = sortConfig.key === column && sortConfig.direction === 'asc';
        setSortConfig({ key: column, direction: isAsc ? 'desc' : 'asc' });
    };

    const sortedEmployees = [...employees].sort((a, b) => {
        // Ensure WFH employees are sorted at the top
        if (a.location === 'WFH' && b.location !== 'WFH') return -1;
        if (a.location !== 'WFH' && b.location === 'WFH') return 1;

        // After sorting by WFH, apply regular sorting based on the selected column
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const filteredEmployees = sortedEmployees.filter(employee => {
        return (
            (filters.name ? `${employee.staff_fname} ${employee.staff_lname}`.toLowerCase().includes(filters.name.toLowerCase()) : true) &&
            (filters.position ? employee.position.toLowerCase().includes(filters.position.toLowerCase()) : true) &&
            (filters.workLocation ? employee.location.toLowerCase().includes(filters.workLocation.toLowerCase()) : true) &&
            (filters.country ? employee.country.toLowerCase().includes(filters.country.toLowerCase()) : true)
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
            position: '',
            workLocation: '',
            country: '',
        });
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
            key: 'position',
            label: 'Position',
            options: [...new Set(employees.map(employee => employee.position))],
            value: filters.position,
            fullWidth: true,
        },
        {
            key: 'workLocation',
            label: 'Work Location',
            options: [...new Set(employees.map(employee => employee.location))],
            value: filters.workLocation,
            fullWidth: true,
        },
        {
            key: 'country',
            label: 'Country',
            options: [...new Set(employees.map(employee => employee.country))],
            value: filters.country,
            fullWidth: true,
        }
    ];

    return (
        <>
        <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        Employees ({departmentName})
        </h3>

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
                                    active={sortConfig.key === 'position'}
                                    direction={sortConfig.key === 'position' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('position')}
                                >
                                    <strong>Position</strong>
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
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredEmployees.map((employee) => (
                            <TableRow key={employee.staff_id}>
                                <TableCell>{`${employee.staff_fname} ${employee.staff_lname}`}</TableCell>
                                <TableCell>{employee.position}</TableCell>
                                <TableCell>{employee.location}</TableCell>
                                <TableCell>{employee.country}</TableCell>
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
        </>
    );
};

export default ManagerTable;
