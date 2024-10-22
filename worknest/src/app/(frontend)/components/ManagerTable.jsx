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
import { styled } from '@mui/system';
import FilterForm from './FilterForm';
import '../../styles/App.css';
import { ToastContainer } from 'react-toastify';
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
    const [sortConfig, setSortConfig] = useState({ key: 'staff_fname', direction: 'asc' });
    const [filters, setFilters] = useState({
        name: '',
        position: '',
        workLocation: '',
        country: ''
    });
    const [employees, setEmployees] = useState([]);
    const [managerId, setManagerId] = useState(null);
    const [departmentName, setDepartmentName] = useState('Department Name');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [open, setOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Define filter options
    const filterOptions = [
        { label: 'Name', key: 'name', value: filters.name, options: [], fullWidth: false },
        { label: 'Position', key: 'position', value: filters.position, options: [], fullWidth: false },
        { label: 'Work Location', key: 'workLocation', value: filters.workLocation, options: [], fullWidth: false },
        { label: 'Country', key: 'country', value: filters.country, options: [], fullWidth: false }
    ];

    useEffect(() => {
        const storedManagerId = sessionStorage.getItem('manager_id');  // Set dynamically or from localStorage
        setManagerId(storedManagerId);

        const fetchEmployees = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5002/managers/${storedManagerId}/team`, {
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

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpen = (employee) => {
        setSelectedEmployee(employee);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedEmployee(null);
    };

    return (
        <>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
                Employees ({departmentName})
            </h3>

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
                            {filteredEmployees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((employee) => (
                                <TableRow key={employee.staff_id} onClick={() => handleOpen(employee)}>
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
                                    <strong>Name:</strong> {`${selectedEmployee.staff_fname} ${selectedEmployee.staff_lname}`}
                                </Typography>
                                <Typography sx={{ mt: 1 }}>
                                    <strong>Role:</strong> {selectedEmployee.position}
                                </Typography>
                                <Typography sx={{ mt: 1 }}>
                                    <strong>Work Location:</strong> {selectedEmployee.location}
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
