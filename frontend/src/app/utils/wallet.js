import { ethers } from "ethers";
const CONTRACT_ADDRESS = "0xf27d41fc5d4f36F65De4E737A487B44A8a221FA7";

export async function connectWallet() {
    if (!window.ethereum) {
        console.warn("MetaMask not detected");
        return null;
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        console.log("Connected wallet:", address);
        return { provider, signer, address };
    } catch (error) {
        console.error("Error connecting to MetaMask:", error);
        return null;
    }
}

export async function checkBalance(requiredAmount, flarePrice) {
    const wallet = await connectWallet();
    if (!wallet) return false;

    const balance = await wallet.provider.getBalance(wallet.address);

    const formattedBalance = ethers.formatEther(balance); // Result is a string
    const balanceInEther = parseFloat(formattedBalance); // Format to 2 decimal places
    console.log("Wallet Balance:", balanceInEther);


    let requireFLR = requiredAmount / flarePrice
    console.log(requireFLR, 'required flare coins')
    
    
    return balanceInEther >= requireFLR;
}

export async function sendFLRToContract(amount) {
  
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner(); // Get user's wallet
    const formattedAmount = amount.toFixed(18); // Prevent scientific notation
    console.log("Sending FLR to contract:", formattedAmount);
    try {
      const tx = await signer.sendTransaction({
        to: CONTRACT_ADDRESS,
        value: ethers.parseEther(formattedAmount), // Convert FLR to Wei
      });
  
      console.log("Transaction sent! Hash:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed!");
    } catch (error) {
      console.error("Error sending FLR:", error);
    }
  }

