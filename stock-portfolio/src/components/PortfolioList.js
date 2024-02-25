import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function PortfolioList() {
  const [portfolio, setPortfolio] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/portfolio')
      .then(response => {
        setPortfolio(response.data.portfolios[0].items);
      })
      .catch(error => console.error("There was an error fetching the portfolio:", error));
  }, []);

  return (
    <div>
      {portfolio.map((stock, index) => (
        <div key={index}>
          <Link to={`/stock/${stock.ticker}`}>
            {stock.ticker} - Quantity: {stock.quantity}
          </Link>
        </div>
      ))}
    </div>
  );
}

export default PortfolioList;
