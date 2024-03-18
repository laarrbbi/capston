from flask import Flask, jsonify, request, make_response, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
import requests
import os
import oracledb
from sqlalchemy.pool import NullPool
from flask.sessions import SecureCookieSessionInterface

#import oracledb

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config['SESSION_COOKIE_SAMESITE'] = 'None'  # or 'None'
app.config['SESSION_COOKIE_SECURE'] = True
app.secret_key = '1234'
app.config['CORS_HEADERS'] = 'Content-Type'




# SQLite configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////Users/m/Desktop/MCSBT/Capston/final_project/backend/mydatabase.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = '1234'  # Required for session management only when local database 

db = SQLAlchemy(app)



class Users(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    stocks = db.relationship('Stock', backref='owner', lazy='dynamic')
    
    def __repr__(self):
        return f'<User {self.user_name}>'

class Stock(db.Model):
    __tablename__ = 'stocks'
    
    stock_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    ticker = db.Column(db.String(10), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    current_price = db.Column(db.Float)
    
    def __repr__(self):
        return f'<Stock {self.ticker}>'



# Alpha Vantage API key
alpha_vantage_api_key = 'RH90QYBSBNKSR7XG'


users = {
    "admin": {"username": "admin", "password": "admin"}
}

session_cookie = SecureCookieSessionInterface().get_signing_serializer(app)

def get_real_time_price(ticker):
    url = f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={ticker}&apikey={alpha_vantage_api_key}'
    try:
        response = requests.get(url)
        response.raise_for_status()  # This will raise an exception for HTTP error codes
        data = response.json()
        # Accessing the price using Alpha Vantage's standard response format
        current_price = float(data["Global Quote"]["05. price"]) if "Global Quote" in data and "05. price" in data["Global Quote"] else None
        return current_price
    except requests.RequestException as e:
        print(f"Request exception occurred: {e}")
        return None




def update_portfolio_value(portfolio_data):
    total_value = sum(stock['quantity'] * get_real_time_price(stock['ticker']) for stock in portfolio_data)
    return total_value


@app.after_request
def cookies(response):
    same_cookie = session_cookie.dumps(dict(session))
    response.headers.add("Set-Cookie", f"my_cookie={same_cookie}; Secure; HttpOnly; SameSite=None; Path=/;")
    return response


@app.route('/login', methods=['POST'])
def login():
    credentials = request.json
    user_name = credentials['username']
    password = credentials['password']
    
    user = Users.query.filter_by(user_name=user_name).first()

    if user and check_password_hash(user.password, password):  # Change password_hash to password
        session['user_id'] = user.user_id  # Change id to user_id
        return jsonify({"message": "Login successful", "user": user_name})
    else:
        return make_response("Invalid credentials", 401)



@app.route('/logout', methods=['GET'])
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "Logout successful"})





@app.route('/search/stocks', methods=['GET'])
def search_stocks():
    query = request.args.get('query')
    if not query:
        return jsonify({"error_code": 400, "message": "No search query provided"}), 400

    url = f"https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords={query}&apikey={alpha_vantage_api_key}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            if data.get("bestMatches"):
                stock_dict = {stock["1. symbol"]: stock["2. name"] for stock in data["bestMatches"]}
                return jsonify(stock_dict)
            else:
                return jsonify({"error_code": 400, "message": "No data available for the requested stock"}), 400
        else:
            raise Exception(f"Error obtaining the information of the stocks, status code: {response.status_code}")
    except Exception as e:
        print(str(e))
        return jsonify({"error_code": 500, "message": "Internal server error"}), 500





@app.route('/portfolio', methods=['GET'])
def get_portfolio():
    
    #if not user_id:
       # return make_response("Unauthorized", 401)
    user_id =  1
    user_id = session.get('user_id')
    user = Users.query.get(user_id)
    if not user:
        return make_response("User not found", 404)
    
    portfolio_data = [
        {   'ticker': stock.ticker,
            'quantity': stock.quantity,
            'currentPrice': get_real_time_price(stock.ticker),  # Fetch the real-time price
            'stock_id': stock.stock_id
        } for stock in user.stocks
    ]
    
    # Calculate total portfolio value
    total_value = update_portfolio_value(portfolio_data)
    
    # Add the total value to the portfolio data
    portfolio_data.append({'portfolio_value': total_value})

    return jsonify(portfolio_data)
    



@app.route('/portfolio/add', methods=['POST'])
def add_stock_to_portfolio():
    user_id = 1
    user_id = session.get('user_id')
    #if not user_id:
       # return jsonify({"error_code": 401, "message": "Unauthorized"}), 401

    stock_data = request.json
    print(stock_data)
    user = Users.query.get(user_id)
    #if not user:
        #return jsonify({"error_code": 404, "message": "User not found"}), 404
    
    # Check if the stock already exists in the portfolio to update the quantity
    existing_stock = Stock.query.filter_by(user_id=user_id, ticker=stock_data['ticker']).first()
    if existing_stock:
        existing_stock.quantity += stock_data['quantity']
        db.session.commit()
        return jsonify({
            'message': f'Quantity of {stock_data["ticker"]} updated.',
            'stock_id': existing_stock.stock_id,
            'ticker': existing_stock.ticker,
            'quantity': existing_stock.quantity,
            'currentPrice': existing_stock.current_price
        }), 200
    else:
        # Fetch the real-time price
        current_price = get_real_time_price(stock_data['ticker'])
        if current_price is None:
            return jsonify({"error_code": 500, "message": "Failed to fetch stock price"}), 500
        
        # Create a new stock entry
        new_stock = Stock(
            ticker=stock_data['ticker'],
            quantity=stock_data['quantity'],
            user_id=user_id,
            current_price=current_price
        )
        db.session.add(new_stock)
        db.session.commit()
        
        return jsonify({
            'message': f'Stock {stock_data["ticker"]} added to portfolio with current price {current_price}.',
            'stock_id': new_stock.stock_id,
            'ticker': new_stock.ticker,
            'quantity': new_stock.quantity,
            'currentPrice': current_price
        }), 200






@app.route('/stock/current', methods=['GET'])
def get_current_stock_data():
    symbol = request.args.get('symbol')
    url = f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={alpha_vantage_api_key}'
    response = requests.get(url)
    data = response.json()
    return jsonify(data.get('Global Quote', {}))



@app.route('/stock/history', methods=['GET'])
def get_historical_stock_data():
    symbol = request.args.get('symbol')
    url = f'https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol={symbol}&apikey={alpha_vantage_api_key}'
    response = requests.get(url)
    data = response.json()
    return jsonify(data.get('Monthly Time Series', {}))



@app.route('/portfolio/update/<int:stock_id>', methods=['PUT'])
def update_stock(stock_id):
    #if 'user_id' not in session:
       # return jsonify({"error_code": 401, "message": "Unauthorized"}), 401
    
    user_id = 1
    user_id = session.get('user_id')
    stock_data = request.json
    stock = Stock.query.filter_by(user_id=user_id, stock_id=stock_id).first()

    if not stock:
        return jsonify({"error_code": 404, "message": "Stock not found"}), 404

    try:
        stock.quantity = stock_data['quantity']
        db.session.commit()
        return jsonify({'message': f'Stock {stock.ticker} quantity updated to {stock.quantity}.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error_code": 500, "message": str(e)}), 500



@app.route('/portfolio/remove/<int:stock_id>', methods=['DELETE'])
def remove_stock_from_portfolio(stock_id):
    user_id = 1
    user_id = session.get('user_id')
    #if not user_id:
     #   return make_response("Unauthorized", 401)

    stock = Stock.query.filter_by(stock_id=stock_id, user_id=user_id).first()
    if not stock:
        return make_response("Stock not found", 404)

    db.session.delete(stock)
    db.session.commit()

    return jsonify({'message': 'Stock removed from portfolio'})



# This should be at the bottom of your file
if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # This will create the database file and tables
    app.run(debug=True)
