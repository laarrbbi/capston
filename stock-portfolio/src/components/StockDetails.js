// src/StockDetails.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function StockDetails() {
  const [stockData, setStockData] = useState({});
  const { symbol } = useParams();
  const navigate = useNavigate(); // Hook to navigate to different routes

  useEffect(() => {
    axios.get(`https://mcsbt-integration-larbi.ue.r.appspot.com/stock/current?symbol=${symbol}`)
      .then(response => {
        setStockData(response.data);
      })
      .catch(error => console.error("There was an error fetching the current stock data:", error));
  }, [symbol]);

  return (
    <div>
      <h2>{symbol} Current Data</h2>
      <div className="stock-data">
        {stockData['Global Quote'] ? (
          <ul>
            <li>Open: {stockData['Global Quote']['02. open']}</li>
            <li>High: {stockData['Global Quote']['03. high']}</li>
            <li>Low: {stockData['Global Quote']['04. low']}</li>
            <li>Price: {stockData['Global Quote']['05. price']}</li>
            <li>Volume: {stockData['Global Quote']['06. volume']}</li>
          </ul>
        ) : (
          <p>No current data available.</p>
        )}
      </div>
      <button onClick={() => navigate(`/stock/${symbol}/history`)}>Show Historical Data</button>
    </div>
  );
}

export default StockDetails;
