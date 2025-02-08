import { useEffect, useState } from "react";

export default function PriceFetcher({ price, loadPrice, selectedCrypto, setSelectedCrypto }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      loadPrice(); // Fetch new price
      setProgress(0); // Reset progress
    }, 2000); // Fetch every 2 seconds

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 5)); // Increment progress
    }, 100); // Fills in 2 seconds

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [loadPrice, selectedCrypto]); // Re-run when selectedCrypto changes

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Price Box with Centered Content */}
      <div className="relative bg-white text-pink-700 font-semibold text-2xl py-2 px-10 rounded-lg shadow-xl mb-3 w-60 flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold text-center">{selectedCrypto} / USD Price:</h2>
        <p className="text-2xl text-blue-600 text-center">{price ? `$${price}` : "Loading..."}</p>

        {/* Small Circular Loader in Top-Right */}
        <div className="absolute top-2 right-2 w-5 h-5">
          <svg className="animate-spin" viewBox="0 0 50 50">
            <circle 
              className="stroke-pink-500" 
              cx="25" cy="25" r="12"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray="75"
              strokeDashoffset={75 - (progress / 100) * 75}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.1s linear" }}
            />
          </svg>
        </div>
      </div>

      {/* Dropdown for selecting cryptocurrency */}
      <select 
        value={selectedCrypto} 
        onChange={(e) => setSelectedCrypto(e.target.value)}
        className="bg-white text-gray-800 py-2 px-4 rounded-lg shadow-md mb-3 border border-gray-300"
      >
        <option value="FLR">FLR/USD</option>
        <option value="BTC">BTC/USD</option>
        <option value="ETH">ETH/USD</option>
      </select>
    </div>
  );
}
