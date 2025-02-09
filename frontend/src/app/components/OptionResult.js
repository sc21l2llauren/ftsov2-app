"use client";

import { useState, useEffect } from "react";
import getVolatility from "../utils/getVolatility";
import { checkBalance, sendFLRToContract } from "../utils/wallet";

export default function OptionResult({ spotPrice, selectedCrypto }) {
  const [strikePrice, setStrikePrice] = useState("");
  const [amountCrypto, setAmountCrypto] = useState("");
  const [optionType, setOptionType] = useState("call");
  const [volatility, setVolatility] = useState("");
  const [riskFreeRate, setRiskFreeRate] = useState(0);
  const [daysUntilExpiration, setDaysUntilExpiration] = useState("");
  const [optionPremium, setOptionPremium] = useState(null);
  const [domesticRiskFreeRate, setDomesticRiskFreeRate] = useState(0.0283);
  const [loading, setLoading] = useState(false);
  const [transaction_hash, setTransactionHash] = useState(false);
  const [savedPremium, setSavedPremium] = useState(null);


  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
   let data = 0;


  const closeModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    async function fetchVolatility() {
        try {
            const volatilityData = await getVolatility(); // Fetch all data

            if (volatilityData && selectedCrypto) {
                const key = `${selectedCrypto}/USD`; // Construct key
                const selectedVolatility = volatilityData[key];

                if (selectedVolatility !== undefined) {
                    const formattedVolatility = (parseFloat(selectedVolatility) * 100).toFixed(2);
                    console.log(`Volatility for ${selectedCrypto}: ${formattedVolatility}%`);
                    setVolatility(formattedVolatility);
                } else {
                    console.warn(`No data found for ${selectedCrypto}`);
                    setVolatility(null);
                }
            }
        } catch (error) {
            console.error("Error fetching volatility:", error);
            setVolatility(null);
        }
    }

    // Run initially
    fetchVolatility();

    // Refresh every 5 seconds
    const interval = setInterval(fetchVolatility, 5000);

    return () => clearInterval(interval); // Cleanup on unmount
}, [selectedCrypto]); // Re-run if `selectedCrypto` changes



  useEffect(() => {
    // Reset the values whenever `selectedCrypto` changes
    setStrikePrice("");
    setAmountCrypto("");
    setOptionType("call");
    setVolatility("");
    setRiskFreeRate("");
    setDaysUntilExpiration("");
    setOptionPremium(null);
    setDomesticRiskFreeRate("");
    setLoading(false);
    setShowModal(false);
  }, [selectedCrypto]); // Trigger when selectedCrypto changes

  const handleCalculate = async () => {
    if (!spotPrice || !strikePrice || !daysUntilExpiration || !volatility || !amountCrypto) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    
    const requestData = {
      S0: parseFloat(spotPrice),  // Ensure numerical values are correctly formatted
      amountCrypto: parseFloat(amountCrypto),
      K: parseFloat(strikePrice),
      rd: parseFloat(domesticRiskFreeRate/100),
      rf: parseFloat(riskFreeRate/100),
      sigma: parseFloat(volatility/100),
      T: parseFloat(daysUntilExpiration),
      option_type: optionType || "call" // Default to "call" if undefined
    };

    try {
      const response = await fetch("https://opt-chain.onrender.com/publish-premium", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

    data = await response.json();

      const premium = parseFloat(data.premium); // Ensure it's a number
      console.log("Received json:", data);

      if (isNaN(premium)) {
        throw new Error("Invalid premium value received.");
      }


      
      // If rounding to 2 decimal places results in 0.00, use 20 decimal places
      const formattedPremium = premium.toFixed(2) === "0.00" ? premium.toFixed(6) : premium.toFixed(2);
      setSavedPremium(formattedPremium);


      console.log("Formatted Premium:", formattedPremium);
      setOptionPremium(premium);

        // Check if wallet has enough balance
        console.log(await checkBalance(premium, spotPrice), "check balance");

        if (!(await checkBalance(premium, spotPrice))) {
            throw new Error("Insufficient funds. Please top up your wallet.");
        }
        else{
            sendFLRToContract(premium);
            setModalMessage(`Option Premium: $${formattedPremium} \nTransaction Hashss: ${data.transaction_hash}`);
            setTransactionHash(data.transaction_hash);
            setIsSuccess(true);
            setShowModal(true);
        }

      // Show success modal with premium and hash
      
    } catch (error) {
      console.error("Error calculating option price:", error);

      // Show failure modal with error message
      setModalMessage(`${error.message || "Something went wrong. Please try again."}`);
      setIsSuccess(false);
      setShowModal(true);
    }

    setLoading(false);
  };
  
  const getPremium = async () => {

    if (
      !spotPrice || !strikePrice || !daysUntilExpiration || !volatility || !amountCrypto
    ) {
      console.warn("Missing or invalid input values. Skipping API call.");
      return;
    }

    const requestData = {
      S0: parseFloat(spotPrice),  // Ensure numerical values are correctly formatted
      amountCrypto: parseFloat(amountCrypto),
      K: parseFloat(strikePrice),
      rd: parseFloat(domesticRiskFreeRate/100),
      rf: parseFloat(riskFreeRate/100),
      sigma: parseFloat(volatility/100),
      T: parseFloat(daysUntilExpiration),
      option_type: optionType || "Call" // Default to "call" if undefined
    };

    // Construct the query string from requestData
    const queryString = new URLSearchParams(requestData).toString();

    // Send a GET request with query parameters
    try {
      const response = await fetch(`https://opt-chain.onrender.com/get-premium?${queryString}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });

      data = await response.json();
      console.log(data, "data");

      const premium = parseFloat(data.premium); // Ensure it's a number
      console.log("Received json:", data);
      setOptionPremium(premium);

      if (isNaN(premium)) {
        throw new Error("Invalid premium value received.");
      }
    } catch (error) {
      console.error("Error calculating option price:", error);
    }
  };

  useEffect(() => {
    
    getPremium();

  },[spotPrice, selectedCrypto, strikePrice, amountCrypto, optionType, volatility, daysUntilExpiration]);


  return (
    <div className="bg-white p-6 rounded-lg shadow-xl space-y-4 w-full max-w-md">
      <h2 className="text-xl font-bold text-pink-700 mb-4 text-center">Options Calculator</h2>

      {/* Spot Price */}
      <div className="flex flex-col">
        <label className="text-gray-600">Spot Price ({selectedCrypto}/USD)</label>
        <p className="border border-gray-300 bg-gray-100 rounded-lg p-2 text-lg text-blue-700">
          {spotPrice ? `$${spotPrice}` : "Loading..."}
        </p>
      </div>

      {/* Strike Price */}
      <div className="flex flex-col">
        <label className="text-gray-600">Strike Price</label>
        <input
          type="number"
          className="border border-gray-300 rounded-lg p-2 text-gray-500"
          value={strikePrice}
          onChange={(e) => setStrikePrice(e.target.value)}
          min={0.000000000000000000000000000000000000001}
        />
      </div>
      
      <div className="flex space-x-4">
        {/* Number of (Crypto) */}
        <div className="flex flex-col w-1/2">
            <label className="text-gray-600">Number of ({selectedCrypto})</label>
            <input
            type="number"
            className="border border-gray-300 rounded-lg p-2 text-gray-500"
            value={amountCrypto}
            onChange={(e) => setAmountCrypto(e.target.value)}
            min={0.000001}
            />
        </div>

        {/* Option Type */}
        <div className="flex flex-col w-1/2">
            <label className="text-gray-600">Option Type</label>
            <select
            className="border border-gray-300 rounded-lg p-2 text-gray-500"
            value={optionType}
            onChange={(e) => setOptionType(e.target.value)}
            >
            <option value="call">Call</option>
            <option value="put">Put</option>
            </select>
        </div>
      </div>

      {/* Volatility and Risk-Free Rate (Percentage Inputs in Same Row) */}
      <div className="flex space-x-4">
        {/* Volatility */}
        <div className="flex flex-col w-1/2">
          <label className="text-gray-600">Volatility (%)</label>
          <p className="border border-gray-300 bg-gray-100 rounded-lg p-2 text-lg text-blue-700">
          {volatility ? `${volatility}` : "Loading..."}
          </p>
        </div>

      {/* Days Until Expiration */}
      <div className="flex flex-col w-1/2">
        <label className="text-gray-600">Days Until Expiration</label>
        <input
          type="number"
          className="border border-gray-300 rounded-lg p-2 text-gray-500"
          value={daysUntilExpiration}
          onChange={(e) => setDaysUntilExpiration(e.target.value)}
          min={1}
        />
        </div>
      </div>

      {/* Premium */}
      <div className="flex flex-col">
        <label className="text-gray-600">Premium</label>
        <p className="border border-gray-300 bg-gray-100 rounded-lg p-2 text-lg text-blue-700">
          {optionPremium ? `$${optionPremium}` : "..."}
        </p>
      </div>

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg mt-4 hover:bg-pink-700 transition-colors"
      >
        {loading ? "Calculating..." : "Calculate Option Price"}
      </button>

      {/* Modal */}
      {showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-xl text-center">
      {/* Success/Error Title */}
      <div className={`text-2xl font-bold mb-4 ${isSuccess ? "text-green-600" : "text-red-600"}`}>
        {isSuccess ? "Success!" : ""}
      </div>

      {/* Option Premium and Transaction Hash */}
      <div className="text-lg mb-4">
        {isSuccess ? (
          <div className="text-xl font-semibold text-gray-800">
            Option Premium: <span className="text-blue-600">${savedPremium}</span>
          </div>
        ) : (
          <div className="text-lg font-semibold text-red-600 bg-red-100 border border-red-400 p-3 rounded-lg">
      {modalMessage}
    </div>
        )}
      </div>

      {/* Transaction Hash */}
      {isSuccess && (
        <div className="text-sm text-gray-500 mt-2">
            <span className="font-semibold">Transaction Hash:</span>
            <div className="text-gray-600 mt-1 break-words">{transaction_hash}</div>
            </div>
        )}

      {/* Close Button */}
      <button
        className="mt-6 bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors"
        onClick={() => closeModal()}
      >
        Close
      </button>
    </div>
  </div>
)}
    </div>
  );
}
