

"use client";

import { useState } from "react";


export default function OptionCalculator({ spotPrice }) {
    const [strikePrice, setStrikePrice] = useState("");
    const [volatility, setVolatility] = useState("");
    const [riskFreeRate, setRiskFreeRate] = useState("");
    const [daysUntilExpiration, setDaysUntilExpiration] = useState("");
  
    return (
      <div className="bg-white p-6 rounded-lg shadow-xl space-y-4 w-full max-w-md">
        <h2 className="text-xl font-bold text-pink-700 mb-4">Options Calculator</h2>
  
        {/* Spot Price (Fetched) */}
      <div className="flex flex-col">
        <label className="text-gray-600">Spot Price (FLR/USD)</label>
        <p className="border border-gray-300 bg-gray-100 rounded-lg p-2 text-lg text-blue-700">
          {spotPrice ? `$${spotPrice}` : "Loading..."}
        </p>
      </div>

      {/* Strike Price Input */}
      <div className="flex flex-col">
        <label className="text-gray-600">Strike Price</label>
        <input
          type="number"
          className="border border-gray-300 rounded-lg p-2 text-gray-500"
          placeholder="Enter Strike Price"
          value={strikePrice}
          onChange={(e) => setStrikePrice(e.target.value)}
        />
      </div>

      {/* Volatility Input */}
      <div className="flex flex-col">
        <label className="text-gray-600">Volatility (%)</label>
        <input
          type="number"
          className="border border-gray-300 rounded-lg p-2 text-gray-500"
          placeholder="Enter Volatility"
          value={volatility}
          onChange={(e) => setVolatility(e.target.value)}
        />
      </div>

      {/* Risk-Free Rate Input */}
      <div className="flex flex-col">
        <label className="text-gray-600">Risk-Free Rate (%)</label>
        <input
          type="number"
          className="border border-gray-300 rounded-lg p-2 text-gray-500"
          placeholder="Enter Risk-Free Rate"
          value={riskFreeRate}
          onChange={(e) => setRiskFreeRate(e.target.value)}
        />
      </div>

      {/* Days Until Expiration Input */}
      <div className="flex flex-col">
        <label className="text-gray-600">Days Until Expiration</label>
        <input
          type="number"
          className="border border-gray-300 rounded-lg p-2 text-gray-500"
          placeholder="Enter Days Until Expiration"
          value={daysUntilExpiration}
          onChange={(e) => setDaysUntilExpiration(e.target.value)}
        />
      </div>

        Calculate Button
      <button
        className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg mt-4 hover:bg-pink-700 transition-colors"
      >
        Calculate Option Price
      </button>
      </div>
      
    );
  }
  