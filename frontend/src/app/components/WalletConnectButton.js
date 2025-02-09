
import React, { useState } from "react";
import { connectWallet } from "../utils/wallet";

const WalletConnectButton = () => {
    const [walletAddress, setWalletAddress] = useState(null);

    async function handleConnect() {
        const wallet = await connectWallet();
        if (wallet) setWalletAddress(wallet.address);
    }

    return (
        <button onClick={handleConnect} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
            {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...` : "Connect Wallet"}
        </button>
    );
};

export default WalletConnectButton;
