import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';

const CustomBarChart = ({ xLabels, seriesData, width = 500, height = 300 }) => {
  return (
    <BarChart
      xAxis={[{ scaleType: 'band', data: xLabels }]}  // Labels for the x-axis
      series={seriesData.map(series => ({
        id: series.label,  // Set the id based on the series label (e.g., 'WFH', 'OFFICE')
        label: series.label,  // Display the label
        data: series.data,  // Data points for this series (WFH or OFFICE counts)
      }))} // Array of series data
      width={width}  // Chart width
      height={height}  // Chart height
    />
  );
};

export default CustomBarChart;