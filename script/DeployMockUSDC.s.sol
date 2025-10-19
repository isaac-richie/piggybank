// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/MockUSDC.sol";

contract DeployMockUSDCScript is Script {
    function run() public {
        console.log("Deploying MockUSDC to Base Sepolia...");

        vm.startBroadcast();

        MockUSDC mockUSDC = new MockUSDC();

        vm.stopBroadcast();

        console.log("MockUSDC deployed to: %s", address(mockUSDC));
        console.log("MockUSDC symbol: %s", mockUSDC.symbol());
        console.log("MockUSDC decimals: %d", mockUSDC.decimals());

        console.log("\nNext steps:");
        console.log("1. Update frontend contracts.ts with this address");
        console.log("2. Redeploy TimelockPiggyBank with this MockUSDC address");
        console.log("3. Users can mint MockUSDC for testing");
    }
}
