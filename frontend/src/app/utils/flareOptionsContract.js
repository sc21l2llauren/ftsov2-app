import { ethers } from "ethers";

// Replace with Flare RPC Endpoint
const FLARE_RPC_URL = "https://coston2-api.flare.network/ext/C/rpc"; 

// Replace with actual contract details
const CONTRACT_ADDRESS = "0xe43e599910df62c620C1744e73Faec4d70047aD2";
const ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "getFlrUsdPrice",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export async function fetchFlrUsdPrice() {
  try {
    const provider = new ethers.JsonRpcProvider(FLARE_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    const price = await contract.getFlrUsdPrice(); // Assuming it returns price in smallest unit
    return ethers.formatUnits(price, 7); // Adjust decimals based on contract
  } catch (error) {
    console.error("Error fetching FLR/USD price:", error);
    return null;
  }
}
