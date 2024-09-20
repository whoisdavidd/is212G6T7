"use client";
import React, { useState, useEffect } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import ResponsiveAppBar from "../components/ResponsiveAppBar";
import DataTable from "../components/DataTable";


const HR = () => {
  const [chartData, setChartData] = useState([]);
  const [tableData, setTableData] = useState([]);

  // Fetch data from Flask backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/piechart"); // Make sure the Flask server is running at this URL
        const data = await response.json();
        setChartData(
          data.map((item) => ({
            id: item.label, // Ensure unique id
            value: item.value,
            label: item.label,
          }))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  React.useEffect(() => {
    const fetchTableData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/departments"); // Replace with your actual endpoint
        const data = await response.json();
        setTableData(data); // Ensure that the response data is in the correct format for the tabl
      } catch (error) {
        console.error("Error fetching table data:", error);
      }
    };

    fetchTableData();
  }, []);

  // Render the PieChart
  return (
    <>
      <div>
        <ResponsiveAppBar />
      </div>
      <div className="flex justify-center items-center h-screen">
        {chartData.length > 0 ? (
          <div className="border-2 border-gray-300 rounded-lg p-4">
            <PieChart
              series={[
                {
                  data: chartData, // Data fetched from the backend
                },
              ]}
              width={400}
              height={200}
            />
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <div>
        <DataTable  rows = {tableData} />
      </div>
    </>
  );
};

export default HR;
