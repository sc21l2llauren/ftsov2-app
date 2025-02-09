from flask import Flask, request, jsonify
from flask_cors import CORS
from volatilityUtils import get_volatility_data
from contractUtils import calculate_option_premium, store_premium_on_blockchain

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

@app.route('/get-premium', methods=['GET'])
def get_premium():
    """ API endpoint to get option premium data """
    try:
        print((request.args), 'hellooooooo')

        S0 = float(request.args.get("S0", 0))
        K = float(request.args.get("K", 0))
        T = float(request.args.get("T", 0))
        rd = float(request.args.get("rd", 0))
        rf = float(request.args.get("rf", 0))
        sigma = float(request.args.get("sigma", 0))
        option_type = request.args.get("option_type", "call")  # Default to "call"
        amountOfCrypto = float(request.args.get("amountCrypto", 1))  # Default to 1

        # Calculate the option premium
        premium = calculate_option_premium(S0, K, T, rd, rf, sigma, option_type)
        totalPremium = premium * amountOfCrypto
        print('premium is ', premium, 'total premium is ', totalPremium)
        if premium is None:
            return jsonify({"error": "Failed to calculate option premium"}), 500


        return jsonify({"premium": totalPremium}), 200

    except Exception as e:
        import traceback
        print("Error in /get-premium:", traceback.format_exc())  # Print full traceback
        return jsonify({"error": str(e)}), 500

# API Endpoint for frontend to call
@app.route('/publish-premium', methods=['POST'])
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
        print("Error in /publish-premium:", traceback.format_exc())  # Print full traceback
        return jsonify({"error": str(e)}), 500



@app.route('/get_volatility', methods=['GET'])
def get_volatility():
    """ API endpoint to get annualized volatility data """
    return get_volatility_data()

if __name__ == '__main__':
    app.run(debug=True)
