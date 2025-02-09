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
CONTRACT_ADDRESS = "0xf8Be4dcdB62F9546A370720939a2829B25DB1100"

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

        # Calculate the option premium
        premium = calculate_option_premium(S0, K, T, rd, rf, sigma, option_type)
        print('premium is ', premium)
        if premium is None:
            return jsonify({"error": "Failed to calculate option premium"}), 500

        # Store the premium on Flare blockchain
        txn_hash = store_premium_on_blockchain(S0, K, T, rd, rf, sigma, premium)
        if txn_hash is None:
            return jsonify({"error": "Failed to store premium on blockchain"}), 500

        return jsonify({"premium": premium, "transaction_hash": txn_hash}), 200

    except Exception as e:
        import traceback
        print("Error in /calculate-premium:", traceback.format_exc())  # Print full traceback
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
