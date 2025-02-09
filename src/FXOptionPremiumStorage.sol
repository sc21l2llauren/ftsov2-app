// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract FXOptionPremiumStorage {
    struct OptionPremium {
        address user;
        uint256 spotPrice;
        uint256 strikePrice;
        uint256 timeToExpiry;
        uint256 domesticRate;
        uint256 foreignRate;
        uint256 volatility;
        uint256 premium;
        uint256 timestamp;
        uint256 cryptoAmount; // The amount of cryptocurrency (e.g., BTC, ETH) involved in the option
    }
    
    address public owner;
    mapping(address => OptionPremium[]) public optionPremiums;
    
    event OptionPremiumCalculated(
        address indexed user,
        uint256 spotPrice,
        uint256 strikePrice,
        uint256 timeToExpiry,
        uint256 domesticRate,
        uint256 foreignRate,
        uint256 volatility,
        uint256 premium,
        uint256 timestamp,
        uint256 cryptoAmount // Including cryptoAmount in the event
    );
    
    constructor() {
        owner = msg.sender;
    }
    
    // Modifier to check if the user has enough balance for the trade
    modifier hasSufficientFunds(uint256 requiredAmount) {
        require(msg.sender.balance >= requiredAmount, "Insufficient funds for the transaction.");
        _;
    }

    // Updated function to include the balance check
    function storeOptionPremium(
        uint256 spotPrice,
        uint256 strikePrice,
        uint256 timeToExpiry,
        uint256 domesticRate,
        uint256 foreignRate,
        uint256 volatility,
        uint256 premium,
        uint256 cryptoAmount // Added parameter for cryptoAmount
    ) public hasSufficientFunds(premium) {
        OptionPremium memory newPremium = OptionPremium({
            user: msg.sender,
            spotPrice: spotPrice,
            strikePrice: strikePrice,
            timeToExpiry: timeToExpiry,
            domesticRate: domesticRate,
            foreignRate: foreignRate,
            volatility: volatility,
            premium: premium,
            timestamp: block.timestamp,
            cryptoAmount: cryptoAmount // Store the cryptoAmount
        });
        
        optionPremiums[msg.sender].push(newPremium);
        
        emit OptionPremiumCalculated(
            msg.sender,
            spotPrice,
            strikePrice,
            timeToExpiry,
            domesticRate,
            foreignRate,
            volatility,
            premium,
            block.timestamp,
            cryptoAmount // Emit cryptoAmount in the event
        );
    }
    
    function getOptionPremiums(address user) public view returns (OptionPremium[] memory) {
        return optionPremiums[user];
    }
}
