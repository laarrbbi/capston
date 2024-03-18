import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Card, Modal } from 'react-bootstrap';
import { fetchPortfolio, addStockToPortfolio, updateStockInPortfolio, deleteStockFromPortfolio,searchStocks, fetchCurrentStockData, fetchHistoricalStockData} from './api'; // Assuming these functions are correctly implemented in api.js

function PortfolioApp() {
  const [portfolio, setPortfolio] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newStock, setNewStock] = useState({ ticker: '', quantity: 0 });
  const [totalValue, setTotalValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentStockData, setCurrentStockData] = useState({});
  const [historicalStockData, setHistoricalStockData] = useState({});



  useEffect(() => {
    fetchAndSetPortfolio();
  }, []);

  const fetchAndSetPortfolio = async () => {
    try {
      const response = await fetchPortfolio();
      setPortfolio(response.data.filter((item) => !item.portfolio_value));
      const totalValue = response.data.find((item) => item.portfolio_value)?.portfolio_value || 0;
      setTotalValue(totalValue);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      // Use the ticker from newStock to add the stock
      const response = await addStockToPortfolio(newStock);
      // Update the portfolio state with the new stock
      setPortfolio([...portfolio, response.data]);
      // Reset states
      setNewStock({ ticker: '', quantity: 0 });
      setShowModal(false);
    } catch (error) {
      console.error('Error adding stock:', error);
    }
  };
  
  const handleFetchHistoricalStockData = async (symbol) => {
    try {
      const data = await fetchHistoricalStockData(symbol);
      setHistoricalStockData(data);
    } catch (error) {
      console.error('Failed to fetch and set historical stock data:', error);
      // Optionally set an error state here and display an error message to the user
    }
  };
  

  const handleSearch = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      const response = await searchStocks(searchQuery);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching stocks:', error);
    }
  };

  const handleSelectStock = (symbol) => {
    setSearchQuery(symbol);
    setNewStock({ ...newStock, ticker: symbol });
    setSearchResults([]);
  
    // Now, also fetch the current stock data
    fetchCurrentStockData(symbol)
      .then(data => {
        setCurrentStockData(data); // Assuming this state has been added to your component
      })
      .catch(error => {
        console.error('Error fetching current stock data:', error);
        // Handle error, maybe update the UI to show an error message
      });
  
  };

  
  const handleDeleteStock = async (stockId) => {
    try {
      await deleteStockFromPortfolio(stockId);
      setPortfolio(portfolio.filter((stock) => stock.stock_id !== stockId));
    } catch (error) {
      console.error('Error deleting stock:', error);
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedStock || !selectedStock.quantity) {
      // Maybe set an error message in state and return
      return;
    }
  
    try {
      const updatedStockData = await updateStockInPortfolio(selectedStock.stock_id, selectedStock.quantity);
      // Update state with new portfolio data
      setPortfolio(portfolio.map((stock) => stock.stock_id === selectedStock.stock_id ? { ...stock, quantity: selectedStock.quantity } : stock));
      setSelectedStock(null); // Reset selected stock
      alert(updatedStockData.message); // Show success message
    } catch (error) {
      console.error('Error updating stock:', error);
      // Maybe set an error message in state
    }
  };
  

  return (
    <Container>
      <Row>
        <Col>
          <h1 className="text-center my-4">My Stock Portfolio</h1>
          <div className="text-center mb-4">Total value: €{totalValue.toFixed(2)}</div>
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          {portfolio.map((stock) => (
            <Card key={stock.stock_id} className="mb-2">
              <Card.Body onClick={() => setSelectedStock(stock)}>
                <Card.Title>{stock.ticker}</Card.Title>
                Quantity: {stock.quantity}
              </Card.Body>
            </Card>
          ))}
          <Button onClick={() => setShowModal(true)}>Add New Symbol</Button>
        </Col>
        <Col md={8}>
          {selectedStock && (
            <>
              <Card>
                <Card.Body>
                  <Card.Title>Symbol: {selectedStock.ticker}</Card.Title>
                  <Form.Group className="mb-3">
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      value={selectedStock.quantity}
                      onChange={(e) =>
                        setSelectedStock({ ...selectedStock, quantity: Number(e.target.value) })
                      }
                    />
                  </Form.Group>
                  <Button variant="primary" onClick={handleUpdateStock}>Update</Button>
                  <Button variant="danger" onClick={() => handleDeleteStock(selectedStock.stock_id)}>Delete</Button>
                </Card.Body>
              </Card>

              {/* Section to display current stock information */}
              {currentStockData && (
                <div>
                  <h3>Current Stock Information</h3>
                  <p>Price: {currentStockData['05. price']}</p>
                  {/* Additional fields can be displayed as needed */}
                </div>
              )}

              {/* Button to load and display historical stock data */}
              {selectedStock && (
                <>
                  <Button onClick={() => handleFetchHistoricalStockData(selectedStock.ticker)}>Load Historical Data</Button>
                  {historicalStockData && (
                    <div>
                      <h3>Historical Stock Data</h3>
                      <ul>
                        {Object.entries(historicalStockData).map(([date, data]) => (
                          <li key={date}>Date: {date}, Open: {data['1. open']}, High: {data['2. high']}, Low: {data['3. low']}, Close: {data['4. close']}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </Col>
      </Row>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddStock}>
            <Form.Group className="mb-3">
              <Form.Label>Symbol</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const uppercasedInput = e.target.value.toUpperCase();
                    setSearchQuery(uppercasedInput);
                    setNewStock(prevNewStock => ({ ...prevNewStock, ticker: uppercasedInput }));
                  }}
                  placeholder="Enter stock symbol"
                  required
                />
                <Button onClick={handleSearch} variant="secondary" className="ms-2">Search</Button>
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                value={newStock.quantity}
                onChange={(e) => setNewStock(prevNewStock => ({ ...prevNewStock, quantity: Number(e.target.value) }))}
                required
              />
            </Form.Group>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
            <Button variant="primary" type="submit">Add Stock</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default PortfolioApp;