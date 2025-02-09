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
        uint256 cryptoAmount;
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
        uint256 cryptoAmount
    );

    constructor() {
        owner = msg.sender;
    }

    // Function to accept direct FLR transfers
    receive() external payable {}

    // Modifier to check if the user has enough balance for the trade
    modifier hasSufficientFunds(uint256 requiredAmount) {
        require(msg.sender.balance >= requiredAmount, "Insufficient funds for the transaction.");
        _;
    }

    // Store the option premium and receive FLR
    function storeOptionPremium(
        uint256 spotPrice,
        uint256 strikePrice,
        uint256 timeToExpiry,
        uint256 domesticRate,
        uint256 foreignRate,
        uint256 volatility,
        uint256 cryptoAmount
    ) public payable hasSufficientFunds(msg.value) {
        require(msg.value > 0, "You must send FLR to store an option premium.");

        OptionPremium memory newPremium = OptionPremium({
            user: msg.sender,
            spotPrice: spotPrice,
            strikePrice: strikePrice,
            timeToExpiry: timeToExpiry,
            domesticRate: domesticRate,
            foreignRate: foreignRate,
            volatility: volatility,
            premium: msg.value,  // Store the actual FLR sent
            timestamp: block.timestamp,
            cryptoAmount: cryptoAmount
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
            msg.value,  // Emit actual FLR sent
            block.timestamp,
            cryptoAmount
        );
    }

    // Retrieve option premiums for a user
    function getOptionPremiums(address user) public view returns (OptionPremium[] memory) {
        return optionPremiums[user];
    }

    // Retrieve contract's balance
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Allow owner to withdraw FLR from the contract
    function withdraw(uint256 amount) public {
        require(msg.sender == owner, "Only the owner can withdraw funds.");
        require(amount <= address(this).balance, "Not enough funds in contract.");
        payable(owner).transfer(amount);
    }
}
