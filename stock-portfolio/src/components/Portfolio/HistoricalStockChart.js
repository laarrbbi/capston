import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const HistoricalStockChart = ({ historicalData }) => {
  // Sort data by date in descending order to get the newest first
  const sortedData = Object.entries(historicalData)
    .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
    .slice(0, 12) // Take only the most recent 12 data points
    .reduce((acc, [date, data]) => ({ ...acc, [date]: data }), {});

  // Prepare the data for Chart.js
  const data = {
    labels: Object.keys(sortedData),
    datasets: [
      {
        label: 'Close Price',
        data: Object.values(sortedData).map((data) => parseFloat(data['4. close'])),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  return <Line data={data} />;
};

export default HistoricalStockChart;

