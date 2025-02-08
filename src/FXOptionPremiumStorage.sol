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
        uint256 timestamp
    );
    
    constructor() {
        owner = msg.sender;
    }
    
    function storeOptionPremium(
        uint256 spotPrice,
        uint256 strikePrice,
        uint256 timeToExpiry,
        uint256 domesticRate,
        uint256 foreignRate,
        uint256 volatility,
        uint256 premium
    ) public {
        OptionPremium memory newPremium = OptionPremium({
            user: msg.sender,
            spotPrice: spotPrice,
            strikePrice: strikePrice,
            timeToExpiry: timeToExpiry,
            domesticRate: domesticRate,
            foreignRate: foreignRate,
            volatility: volatility,
            premium: premium,
            timestamp: block.timestamp
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
            block.timestamp
        );
    }
    
    function getOptionPremiums(address user) public view returns (OptionPremium[] memory) {
        return optionPremiums[user];
    }
}
