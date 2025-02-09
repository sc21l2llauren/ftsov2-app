// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract FXOptionContract {
    struct Option {
        address buyer;
        string optionType;
        uint256 price;
        uint256 timestamp;
    }

    address public owner;
    mapping(address => Option[]) public options;

    event OptionPurchased(address indexed buyer, string optionType, uint256 price, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can perform this action");
        _;
    }

    function buyOption(string memory optionType, uint256 price) public payable {
        require(msg.value >= price, "Insufficient funds sent");

        options[msg.sender].push(Option({
            buyer: msg.sender,
            optionType: optionType,
            price: price,
            timestamp: block.timestamp
        }));

        emit OptionPurchased(msg.sender, optionType, price, block.timestamp);
    }

    function getOptions(address buyer) public view returns (Option[] memory) {
        return options[buyer];
    }

    function withdrawFunds() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
