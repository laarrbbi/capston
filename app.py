


from flask import Flask, jsonify, request
import json
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app) 

API_KEY = 'RH90QYBSBNKSR7XG'  # Replace with your actual API key



# Endpoint to get the user's portfolio
@app.route('/portfolio', methods=['GET'])
def get_portfolio():
    with open('portfolio.json', 'r') as file:
        portfolio = json.load(file)
    return jsonify(portfolio)

# Endpoint to get current stock data
@app.route('/stock/current', methods=['GET'])
def get_current_stock_data():
    symbol = request.args.get('symbol')
    url = f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={API_KEY}'
    response = requests.get(url)
    data = response.json()
    return jsonify(data)

# Endpoint to get historical stock data
@app.route('/stock/history', methods=['GET'])
def get_historical_stock_data():
    symbol = request.args.get('symbol')
    url = f'https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol={symbol}&apikey={API_KEY}'
    response = requests.get(url)
    data = response.json()
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
