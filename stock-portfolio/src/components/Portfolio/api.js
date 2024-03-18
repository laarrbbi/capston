import axios from 'axios';
axios.defaults.withCredentials = true;

const BASE_URL = 'http://127.0.0.1:5000'; // Update with the actual URL of your backend

export const fetchPortfolio = () => axios.get(`${BASE_URL}/portfolio`, { withCredentials: true });
export const addStockToPortfolio = (stock) => {
  return axios.post(`${BASE_URL}/portfolio/add`, stock, {
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  });
};

export const fetchCurrentStockData = async (symbol) => {
  try {
    const response = await axios.get(`${BASE_URL}/stock/current`, {
      params: { symbol }
    });
    return response.data['Global Quote']; // Assuming 'Global Quote' is the desired data
  } catch (error) {
    console.error('Error fetching current stock data:', error);
    throw error;
  }
};

export const fetchHistoricalStockData = async (symbol) => {
  try {
    const response = await axios.get(`${BASE_URL}/stock/history`, {
      params: { symbol }
    });
    return response.data['Monthly Time Series']; // Assuming 'Monthly Time Series' is the desired data
  } catch (error) {
    console.error('Error fetching historical stock data:', error);
    throw error;
  }
};

export const deleteStockFromPortfolio = (stockId) => axios.delete(`${BASE_URL}/portfolio/remove/${stockId}`, { withCredentials: true });

export const updateStockInPortfolio = async (stockId, quantity) => {
    try {
      const response = await axios.put(`${BASE_URL}/portfolio/update/${stockId}`, { quantity }, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  };

export const searchStocks = (query) => {
  return axios.get(`${BASE_URL}/search/stocks`, {
    params: { query },
      withCredentials: true});
  };
  
