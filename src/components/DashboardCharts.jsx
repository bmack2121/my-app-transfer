import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler, // ✅ Added for the smooth area effect
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

const DashboardCharts = ({ stats }) => {
  // Global Chart Options for VinPro style
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Cleaner look; labels are in the headers
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(203, 213, 225, 0.1)" }, // slate-200 with low opacity
      },
      x: {
        grid: { display: false },
      },
    },
  };

  const inventoryData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        label: "Inventory",
        data: stats.inventoryHistory || [42, 45, 40, 48, 52, 50],
        borderColor: "#3b82f6", // blue-500
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4, // ✅ Smooths the line for a modern feel
        pointRadius: 4,
        pointBackgroundColor: "#3b82f6",
      },
    ],
  };

  const leadsData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "New Leads",
        data: stats.leadsHistory || [12, 19, 15, 22],
        backgroundColor: "#facc15", // yellow-400
        borderRadius: 8, // ✅ Rounded bars match the VinPro UI
        barThickness: 20,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* Inventory Trend Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Inventory Trend</h2>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Stock Levels</span>
        </div>
        <div className="h-64">
          <Line data={inventoryData} options={options} />
        </div>
      </div>

      {/* Lead Volume Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Lead Velocity</h2>
          <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">Weekly Growth</span>
        </div>
        <div className="h-64">
          <Bar data={leadsData} options={options} />
        </div>
      </div>

    </div>
  );
};

export default DashboardCharts;