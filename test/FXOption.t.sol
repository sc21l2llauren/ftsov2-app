// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/FXOption.sol"; // Ensure the path to FXOption.sol is correct

contract FXOptionTest is Test {
    FXOption fxOption;

    function setUp() public {
        fxOption = new FXOption(); // Deploy the contract locally for testing
    }

    function testCalculateOptionPrice() public {
        uint256 S = 1000000;  // Valid spot price
        uint256 K = 1000000;  // Valid strike price
        uint256 sigma = 100000000000000000;  // Valid volatility
        uint256 T = 31536000;  // Valid time to maturity (1 year)
        bool isCall = true; // Testing a call option


        uint256 price = fxOption.calculateOptionPrice(S, K, r_d, r_f, sigma, T, isCall);
        
        console.log("Calculated Option Price:", price);
        
        assertTrue(price > 0, "Option price should be greater than 0"); // Ensure function works
    }
}
