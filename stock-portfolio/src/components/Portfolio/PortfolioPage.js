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
      console.log('Fetched historical stock data:', data); // Log the fetched data
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

  //const handleSelectStock = (stock) => {
    //setSelectedStock(stock); // Ensure this is the stock object with all necessary data
    //fetchCurrentStockData(stock.ticker)
     // .then(data => {
     //   setCurrentStockData(data); // Update state with the current stock data
     // })
     // .catch(error => {
     //   console.error('Error fetching current stock data:', error);
    //  });
 // };

 const handleSelectStock = (stock) => {
  console.log('Selected stock:', stock); // Log the stock object to debug
  setSelectedStock(stock); // Ensure this is the stock object with all necessary data
  fetchCurrentStockData(stock.ticker)
    .then(data => {
      setCurrentStockData(data); // Update state with the current stock data
    })
    .catch(error => {
      console.error('Error fetching current stock data:', error);
    });
};

  


  const handleDeleteStock = async (stockId) => {
    console.log('Deleting stock with ID:', stockId);
    try {
      await deleteStockFromPortfolio(stockId);
      // Filter out the deleted stock and update the portfolio state
      const updatedPortfolio = portfolio.filter((stock) => stock.stock_id !== stockId);
      setPortfolio(updatedPortfolio);
      
      // Recalculate total portfolio value and update state
      const newTotalValue = updatedPortfolio.reduce((acc, stock) => acc + (stock.quantity * stock.currentPrice), 0);
      setTotalValue(newTotalValue);
  
      // ...
    } catch (error) {
      console.error('Error deleting stock:', error);
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedStock || !selectedStock.stock_id || selectedStock.quantity === undefined) {
        console.error('Selected stock, stock ID, or quantity is undefined.');
        return;
    }

    try {
        const updatedStockData = await updateStockInPortfolio(selectedStock.stock_id, selectedStock.quantity);
        console.log("Updated stock data received from API:", updatedStockData);
        // Update the portfolio state with the updated stock information, ensuring to include all necessary details
        const updatedPortfolio = portfolio.map(stock => 
            stock.stock_id === selectedStock.stock_id ? { ...stock, ...updatedStockData } : stock
        );
        setPortfolio(updatedPortfolio);

        // Recalculate the total portfolio value
        const newTotalValue = updatedPortfolio.reduce((acc, stock) => acc + (stock.quantity * stock.currentPrice), 0);
        setTotalValue(newTotalValue);

        setSelectedStock(null); // Clear the selected stock after updating
        alert('Stock updated successfully'); // Consider replacing with more sophisticated notification
    } catch (error) {
        console.error('Error updating stock:', error);
        // Handle error state appropriately
    }
};



const renderHistoricalDataTable = () => {
  if (historicalStockData && typeof historicalStockData === 'object' && Object.keys(historicalStockData).length > 0) {
    // Convert the object into an array of entries, each entry is [date, data]
    const tableRows = Object.entries(historicalStockData).map(([date, data]) => (
      <tr key={date}>
        <td>{date}</td>
        <td>{data['1. open']}</td>
        <td>{data['2. high']}</td>
        <td>{data['3. low']}</td>
        <td>{data['4. close']}</td>
        <td>{data['5. volume']}</td>
      </tr>
    ));

    return (
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Open</th>
            <th>High</th>
            <th>Low</th>
            <th>Close</th>
            <th>Volume</th>
          </tr>
        </thead>
        <tbody>{tableRows}</tbody>
      </table>
    );
  } else {
    return <p>No historical data to display.</p>;
  }
};


// Add this function within your PortfolioApp component
const handleFetchCurrentStockData = async (symbol) => {
  try {
    const data = await fetchCurrentStockData(symbol);
    console.log('Fetched current stock data:', data); // Log the fetched data
    setCurrentStockData(data); // Set the state
  } catch (error) {
    console.error('Failed to fetch and set current stock data:', error);
  }
};


// Function to render the current stock data in a table format
const renderCurrentStockData = () => {
  if (currentStockData && Object.keys(currentStockData).length > 0) {
    // Create table rows from currentStockData object
    const tableRows = Object.entries(currentStockData).map(([key, value]) => (
      <tr key={key}>
        <td>{key}</td>
        <td>{value}</td>
      </tr>
    ));

    return (
      <div>
        <h3>Current Stock Information</h3>
        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>{tableRows}</tbody>
        </table>
      </div>
    );
  } else {
    return <p>No current stock data to display.</p>;
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
              <Card.Body onClick={() => handleSelectStock(stock)}>
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
                <>
                <Button variant="primary" onClick={() => handleFetchCurrentStockData(selectedStock.ticker)}>Load Current Data</Button>
                {renderCurrentStockData()}
              </>
              )}

              {/* Button to load and display historical stock data */}
              {selectedStock && (
                <>
                  <Button onClick={() => handleFetchHistoricalStockData(selectedStock.ticker)}>Load Historical Data</Button>
                  {renderHistoricalDataTable()}
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