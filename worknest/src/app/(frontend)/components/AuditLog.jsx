import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/system';

const StyledTableCell = styled(TableCell)({
    // backgroundColor: '#000000', // Use hardcoded black color
    color: '#000000',           // Use hardcoded white color
  });
  

const AuditLog = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [sortDirection, setSortDirection] = useState('asc');
  const [sortBy, setSortBy] = useState('action');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Fetch audit logs
  useEffect(() => {
    const fetchAuditLogs = async () => {
      const response = await fetch('http://localhost:5006/audit_log');
      const data = await response.json();
      setAuditLogs(data);
      setFilteredLogs(data); // Initially, all logs are displayed
    };
    
    fetchAuditLogs();
  }, []);

  // Filter logs based on department
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setDepartmentFilter(value);

    const filtered = auditLogs.filter(log => 
      log.department.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredLogs(filtered);
  };

  // Sorting functionality
  const handleSort = (property) => {
    const isAsc = sortBy === property && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortBy(property);

    const sortedLogs = [...filteredLogs].sort((a, b) => {
      if (a[property] < b[property]) {
        return isAsc ? -1 : 1;
      }
      if (a[property] > b[property]) {
        return isAsc ? 1 : -1;
      }
      return 0;
    });
    setFilteredLogs(sortedLogs);
  };

  return (
    <Paper
    elevation={3}
    sx={{
      padding: '20px',
      borderRadius: '10px',
      marginTop: '20px',
      width: '100%',
      boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
    }}
  >
      <Typography variant="h6" sx={{ marginBottom: '10px' }}>
        Audit Log
      </Typography>

      <TextField
        label="Filter by Department"
        variant="outlined"
        value={departmentFilter}
        onChange={handleFilterChange}
        style={{ margin: '10px' }}
      />
      <TableContainer component={Paper} style={{ width: '100%', maxWidth: '100%' }}>
        <Table style={{ width: '100%' }}>
          <TableHead>
            <TableRow>
              <StyledTableCell>
                <TableSortLabel
                  active={sortBy === 'action'}
                  direction={sortBy === 'action' ? sortDirection : 'asc'}
                  onClick={() => handleSort('action')}
                >
                  Action
                </TableSortLabel>
              </StyledTableCell>
              <StyledTableCell>
                <TableSortLabel
                  active={sortBy === 'approver_id'}
                  direction={sortBy === 'approver_id' ? sortDirection : 'asc'}
                  onClick={() => handleSort('approver_id')}
                >
                  Approver ID
                </TableSortLabel>
              </StyledTableCell>
              <StyledTableCell>Approver Email</StyledTableCell>
              <StyledTableCell>Action Timestamp</StyledTableCell>
              <StyledTableCell>Start Date</StyledTableCell>
              <StyledTableCell>Duration</StyledTableCell>
              <StyledTableCell>Department</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.log_id}>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.approver_id}</TableCell>
                <TableCell>{log.approver_email}</TableCell>
                <TableCell>{new Date(log.action_timestamp).toLocaleString()}</TableCell>
                <TableCell>{new Date(log.start_date).toLocaleDateString()}</TableCell>
                <TableCell>{log.duration}</TableCell>
                <TableCell>{log.department}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default AuditLog;
