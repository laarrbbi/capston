import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PortfolioList from './components/PortfolioList';
import StockDetails from './components/StockDetails';
import HistoricalData from './components/HistoricalData';

function App() {
  return (
    <Router>
      <div className="App">
        <h1>My Stock Portfolio</h1>
        <Routes>
          <Route path="/" element={<PortfolioList />} />
          <Route path="/stock/:symbol" element={<StockDetails />} />
          <Route path="/stock/:symbol/history" element={<HistoricalData />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;