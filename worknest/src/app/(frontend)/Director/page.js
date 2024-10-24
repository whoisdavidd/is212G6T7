"use client";
import React, { useState, useEffect } from 'react';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import DirectorTable from '../components/DirectorTable';
import Sidebar from '../components/Sidebar';
import { PieChart } from "@mui/x-charts/PieChart";
import '../../styles/App.css';

function Director() {
    const [pieChartData, setPieChartData] = useState([]);
    const [tableData, setTableData] = useState([]);

    // Fetch data for Pie Chart
    useEffect(() => {
        const fetchPieChartData = async () => {
            try {
                const response = await fetch("http://127.0.0.1:5002/piechart");
                const data = await response.json();
                setPieChartData(
                    data.map((item) => ({
                        id: item.label,
                        value: item.value,
                        label: item.label,
                    }))
                );
            } catch (error) {
                console.error("Error fetching PieChart data:", error);
            }
        };
        fetchPieChartData();
    }, []);

    // Fetch data for Table
    useEffect(() => {
        const fetchTableData = async () => {
            try {
                const response = await fetch("http://127.0.0.1:5004/schedules");
                const data = await response.json();
                setTableData(data);
            } catch (error) {
                console.error("Error fetching Table data:", error);
            }
        };
        fetchTableData();
    }, []);

    return (
        <div className="App">
            <ResponsiveAppBar />
            <div className="staff-calendar-page">
                <Sidebar />
                <div className="main-content">
                    {/* Render PieChart */}
                    <div className="border-2 border-gray-1000 rounded-lg p-4">
                        <PieChart
                            series={[
                                {
                                    data: pieChartData,
                                },
                            ]}
                            width={400}
                            height={300}
                        />
                    </div>
                    <DirectorTable rows={tableData} />
                </div>
            </div>
        </div>
    );
}

export default Director;
