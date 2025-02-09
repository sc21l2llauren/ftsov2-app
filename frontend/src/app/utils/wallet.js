import { ethers } from "ethers";

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

export async function checkBalance(requiredAmount) {
    const wallet = await connectWallet();
    if (!wallet) return false;

    const balance = await wallet.provider.getBalance(wallet.address);
    const balanceInEth = ethers.formatEther(balance);

    console.log(`Wallet Balance: ${balanceInEth} ETH`);
    
    return parseFloat(balanceInEth) >= requiredAmount;
}
