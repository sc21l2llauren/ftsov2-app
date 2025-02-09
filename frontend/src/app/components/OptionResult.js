"use client";

import { useState } from "react";

export default function OptionResult({ spotPrice, selectedCrypto }) {
  const [strikePrice, setStrikePrice] = useState("");
  const [amountCrypto, setAmountCrypto] = useState("");
  const [optionType, setOptionType] = useState("call");
  const [volatility, setVolatility] = useState("");
  const [riskFreeRate, setRiskFreeRate] = useState("");
  const [daysUntilExpiration, setDaysUntilExpiration] = useState("");
  const [optionPremium, setOptionPremium] = useState(null);
  const [domesticRiskFreeRate, setdomesticRiskFreeRate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    if (!strikePrice || !volatility || !riskFreeRate || !daysUntilExpiration) {
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

        console.log("Request Data:", requestData); // Debugging output

      const response = await fetch("http://127.0.0.1:5000/calculate-premium", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

    const premium = parseFloat(data.premium); // Ensure it's a number
    console.log("Received json:", data);
    if (isNaN(premium)) {
        throw new Error("Invalid premium value received.");
    }
    
    // If rounding to 2 decimal places results in 0.00, use 20 decimal places
    const formattedPremium = premium.toFixed(2) === "0.00" ? premium.toFixed(6) : premium.toFixed(2);
    
    console.log("Formatted Premium:", formattedPremium);
    setOptionPremium(formattedPremium);
    } catch (error) {
      console.error("Error calculating option price:", error);
    }

    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl space-y-4 w-full max-w-md">
      <h2 className="text-xl font-bold text-pink-700 mb-4">Options Calculator</h2>

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
        />
      </div>

      {/* Number of (Crypto) */}
      <div className="flex flex-col">
            <label className="text-gray-600">Number of ({selectedCrypto})</label>
            <input
                type="number"
                className="border border-gray-300 rounded-lg p-2 text-gray-500"
                value={amountCrypto}
                onChange={(e) => setAmountCrypto(e.target.value)}
            />
        </div>

      {/* Option Type */}
      <div className="flex flex-col">
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

      {/* Volatility */}
      <div className="flex flex-col">
        <label className="text-gray-600">Volatility (%)</label>
        <input
          type="number"
          className="border border-gray-300 rounded-lg p-2 text-gray-500"
          value={volatility}
          onChange={(e) => setVolatility(e.target.value)}
        />
      </div>

      {/* Risk-Free Rate */}
      <div className="flex flex-col">
        <label className="text-gray-600">Risk-Free Rate (%)</label>
        <input
          type="number"
          className="border border-gray-300 rounded-lg p-2 text-gray-500"
          value={riskFreeRate}
          onChange={(e) => setRiskFreeRate(e.target.value)}
        />
      </div>

        {/* Domestic Risk-Free Rate */}
        <div className="flex flex-col">
            <label className="text-gray-600">Domestic Risk-Free Rate (%)</label>
            <input
                type="number"
                className="border border-gray-300 rounded-lg p-2 text-gray-500"
                value={domesticRiskFreeRate}
                onChange={(e) => setdomesticRiskFreeRate(e.target.value)}
            />
        </div>

      {/* Days Until Expiration */}
      <div className="flex flex-col">
        <label className="text-gray-600">Days Until Expiration</label>
        <input
          type="number"
          className="border border-gray-300 rounded-lg p-2 text-gray-500"
          value={daysUntilExpiration}
          onChange={(e) => setDaysUntilExpiration(e.target.value)}
        />
      </div>

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg mt-4 hover:bg-pink-700 transition-colors"
      >
        {loading ? "Calculating..." : "Calculate Option Price"}
      </button>

      {/* Display Premium */}
      {optionPremium !== null && (
        <div className="text-lg text-green-600 font-semibold mt-4">
          Option Premium: ${optionPremium}
        </div>
      )}
    </div>
  );
}
