import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // For better assertion syntax
import HrTable from '../(frontend)/components/HrTable';  // Adjust the path to where DataTable is located

// Mock data for testing
const mockRows = [
    { staff_id: 1, department: 'HR', location: 'OFFICE' },
    { staff_id: 2, department: 'Engineering', location: 'WFH' },
    { staff_id: 3, department: 'Sales', location: 'OFFICE' },
    { staff_id: 4, department: 'Marketing', location: 'WFH' },
  ];
  
  test('should render HrTable and show all departments', () => {
    // Render the HrTable component with the mock data
    render(<HrTable rows={mockRows} />);
  
    // Check if the table is rendered with the right headers
    expect(screen.getByText('Staff ID')).toBeInTheDocument();
    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
  
    // Check if all rows are rendered initially
    expect(screen.getByText('HR')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
  });
  