import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function PortfolioList() {
  const [portfolio, setPortfolio] = useState([]);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);

  useEffect(() => {
    axios.get('https://mcsbt-integration-larbi.ue.r.appspot.com/portfolio')
      .then(response => {
        const portfolioItems = response.data.portfolios[0].items;
        // Fetch current price for each stock and calculate total value
        Promise.all(portfolioItems.map(stock =>
          axios.get(`https://mcsbt-integration-larbi.ue.r.appspot.com/stock/current?symbol=${stock.ticker}`)
            .then(res => ({
              ...stock,
              currentPrice: parseFloat(res.data['Global Quote']['05. price']),
              totalValue: parseFloat(res.data['Global Quote']['05. price']) * stock.quantity
            }))
        )).then(stocks => {
          setPortfolio(stocks);
          const totalValue = stocks.reduce((acc, stock) => acc + stock.totalValue, 0);
          setTotalPortfolioValue(totalValue);
        });
      })
      .catch(error => console.error("There was an error fetching the portfolio:", error));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {portfolio.map((stock, index) => (
        <div key={index} style={{ margin: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <Link to={`/stock/${stock.ticker}`} style={{ textDecoration: 'none', color: 'black' }}>
            {stock.ticker} - Quantity: {stock.quantity} - Current Price: ${stock.currentPrice.toFixed(2)} - Total Value: ${stock.totalValue.toFixed(2)}
          </Link>
        </div>
      ))}
      <div style={{ marginTop: '20px', fontWeight: 'bold' }}>
        Total Portfolio Value: ${totalPortfolioValue.toFixed(2)}
      </div>
    </div>
  );
}

export default PortfolioList;
