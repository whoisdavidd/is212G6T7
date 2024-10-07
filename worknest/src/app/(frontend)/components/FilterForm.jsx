import React from 'react';
import { TextField, MenuItem, Grid, Button } from '@mui/material';

const FilterForm = ({ filters, onFilterChange, onClearFilters }) => {
    const handleChange = (key) => (event) => {
        onFilterChange(key, event.target.value);
    };

    return (
        <div>
            <Grid container spacing={2}>
                {filters.map((filter) => (
                    <Grid item xs={filter.fullWidth ? 12 : 6} key={filter.key}>
                        {filter.type === 'date' ? (
                            <TextField
                                fullWidth
                                label={filter.label}
                                type="date"
                                value={filter.value ? new Date(filter.value).toISOString().split('T')[0] : ''} // Ensuring YYYY-MM-DD
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                onChange={handleChange(filter.key)}
                            />
                        ) : (
                            <TextField
                                fullWidth={filter.fullWidth}
                                select={filter.options.length > 0}
                                label={filter.label}
                                value={filter.value}
                                onChange={handleChange(filter.key)}
                            >
                                {filter.options.length > 0 && filter.options.map((option, index) => (
                                    <MenuItem key={index} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

export default FilterForm;
