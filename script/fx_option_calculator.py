import numpy as np
from scipy.stats import norm
from web3 import Web3
import os
from dotenv import load_dotenv

# Load environment variables (RPC URL and Private Key)
load_dotenv()
RPC_URL = os.getenv("RPC_URL")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")

# Initialize Web3
w3 = Web3(Web3.HTTPProvider(RPC_URL))
contract_address = "0xYourSmartContractAddress"
buyer_address = "0xYourBuyerAddress"

# Option Pricing Function
def fx_vanilla_option_price(S0, K, T, rd, rf, sigma, option_type="call"):
    d1 = (np.log(S0 / K) + (rd - rf + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)

    if option_type.lower() == "call":
        price = S0 * np.exp(-rf * T) * norm.cdf(d1) - K * np.exp(-rd * T) * norm.cdf(d2)
    elif option_type.lower() == "put":
        price = K * np.exp(-rd * T) * norm.cdf(-d2) - S0 * np.exp(-rf * T) * norm.cdf(-d1)
    else:
        raise ValueError("Invalid option type. Use 'call' or 'put'.")

    return price

# Smart Contract Interaction (Buy Option)
def buy_option(option_type, price):
    contract_abi = [...]  # Replace with actual ABI
    contract = w3.eth.contract(address=contract_address, abi=contract_abi)

    tx = contract.functions.buyOption(option_type, int(price * 10**18)).build_transaction({
        'from': w3.eth.account.privateKeyToAccount(PRIVATE_KEY).address,
        'gas': 2000000,
        'gasPrice': w3.to_wei('2', 'gwei'),
        'nonce': w3.eth.get_transaction_count(w3.eth.account.privateKeyToAccount(PRIVATE_KEY).address),
        'value': w3.to_wei(price, 'ether')  # Sending price in FLR
    })

    signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)

    print(f"Transaction sent! Hash: {w3.to_hex(tx_hash)}")

# Example Usage
S0 = 1.20  # Spot exchange rate
K = 1.25   # Strike price
T = 0.5    # Time to expiration (6 months)
rd = 0.02  # Domestic risk-free rate (2%)
rf = 0.015 # Foreign risk-free rate (1.5%)
sigma = 0.10  # Volatility (10%)

call_price = fx_vanilla_option_price(S0, K, T, rd, rf, sigma, "call")
put_price = fx_vanilla_option_price(S0, K, T, rd, rf, sigma, "put")

print(f"FX Call Option Price: {call_price:.4f}")
print(f"FX Put Option Price: {put_price:.4f}")

# Purchase Option on Flare Blockchain
buy_option("call", call_price)
