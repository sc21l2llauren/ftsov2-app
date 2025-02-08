"use client"; // Required for Next.js 13+ (useEffect runs only on the client)
import { useEffect, useState } from "react";
import { fetchFlrUsdPrice } from "../utils/flareContract";

export default function PriceFetcher() {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to load price
  const loadPrice = async () => {
    console.log("Loading price...");
    setLoading(true); // Set loading state to true
    try {
      const fetchedPrice = await fetchFlrUsdPrice();
      setPrice(fetchedPrice); // Set the fetched price
    } catch (error) {
      console.error("Error fetching price:", error);
      setPrice(null); // Set price to null if there's an error
    } finally {
      setLoading(false); // Set loading state to false
    }
  };

  // Initial price load
  useEffect(() => {
    loadPrice();
  }, []);

  return (

    <div className="flex flex-col items-center justify-center">
        <div className="bg-white text-pink-700 font-semibold text-2xl py-4 px-8 rounded-lg shadow-xl mb-6">
        <h2 className="text-xl font-semibold">FLR/USD Price:</h2>
        <p className="text-2xl text-blue-600">{price ? `$${price}` : "Loading..."}</p>
        </div>

        <button 
        onClick={loadPrice}
        className="bg-pink-600 text-white py-2 px-4 rounded-lg mt-6 hover:bg-pink-700 transition-colors">
        Refresh Price
        </button>
    </div>

    
  );
}
