rest to get to datbase 
https://gf74a8e510de816-c4zvs2bficy4lcyp.adb.eu-frankfurt-1.oraclecloudapps.com/ords/


password - Mcsbt-integration2024



prompt to adapat the backedn to the frontend:
---------------------------------------------------------------------

considering out backend :
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

# Oracle ADW REST API configuration
oracle_rest_api_base_url = 'https://gf74a8e510de816-c4zvs2bficy4lcyp.adb.eu-frankfurt-1.oraclecloudapps.com/ords/'
oracle_admin_username = 'ADMIN'  # It's recommended to use environment variables or a vault service to handle credentials
oracle_admin_password = 'Mcsbt-integration2024'

# Alpha Vantage API key
alpha_vantage_api_key = 'RH90QYBSBNKSR7XG'

@app.route('/search/stocks', methods=['GET'])
def search_stocks():
    query = request.args.get('query')
    url = f'https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords={query}&apikey={alpha_vantage_api_key}'
    response = requests.get(url)
    data = response.json()
    search_results = data.get('bestMatches', [])
    return jsonify(search_results)

# Define additional endpoints using Oracle ADW REST API

@app.route('/portfolio', methods=['GET'])
def get_portfolio():
    # Endpoint to get the user's portfolio
    # You need to replace 'your_portfolio_endpoint' with the actual REST endpoint for your portfolio
    response = requests.get(
        f"{oracle_rest_api_base_url}your_portfolio_endpoint",
        auth=(oracle_admin_username, oracle_admin_password)
    )
    portfolio = response.json()
    return jsonify(portfolio)

@app.route('/portfolio/add', methods=['POST'])
def add_portfolio():
    # Endpoint to add a stock to the user's portfolio
    # You need to replace 'your_portfolio_add_endpoint' with the actual REST endpoint to add a portfolio
    new_portfolio = request.json
    response = requests.post(
        f"{oracle_rest_api_base_url}your_portfolio_add_endpoint",
        json=new_portfolio,
        auth=(oracle_admin_username, oracle_admin_password)
    )
    return jsonify(response.json())

@app.route('/portfolio/<int:portfolio_id>/add_stock', methods=['POST'])
def add_stock_to_portfolio(portfolio_id):
    # Endpoint to add a stock to a specific portfolio
    # You need to replace 'your_portfolio_add_stock_endpoint' with the actual REST endpoint to add a stock to a portfolio
    new_stock = request.json
    response = requests.post(
        f"{oracle_rest_api_base_url}your_portfolio_add_stock_endpoint/{portfolio_id}",
        json=new_stock,
        auth=(oracle_admin_username, oracle_admin_password)
    )
    return jsonify(response.json())

@app.route('/stock/current', methods=['GET'])
def get_current_stock_data():
    # Endpoint to get current stock data
    symbol = request.args.get('symbol')
    url = f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={alpha_vantage_api_key}'
    response = requests.get(url)
    current_data = response.json()
    return jsonify(current_data)

@app.route('/stock/history', methods=['GET'])
def get_historical_stock_data():
    # Endpoint to get historical stock data
    symbol = request.args.get('symbol')
    url = f'https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol={symbol}&apikey={alpha_vantage_api_key}'
    response = requests.get(url)
    historical_data = response.json()
    return jsonify(historical_data)

# Run the Flask application
if __name__ == '__main__':
    app.run(debug=True)

"""
change it to handle the new singup, the new login code, and all the other api calls form portfoliolist, searchandaddstock, stockdetails, app componenets and all the othe front end files that we use.

--------------------------------------