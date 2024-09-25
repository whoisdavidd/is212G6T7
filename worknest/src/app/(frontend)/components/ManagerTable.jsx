import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TableSortLabel,
} from '@mui/material';
import FilterForm from './FilterForm'; // Adjust the path as necessary
import '../../styles/App.css';

const ManagerTable = () => {
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [filters, setFilters] = useState({
        name: '',
        role: '',
        workLocation: '',
    });

    const handleSort = (column) => {
        const isAsc = sortConfig.key === column && sortConfig.direction === 'asc';
        setSortConfig({ key: column, direction: isAsc ? 'desc' : 'asc' });
    };

    // Dummy data for demonstration
    const instruments = [
        { id: 1, name: 'John Doe', role: 'Manager', workLocation: 'New York', from: '2024-01-01', to: '2024-12-31' },
        { id: 2, name: 'Jane Smith', role: 'Developer', workLocation: 'San Francisco', from: '2023-03-15', to: '2024-05-15' },
        { id: 3, name: 'Mike Johnson', role: 'Designer', workLocation: 'Chicago', from: '2023-06-01', to: '2024-11-30' },
    ];

    // Sort instruments based on the current sort configuration
    const sortedInstruments = [...instruments].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    // Filter instruments based on the current filter values
    const filteredInstruments = sortedInstruments.filter(instrument => {
        return (
            (filters.name ? instrument.name.toLowerCase().includes(filters.name.toLowerCase()) : true) &&
            (filters.role ? instrument.role.toLowerCase().includes(filters.role.toLowerCase()) : true) &&
            (filters.workLocation ? instrument.workLocation.toLowerCase().includes(filters.workLocation.toLowerCase()) : true)
        );
    });

    // Function to handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [key]: value,
        }));
    };

    // Filter options for the FilterForm
    const filterOptions = [
        {
            key: 'name',
            label: 'Name',
            options: instruments.map(instrument => instrument.name),
            value: filters.name,
            fullWidth: true,
        },
        {
            key: 'role',
            label: 'Role',
            options: [...new Set(instruments.map(instrument => instrument.role))], // Unique roles
            value: filters.role,
            fullWidth: true,
        },
        {
            key: 'workLocation',
            label: 'Work Location',
            options: [...new Set(instruments.map(instrument => instrument.workLocation))], // Unique work locations
            value: filters.workLocation,
            fullWidth: true,
        },
    ];

    return (
        <div className="table-container">
            {/* Render FilterForm above the table */}
            <FilterForm filters={filterOptions} onFilterChange={handleFilterChange} />
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'name'}
                                    direction={sortConfig.key === 'name' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('name')}
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
                                    active={sortConfig.key === 'workLocation'}
                                    direction={sortConfig.key === 'workLocation' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('workLocation')}
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
                        {filteredInstruments.map((instrument) => (
                            <TableRow key={instrument.id}>
                                <TableCell>{instrument.name}</TableCell>
                                <TableCell>{instrument.role}</TableCell>
                                <TableCell>{instrument.workLocation}</TableCell>
                                <TableCell>{instrument.from}</TableCell>
                                <TableCell>{instrument.to}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default ManagerTable;
