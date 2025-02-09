
"use client";
import { useEffect, useState } from "react";
import PriceFetcher from "./components/PriceFetcher";
import OptionCalculator from "./components/OptionCalculator";
import { main } from "./utils/allSpotPriceContract";
import OptionResult from "./components/OptionResult.js";
import getVolatility from "./utils/getVolatility";


export default function Home() {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState("FLR"); // Default selection

  // Function to fetch price
  const loadPrice = async () => {
    setLoading(true);
    try {
      const fetchedPrices = await main(); // Fetch all prices
      //console.log("Fetched Prices:", fetchedPrices); // Debugging output
  
      if (!fetchedPrices || !Array.isArray(fetchedPrices)) {
        console.error("Error: main() did not return an array of prices.");
        setPrice(null);
        return;
      }
  
      const cryptoPrices = {
        FLR: fetchedPrices[0] ?? null, // Ensure safe access
        BTC: fetchedPrices[1] ?? null,
        ETH: fetchedPrices[2] ?? null,
      };
  
      setPrice(cryptoPrices[selectedCrypto]); // Set price based on selected crypto
    } catch (error) {
      console.error("Error fetching price:", error);
      setPrice(null);
    } finally {
      setLoading(false);
    }
  };

  // Load price on mount & when crypto changes
  useEffect(() => {
    loadPrice();
  }, [selectedCrypto]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
      <h1 className="text-4xl font-extrabold text-white mb-8 sm:text-5xl md:text-6xl lg:text-7xl">Flare Network Price Tracker</h1>
      
      <PriceFetcher 
        price={price} 
        loadPrice={loadPrice} 
        selectedCrypto={selectedCrypto} 
        setSelectedCrypto={setSelectedCrypto} 
      />
      
      <OptionResult spotPrice={price} selectedCrypto={selectedCrypto}  />
    </div>
  );
}