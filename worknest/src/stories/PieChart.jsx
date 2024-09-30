import * as React from "react";
import { PieChart } from "@mui/x-charts/PieChart";

const  HrChart = ({ data }) => {
    return (
        <PieChart
        series={[
            {
            data: data, //use the data passed as a prop
        },
    ]}
        width={400}
        height={200}
    />
  );
}
export default HrChart;           