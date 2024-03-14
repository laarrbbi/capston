import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Portfolio from './components/Portfolio/PortfolioPage';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/" element={<Navigate replace to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
