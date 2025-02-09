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

