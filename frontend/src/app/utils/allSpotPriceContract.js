import { ethers } from "ethers";

const FTSOV2_ADDRESS = "0x3d893C53D9e8056135C26C8c638B76C8b60Df726";
const RPC_URL = "https://coston2-api.flare.network/ext/C/rpc";
const FEED_IDS = [
  { id: "0x01464c522f55534400000000000000000000000000", name: "FLR/USD" }, // FLR/USD
  { id: "0x014254432f55534400000000000000000000000000", name: "BTC/USD" }, // BTC/USD
  { id: "0x014554482f55534400000000000000000000000000", name: "ETH/USD" }, // ETH/USD
];

const ABI = '[{"inputs":[{"internalType":"bytes21","name":"_feedId","type":"bytes21"}],"name":"getFeedByIdInWei","outputs":[{"internalType":"uint256","name":"_value","type":"uint256"},{"internalType":"uint64","name":"_timestamp","type":"uint64"}],"stateMutability":"payable","type":"function"}]';

async function getPrice(provider, contract, feed) {
  try {
    const [rawPrice, timestamp] = await contract.getFeedByIdInWei.staticCall(feed.id);
    
    const price = Number(rawPrice) / 1e18; // Convert wei to standard format (assuming 18 decimals)
    const formattedPrice = price.toFixed(6); // Adjust decimal places as needed
    const date = new Date(Number(timestamp) * 1000).toISOString();
    return formattedPrice;
    //console.log(`${feed.name}: $${formattedPrice} (Timestamp: ${date})`);
  } catch (error) {
    console.error(`Error fetching price for ${feed.name}:`, error);
  }
}

export async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const ftsov2 = new ethers.Contract(FTSOV2_ADDRESS, JSON.parse(ABI), provider);

  try {
    const prices = [];

    for (const feed of FEED_IDS) {
      const price = await getPrice(provider, ftsov2, feed);
      console.log(`Fetched price for feed ${feed}:`, price);
      prices.push(price);
    }

    return prices; // ✅ Now it returns an array of prices
  } catch (error) {
    console.error("Error fetching prices:", error);
    return null; // Ensures function returns even on failure
  }
}

