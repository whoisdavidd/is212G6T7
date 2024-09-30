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
    Button
} from '@mui/material';
import FilterForm from './FilterForm';
import '../../styles/App.css';

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

    // Fetch employee data from the API
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await fetch("http://127.0.0.1:5002/test", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                // Ensure we have a valid response
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.code === 200) {
                    setEmployees(data.data.employees);  // Expecting `data.data.employees`
                } else {
                    console.error("Failed to fetch employees:", data.message);
                }
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };

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

    // Helper function to format date as YYYY-MM-DD
    const formatDate = (dateString) => {
        const date = new Date(dateString);
    
        // Check if the date is valid
        if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateString);
            return 'Invalid Date'; // You can return 'Invalid Date' or handle it differently
        }
    
        // Extract YYYY-MM-DD from the ISO string
        return date.toISOString().split('T')[0];
    };

    const filteredEmployees = sortedEmployees.filter(employee => {
        const employeeFromDate = new Date(employee.from).getTime();  // Convert to timestamp for comparison
        const employeeToDate = new Date(employee.to).getTime();

        const filterFromDate = filters.from ? new Date(filters.from).getTime() : null;
        const filterToDate = filters.to ? new Date(filters.to).getTime() : null;

        return (
            (filters.name ? `${employee.staff_fname} ${employee.staff_lname}`.toLowerCase().includes(filters.name.toLowerCase()) : true) &&
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

    // Define filterOptions here
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

    return (
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
                        {filteredEmployees.map((employee) => (
                            <TableRow key={employee.staff_id}>
                                <TableCell>{`${employee.staff_fname} ${employee.staff_lname}`}</TableCell>
                                <TableCell>{employee.role}</TableCell>
                                <TableCell>{employee.country}</TableCell>
                                <TableCell>{formatDate(employee.from)}</TableCell>
                                <TableCell>{formatDate(employee.to)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default ManagerTable;
