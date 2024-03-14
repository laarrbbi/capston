from flask import Flask, jsonify, request, make_response, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
import requests
import os
import oracledb
from sqlalchemy.pool import NullPool
#import oracledb

app = Flask(__name__)
CORS(app)


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
    
    def __repr__(self):
        return f'<Stock {self.ticker}>'



# Alpha Vantage API key
alpha_vantage_api_key = 'RH90QYBSBNKSR7XG'


users = {
    "admin": {"username": "admin", "password": "admin"}
}

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
    url = f'https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords={query}&apikey={alpha_vantage_api_key}'
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return jsonify(data.get('bestMatches', []))
    else:
        return make_response("Error accessing Alphavantage API", response.status_code)




@app.route('/portfolio', methods=['GET'])
def get_portfolio():
    user_id = session.get('user_id')
    if not user_id:
        return make_response("Unauthorized", 401)
    
    user = Users.query.get(user_id)
    if not user:
        return make_response("User not found", 404)
    
    portfolio_data = [
        {
            'ticker': stock.ticker,
            'quantity': stock.quantity
        } for stock in user.stocks  # Remove .all() as it's for dynamic relationship
    ]
    
    return jsonify(portfolio_data)
    



@app.route('/portfolio/add', methods=['POST'])
def add_stock_to_portfolio():
    user_id = session.get('user_id')
    if not user_id:
        return make_response("Unauthorized", 401)
    
    stock_data = request.json
    user = Users.query.get(user_id)
    if not user:
        return make_response("User not found", 404)
    
    # Check if the stock is already in the portfolio to update the quantity instead of adding a new entry
    existing_stock = Stock.query.filter_by(user_id=user_id, ticker=stock_data['ticker']).first()
    if existing_stock:
        existing_stock.quantity += stock_data['quantity']
    else:
        new_stock = Stock(
            ticker=stock_data['ticker'],
            quantity=stock_data['quantity'],
            user_id=user_id  # Directly use user_id
        )
        db.session.add(new_stock)
    
    db.session.commit()
    
    return jsonify({'message': 'Stock added to portfolio'})



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



@app.route('/portfolio/remove/<int:stock_id>', methods=['DELETE'])
def remove_stock_from_portfolio(stock_id):
    user_id = session.get('user_id')
    if not user_id:
        return make_response("Unauthorized", 401)

    stock = Stock.query.filter_by(stock_id=stock_id, user_id=user_id).first()  # Corrected indentation and syntax
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
