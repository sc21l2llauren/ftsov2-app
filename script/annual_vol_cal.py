import requests
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime, timedelta

# CoinGecko API base URL (for BTC/USD & ETH/USD)
COINGECKO_API_URL = "https://api.coingecko.com/api/v3/coins/{}/market_chart?vs_currency=usd&days=365"

# Kraken API base URL (for FLR/USD)
KRAKEN_API_URL = "https://api.kraken.com/0/public/OHLC"

# Cryptocurrency IDs for CoinGecko
COINGECKO_CRYPTO_IDS = {"BTC": "bitcoin", "ETH": "ethereum"}

# Default values for volatility if API calls fail
DEFAULT_VOLATILITIES = {"BTC/USD": 0.4297, "ETH/USD": 0.5421, "FLR/USD": 0.7774}

# Dictionary to store annualized volatility values
volatility_dict = {}

def fetch_historical_prices_coingecko(crypto_id):
    """ Fetch historical prices for BTC/USD and ETH/USD using CoinGecko """
    try:
        response = requests.get(COINGECKO_API_URL.format(crypto_id))
        data = response.json()
        
        # Extract timestamps and prices
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
        
        # Extract timestamps and closing prices
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
    
    # Store volatility in dictionary
    volatility_dict[f"{crypto_name}/USD"] = annual_volatility

    print(f"{crypto_name}/USD Annualized Volatility: {annual_volatility:.4f}")

    # Plot price data
#    plt.figure(figsize=(12, 5))
#    plt.subplot(1, 2, 1)
#    plt.plot(df["timestamp"], df["price"], linestyle="-", label=f"{crypto_name}/USD Price")
#    plt.xlabel("Time")
#    plt.ylabel("Price (USD)")
#    plt.title(f"{crypto_name}/USD Price over Time")
#    plt.legend()

    # Plot returns data
#    plt.subplot(1, 2, 2)
#    plt.plot(df["timestamp"], df["returns"], linestyle="-", label="Log Returns")
#    plt.xlabel("Time")
#    plt.ylabel("Returns")
#    plt.title(f"{crypto_name}/USD Log Returns over Time")
#    plt.legend()

#    plt.show()

def main():
    for symbol, crypto_id in COINGECKO_CRYPTO_IDS.items():
        print(f"Fetching data for {symbol}/USD...")
        price_data = fetch_historical_prices_coingecko(crypto_id)
        analyze_volatility(price_data, symbol)
    
    # Fetch and analyze FLR/USD using Kraken API
    print("Fetching data for FLR/USD...")
    price_data_flr = fetch_historical_prices_kraken("FLRUSD")
    analyze_volatility(price_data_flr, "FLR")
    
    # Print the dictionary of annualized volatilities
    print("\nAnnualized Volatility Dictionary:")
    for pair, volatility in volatility_dict.items():
        print(f"{pair}: {volatility:.4f}")

if __name__ == "__main__":
    main()
