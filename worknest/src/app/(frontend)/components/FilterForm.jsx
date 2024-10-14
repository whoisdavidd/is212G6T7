import React from 'react';
import { TextField, MenuItem, Grid, Button } from '@mui/material';

const FilterForm = ({ filters, onFilterChange }) => {
    return (
        <Grid container spacing={2} style={{ marginBottom: '20px' }}>
            {filters.map((filter) => (
                <Grid item xs={filter.fullWidth ? 12 : 6} md={filter.fullWidth ? 3 : 2} key={filter.key}>
                    {filter.type === 'date' ? (
                        <TextField
                            label={filter.label}
                            type="date"
                            value={filter.value}
                            onChange={(e) => onFilterChange(filter.key, e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            fullWidth={filter.fullWidth}
                        />
                    ) : (
                        <TextField
                            select
                            label={filter.label}
                            value={filter.value}
                            onChange={(e) => onFilterChange(filter.key, e.target.value)}
                            fullWidth={filter.fullWidth}
                        >
                            <MenuItem value="">All</MenuItem>
                            {filter.options.map((option, index) => (
                                <MenuItem key={index} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                </Grid>
            ))}
        </Grid>
    );
};

export default FilterForm;