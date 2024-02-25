// src/HistoricalData.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function HistoricalData() {
  const [historicalData, setHistoricalData] = useState({});
  const { symbol } = useParams();

  useEffect(() => {
    axios.get(`http://127.0.0.1:5000/stock/history?symbol=${symbol}`)
      .then(response => {
        setHistoricalData(response.data);
      })
      .catch(error => console.error("There was an error fetching the historical stock data:", error));
  }, [symbol]);

  return (
    <div>
      <h2>{symbol} Historical Data</h2>
      {historicalData['Monthly Time Series'] ? (
        Object.entries(historicalData['Monthly Time Series']).map(([date, data], index) => (
          <div key={index}>
            <h3>{date}</h3>
            <ul>
              <li>Open: {data['1. open']}</li>
              <li>High: {data['2. high']}</li>
              <li>Low: {data['3. low']}</li>
              <li>Close: {data['4. close']}</li>
              <li>Volume: {data['5. volume']}</li>
            </ul>
          </div>
        ))
      ) : (
        <p>No historical data available.</p>
      )}
    </div>
  );
}

export default HistoricalData;
