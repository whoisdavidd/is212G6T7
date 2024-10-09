"use client";
import React, { useState, useEffect } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import ResponsiveAppBar from "../components/ResponsiveAppBar";
import Sidebar from "../components/Sidebar";
import HrTable from "../components/HrTable";
import CustomBarChart from "../components/BarChart"; // Renaming to avoid conflict

const HR = () => {
  const [pieChartData, setPieChartData] = useState([]); // Separate state for PieChart data
  const [barChartData, setBarChartData] = useState([]); // Separate state for BarChart data
  const [xLabels, setXLabels] = useState([]); // x-axis labels for BarChart
  const [tableData, setTableData] = useState([]);

  // Fetch data for Pie Chart
  useEffect(() => {
    const fetchPieChartData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5002/piechart"); // Ensure Flask server is running
        const data = await response.json();
        setPieChartData(
          data.map((item) => ({
            id: item.label, // Ensure unique id for PieChart
            value: item.value,
            label: item.label,
          }))
        );
      } catch (error) {
        console.error("Error fetching PieChart data:", error);
      }
    };
    const intervalId = setInterval(() => {
      fetchPieChartData();
    }, 5000); // 5000ms = 5 seconds
  
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Fetch data for Bar Chart
  useEffect(() => {
    const fetchBarChartData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5002/barchart"); // Ensure Flask server is running
        const data = await response.json();
        setBarChartData(data.seriesData); // Assuming data.seriesData is an array
        setXLabels(data.xLabels); // Assuming data.xLabels is an array of department labels
      } catch (error) {
        console.error("Error fetching BarChart data:", error);
      }
    };
    const intervalId = setInterval(() => {
      fetchBarChartData();
    }, 5000); // 5000ms = 5 seconds
  
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Fetch data for Table
  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5002/departments"); // Replace with your actual endpoint
        const data = await response.json();
        console.log(data);

        const mergedData = await Promise.all(
          data.map(async (dept) => {
            const staff_id = dept.staff_id;
            // Fetch startDate data for each staff_id
            const startDateResponse = await fetch(`http://127.0.0.1:5004/schedule/${staff_id}`);
            const startDateData = await startDateResponse.json();

            // Merge the department data with the corresponding start date
            return {
              ...dept, // Spread department data
              date: startDateData.date ? startDateData.date : "N/A", // Add start_date field (now named date)
            };
          })
        );
        setTableData(mergedData); // Ensure that the response data is in the correct format for the table
      } catch (error) {
        console.error("Error fetching Table data:", error);
      }
    };
    const intervalId = setInterval(() => {
      fetchTableData();
    }, 5000); // 5000ms = 5 seconds
    
      // Cleanup interval on component unmount
    return () => clearInterval(intervalId);


  }, []);
  const exportCSV = () => {
    const csvRows = [];
    const headers = Object.keys(tableData[0]);
    csvRows.push(headers.join(",")); // Add headers to CSV

    // Loop through each row of data
    tableData.forEach(row => {
      const values = headers.map(header => `"${row[header]}"`);
      csvRows.push(values.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'exported_data.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  // Render the page
  return (
    <>
      <div className="flex">
        <div className="flex-none">
          <Sidebar />
        </div>
        <div className="flex-grow">
          <ResponsiveAppBar />
  
          {/* Flexbox row to display PieChart and BarChart side by side */}
          <div className="flex flex-row justify-center items-center mx-auto p-6 space-x-6">
            {pieChartData.length > 0 && barChartData.length > 0 ? (
              <>
                {/* PieChart */}
                <div className="border-2 border-gray-1000 rounded-lg p-4">
                  <PieChart
                    series={[
                      {
                        data: pieChartData, // Use the correct state for PieChart
                      },
                    ]}
                    width={400}
                    height={300}
                  />
                </div>
  
                {/* BarChart */}
                <div className="border-2 border-gray-1000 rounded-lg p-4">
                  <CustomBarChart
                    xLabels={xLabels} // Pass xLabels as prop for BarChart
                    seriesData={barChartData} // Use the correct state for BarChart
                    width={600}
                    height={300}
                  />
                </div>
              </>
            ) : (
              <p>Loading charts...</p>
            )}
          </div>
             {/* Export Button */}
          <div className="flex justify-center mt-4">
            <button 
              onClick={exportCSV} 
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              Export Data to CSV
            </button>
          </div>
          {/* Table */}
          <div className="justify-center mt-4">
            <HrTable rows={tableData} />
          </div>
        </div>
      </div>
    </>
  );
};
export default HR;