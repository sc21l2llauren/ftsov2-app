// script/DeployFXOption.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/FXOption.sol";

contract DeployFXOption is Script {
    function run() external {
        vm.startBroadcast();
        new FXOption();
        vm.stopBroadcast();
    }
}
