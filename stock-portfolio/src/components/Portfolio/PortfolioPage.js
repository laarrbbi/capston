import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Modal, Table, Alert, Button, Accordion, Spinner, InputGroup, FormControl } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const PortfolioPage = () => {
  const [stocks, setStocks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [newStockTicker, setNewStockTicker] = useState('');
  const [newStockQuantity, setNewStockQuantity] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Fetch portfolio data on component mount
  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/portfolio', {
        method: 'GET',
        credentials: 'include', // Required for sessions/cookies
      });
      if (!response.ok) throw new Error('Failed to fetch portfolio');
      const data = await response.json();
      setStocks(data);
      const totalValue = data.reduce((acc, stock) => acc + stock.quantity * stock.currentPrice, 0);
      setPortfolioValue(totalValue);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      setErrorMessage('Failed to fetch portfolio.');
    }
  };

  const searchStocks = async () => {
    if (!searchQuery) return;
    try {
      const response = await fetch(`http://127.0.0.1:5000/search/stocks?query=${searchQuery}`, {
        method: 'GET',
        credentials: 'include', // Required for sessions/cookies
      });
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data.bestMatches);
    } catch (error) {
      console.error('Search error:', error);
      setErrorMessage('Failed to search stocks.');
    }
  };

  const handleAddStock = async () => {
    // Prevent adding if the ticker is empty or quantity is less than or equal to 0
    if (!newStockTicker || newStockQuantity <= 0) {
        setErrorMessage('Please enter a valid ticker and quantity greater than 0.');
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/portfolio/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ticker: newStockTicker.toUpperCase(), // Ensure ticker is uppercase
                quantity: Number(newStockQuantity) // Ensure quantity is a number
            }),
            credentials: 'include', // Include cookies for session management
        });

        if (!response.ok) {
            // If the response is not ok, throw an error with the response status
            const errorData = await response.json(); // Assuming the backend sends JSON with an error message
            throw new Error(errorData.message || `Failed to add stock with status: ${response.status}`);
        }

        // Clear the input fields and error message after successful addition
        setNewStockTicker('');
        setNewStockQuantity(0);
        setErrorMessage('');

        // Close the modal if you're using one
        setShowAddStockModal(false);

        // Fetch the updated portfolio to reflect the new addition
        fetchPortfolio();
    } catch (error) {
        console.error('Error adding stock:', error);
        setErrorMessage(`Failed to add stock: ${error.message}`);
    }
};

  const handleDeleteStock = async (stockId) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/portfolio/remove/${stockId}`, {
          method: 'DELETE',
          credentials: 'include', // Necessary for session management
      });

      if (!response.ok) {
          // If the backend responds with a non-OK status, throw an error to catch it below
          throw new Error(`Failed to delete stock with status: ${response.status}`);
      }

      // After a successful delete, refresh the portfolio list to reflect the changes
      fetchPortfolio();
  } catch (error) {
      console.error('Error deleting stock:', error);
      // Optionally, update the state to show an error message to the user
      setErrorMessage(`Failed to delete stock: ${error.message}`);
  }
};



useEffect(() => {
  fetchPortfolio();
}, []);

return (
  <Container fluid="md">
    <h1>Stock Portfolio</h1>
    {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
    <Row className="mb-3">
      <Col>
        <h2>Total Portfolio Value: ${portfolioValue.toFixed(2)}</h2>
      </Col>
      <Col>
        <Button onClick={() => setShowAddStockModal(true)}>Add Stock</Button>
      </Col>
    </Row>
    <Row>
      <Col xs={12}>
        <InputGroup className="mb-3">
          <FormControl
            placeholder="Search for stocks..."
            aria-label="Search for stocks"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="outline-secondary" onClick={searchStocks}>
            Search
          </Button>
        </InputGroup>
        {loadingSearch ? (
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        ) : (
          searchResults.map((stock, index) => (
            <Alert key={index} variant="success">
              {stock['1. symbol']} - {stock['2. name']}
            </Alert>
          ))
        )}
      </Col>
    </Row>
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Ticker</th>
          <th>Quantity</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {stocks.map((stock, index) => (
          <tr key={index}>
            <td>{stock.ticker}</td>
            <td>{stock.quantity}</td>
            <td>
              <Button variant="danger" onClick={() => handleDeleteStock(stock.stock_id)}>Delete</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>

    {/* Add Stock Modal */}
    <Modal show={showAddStockModal} onHide={() => setShowAddStockModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Add a new stock</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Stock Ticker</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter stock ticker"
            value={newStockTicker}
            onChange={(e) => setNewStockTicker(e.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Quantity</Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter quantity"
            value={newStockQuantity}
            onChange={(e) => setNewStockQuantity(Number(e.target.value))}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowAddStockModal(false)}>
          Close
        </Button>
        <Button variant="primary" onClick={handleAddStock}>
          Add Stock
        </Button>
      </Modal.Footer>
    </Modal>
  </Container>
);
};

export default PortfolioPage;
