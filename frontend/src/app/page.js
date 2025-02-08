
"use client";
import { useEffect, useState } from "react";
import PriceFetcher from "./components/PriceFetcher";
import OptionCalculator from "./components/OptionCalculator";
import { fetchFlrUsdPrice } from "./utils/flareSpotPriceContract";

export default function Home() {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to fetch price
  const loadPrice = async () => {
    setLoading(true);
    try {
      const fetchedPrice = await fetchFlrUsdPrice();
      console.log("Fetched price:", fetchedPrice);
      setPrice(fetchedPrice);
    } catch (error) {
      console.error("Error fetching price:", error);
      setPrice(null);
    } finally {
      setLoading(false);
    }
  };

  // Load price on mount
  useEffect(() => {
    loadPrice();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
      <h1 className="text-4xl font-extrabold text-white mb-8 sm:text-5xl md:text-6xl lg:text-7xl">Flare Network Price Tracker</h1>
      
      {/* Pass price & loadPrice to both components */}
      <PriceFetcher price={price} loadPrice={loadPrice} />
      <OptionCalculator spotPrice={price} />
    </div>
  );
}
