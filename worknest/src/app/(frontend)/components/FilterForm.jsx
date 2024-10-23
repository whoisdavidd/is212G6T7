import React from 'react';
import { TextField, MenuItem, Grid } from '@mui/material';

const FilterForm = ({ filters, onFilterChange }) => {
    return (
        <Grid container spacing={2} style={{ marginBottom: '20px' }}>
            {filters.map((filter) => (
                <Grid item xs={12} sm={6} md={3} key={filter.key}>
                    <TextField
                        select
                        label={filter.label}
                        value={filter.value}
                        onChange={(e) => onFilterChange(filter.key, e.target.value)}
                        fullWidth
                        variant="outlined"
                    >
                        <MenuItem value="">All</MenuItem>
                        {filter.options.map((option, index) => (
                            <MenuItem key={index} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
            ))}
        </Grid>
    );
};

export default FilterForm;
