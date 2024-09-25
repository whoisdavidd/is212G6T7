import React from 'react';
import { FormControl, TextField, Autocomplete, Box, Grid } from '@mui/material';

const FilterForm = ({ filters = [], onFilterChange }) => {
    return (
        <Box sx={{ mb: 2 }}>
            <Grid container spacing={2}>
                {filters.map((filter, index) => (
                    <Grid
                        item
                        xs={12}
                        sm={filter.fullWidth ? 12 : 6}
                        key={index}
                    >
                        <FormControl fullWidth sx={{ mb: '5px' }}>
                            <Autocomplete
                                options={filter.options}
                                value={filter.value}
                                onChange={(event, newValue) => onFilterChange(filter.key, newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={filter.label}
                                    />
                                )}
                                freeSolo
                            />
                        </FormControl>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default FilterForm;
