import numpy as np
from scipy.stats import norm
from web3 import Web3
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
RPC_URL = os.getenv("RPC_URL")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
#CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
CONTRACT_ADDRESS = "0xf8Be4dcdB62F9546A370720939a2829B25DB1100"
# Initialize Web3
w3 = Web3(Web3.HTTPProvider(RPC_URL))
account = w3.eth.account.from_key(PRIVATE_KEY)

# Check if CONTRACT_ADDRESS is set and valid
if not CONTRACT_ADDRESS or not Web3.is_address(CONTRACT_ADDRESS):
    raise ValueError(f"Invalid or missing contract address: {CONTRACT_ADDRESS}")

# Get the absolute path of the script directory
script_dir = os.path.dirname(os.path.abspath(__file__))
abi_path = os.path.join(script_dir, "contract_abi.json")

# Load the ABI
try:
    with open(abi_path, "r") as file:
        contract_abi = json.load(file)
    print("ABI Loaded Successfully")
except FileNotFoundError:
    print(f"Error: ABI file not found at {abi_path}")
    exit(1)
# Load the Contract ABI
#with open("contract_abi.json", "r") as file:
 #   contract_abi = json.load(file)

# Ensure contract address is formatted correctly
contract = w3.eth.contract(address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=contract_abi)
#contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=contract_abi)

# Black-Scholes Option Pricing Function
def calculate_option_premium(S0, K, T, rd, rf, sigma, option_type="call"):
    d1 = (np.log(S0 / K) + (rd - rf + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)

    if option_type == "call":
        price = S0 * np.exp(-rf * T) * norm.cdf(d1) - K * np.exp(-rd * T) * norm.cdf(d2)
    else:  # Put option
        price = K * np.exp(-rd * T) * norm.cdf(-d2) - S0 * np.exp(-rf * T) * norm.cdf(-d1)

    return price

# Store Premium on Flare Blockchain
def store_premium_on_blockchain(S0, K, T, rd, rf, sigma, premium):
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

    print(f"Transaction Sent! Tx Hash: {txn_hash.hex()}")
    return txn_hash.hex()

# Example Usage
S0 = 1000  # Spot exchange rate
K = 1.25   # Strike price
T = 0.5    # Time to expiration (6 months)
rd = 0.02  # Domestic risk-free rate (2%)
rf = 0.015 # Foreign risk-free rate (1.5%)
sigma = 0.10  # Volatility (10%)

premium = calculate_option_premium(S0, K, T, rd, rf, sigma, "call")
print(f"Calculated Call Option Premium: {premium:.4f}")

# Store premium on Flare Blockchain
store_premium_on_blockchain(S0, K, T, rd, rf, sigma, premium)
