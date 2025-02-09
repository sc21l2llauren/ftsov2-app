from flask import Flask, request, jsonify
import numpy as np
from scipy.stats import norm
from web3 import Web3
import json
import os
from dotenv import load_dotenv
from flask_cors import CORS

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Load environment variables
load_dotenv()
RPC_URL = os.getenv("RPC_URL")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
CONTRACT_ADDRESS = "0xF07afA6C0b1eDa1486257e8214cB757f3e06b697"

# Check if environment variables are properly loaded
if not RPC_URL or not PRIVATE_KEY:
    raise ValueError("Missing RPC_URL or PRIVATE_KEY in environment variables.")

# Initialize Web3
w3 = Web3(Web3.HTTPProvider(RPC_URL))
account = w3.eth.account.from_key(PRIVATE_KEY)

# Load the ABI
script_dir = os.path.dirname(os.path.abspath(__file__))
abi_path = os.path.join(script_dir, "contract_abi.json")

if not os.path.exists(abi_path):
    raise FileNotFoundError(f"Error: ABI file not found at {abi_path}")

with open(abi_path, "r") as file:
    contract_abi = json.load(file)

print("ABI Loaded Successfully")

# Initialize Contract
contract = w3.eth.contract(address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=contract_abi)


# Black-Scholes Option Pricing Function
def calculate_option_premium(S0, K, T, rd, rf, sigma, option_type="call"):
    try:
        d1 = (np.log(S0 / K) + (rd - rf + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
        d2 = d1 - sigma * np.sqrt(T)

        if option_type == "call":
            price = S0 * np.exp(-rf * T) * norm.cdf(d1) - K * np.exp(-rd * T) * norm.cdf(d2)
        else:  # Put option
            price = K * np.exp(-rd * T) * norm.cdf(-d2) - S0 * np.exp(-rf * T) * norm.cdf(-d1)

        return price
    except Exception as e:
        print(f"Error calculating premium: {e}")
        return None


# Store Premium on Flare Blockchain
def store_premium_on_blockchain(S0, K, T, rd, rf, sigma, premium):
    try:
        txn = contract.functions.storeOptionPremium(
            int(S0 * 10**18),
            int(K * 10**18),
            int(T * 10**18),
            int(rd * 10**18),
            int(rf * 10**18),
            int(sigma * 10**18),
            int(premium * 10**18)
        ).build_transaction({
            'from': account.address,
            'gas': 2000000,
            'gasPrice': w3.to_wei('30', 'gwei'),
            'nonce': w3.eth.get_transaction_count(account.address)
        })

        signed_txn = w3.eth.account.sign_transaction(txn, PRIVATE_KEY)
        txn_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)

        return txn_hash.hex()
    except Exception as e:
        print(f"Error storing premium on blockchain: {e}")
        return None


# API Endpoint for frontend to call
@app.route('/calculate-premium', methods=['POST'])
def calculate_premium():
    try:
        data = request.json
        print("Data received:", data)
        S0 = float(data["S0"])
        K = float(data["K"])
        T = float(data["T"])
        rd = float(data["rd"])
        rf = float(data["rf"])
        sigma = float(data["sigma"])
        option_type = data.get("option_type", "call")  # Default to "call"
        amountOfCrypto = float(data["amountCrypto"])

        # Calculate the option premium
        premium = calculate_option_premium(S0, K, T, rd, rf, sigma, option_type)
        totalPremium = premium * amountOfCrypto
        print('premium is ', premium, 'total premium is ', totalPremium)
        if premium is None:
            return jsonify({"error": "Failed to calculate option premium"}), 500

        # Store the premium on Flare blockchain
        txn_hash = store_premium_on_blockchain(S0, K, T, rd, rf, sigma, totalPremium)
        if txn_hash is None:
            return jsonify({"error": "Failed to store premium on blockchain"}), 500

        return jsonify({"premium": totalPremium, "transaction_hash": txn_hash}), 200

    except Exception as e:
        import traceback
        print("Error in /calculate-premium:", traceback.format_exc())  # Print full traceback
        return jsonify({"error": str(e)}), 500

## volatility calculation
# 1. Import necessary modules (if not already imported)
import requests
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# Your existing imports
from flask import Flask, jsonify

# 2. Add the necessary functions (from the previous code)
COINGECKO_API_URL = "https://api.coingecko.com/api/v3/coins/{}/market_chart?vs_currency=usd&days=365"
KRAKEN_API_URL = "https://api.kraken.com/0/public/OHLC"
COINGECKO_CRYPTO_IDS = {"BTC": "bitcoin", "ETH": "ethereum"}
volatility_dict = {}

# Default values for volatility if API calls fail
DEFAULT_VOLATILITIES = {"BTC/USD": 0.4297, "ETH/USD": 0.5421, "FLR/USD": 0.7774}


def fetch_historical_prices_coingecko(crypto_id):
    """ Fetch historical prices for BTC/USD and ETH/USD using CoinGecko """
    try:
        response = requests.get(COINGECKO_API_URL.format(crypto_id))
        data = response.json()
        
        prices = [{"timestamp": datetime.utcfromtimestamp(item[0] / 1000), "price": item[1]} for item in data["prices"]]
        return prices
    except Exception as e:
        print(f"Error fetching {crypto_id} historical data: {e}")
        return []

def fetch_historical_prices_kraken(pair):
    """ Fetch FLR/USD historical prices using Kraken """
    since = int((datetime.now() - timedelta(days=365)).timestamp())
    params = {"pair": pair, "interval": 1440, "since": since}
    try:
        response = requests.get(KRAKEN_API_URL, params=params)
        data = response.json()
        
        if data['error']:
            raise Exception(f"Kraken API Error: {data['error']}")
        
        prices = [{"timestamp": datetime.utcfromtimestamp(item[0]), "price": float(item[4])} for item in data['result'][pair]]
        return prices
    except Exception as e:
        print(f"Error fetching FLR/USD historical data: {e}")
        return []

def analyze_volatility(price_data, crypto_name):
    """ Analyze historical volatility based on price data """
    df = pd.DataFrame(price_data)
    
    if df.empty:
        print(f"Using default volatility for {crypto_name}/USD: {DEFAULT_VOLATILITIES[crypto_name+'/USD']}")
        volatility_dict[f"{crypto_name}/USD"] = DEFAULT_VOLATILITIES[f"{crypto_name}/USD"]
        return
    
    df["returns"] = np.log(df["price"] / df["price"].shift(1))
    df = df.dropna()  # Remove NaN values from returns

    # Compute daily volatility (standard deviation of log returns)
    daily_volatility = df["returns"].std()

    # Annualized volatility using sqrt of trading days (assumed 252 trading days per year)
    annual_volatility = daily_volatility * np.sqrt(252)
    
    volatility_dict[f"{crypto_name}/USD"] = annual_volatility

def get_volatility_data():
    """ Function to fetch and return volatility data """
    for symbol, crypto_id in COINGECKO_CRYPTO_IDS.items():
        price_data = fetch_historical_prices_coingecko(crypto_id)
        analyze_volatility(price_data, symbol)
    
    # Fetch and analyze FLR/USD using Kraken API
    price_data_flr = fetch_historical_prices_kraken("FLRUSD")
    analyze_volatility(price_data_flr, "FLR")
    
    return jsonify(volatility_dict)

# 3. Add the route for the new API endpoint
@app.route('/get_volatility', methods=['GET'])
def get_volatility():
    """ API endpoint to get annualized volatility data """
    return get_volatility_data()

# 4. Ensure your app is running (if not already)
if __name__ == '__main__':
    app.run(debug=True)
