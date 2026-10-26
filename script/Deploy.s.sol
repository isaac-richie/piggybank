// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/TimelockPiggyBank.sol";

contract DeployScript is Script {
    // USDC addresses on different networks
    mapping(string => address) public usdcAddresses;
    // WBTC addresses on different networks
    mapping(string => address) public wbtcAddresses;

    function setUp() public {
        // USDC addresses
        usdcAddresses["mainnet"] = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // USDC on Mainnet
        usdcAddresses["polygon"] = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; // USDC on Polygon
        usdcAddresses["goerli"] = 0x07865c6E87B9F70255377e024ace6630C1Eaa37F; // USDC on Goerli
        usdcAddresses["sepolia"] = 0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8; // USDC on Sepolia
        usdcAddresses["arbitrum"] = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831; // USDC on Arbitrum
        usdcAddresses["optimism"] = 0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85; // USDC on Optimism
        usdcAddresses["base"] = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913; // USDC on Base Mainnet
        usdcAddresses["base-sepolia"] = 0x036CbD53842c5426634e7929541eC2318f3dCF7e; // USDC on Base Sepolia

        // WBTC addresses
        wbtcAddresses["mainnet"] = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599; // WBTC on Mainnet
        wbtcAddresses["polygon"] = 0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6; // WBTC on Polygon
        wbtcAddresses["arbitrum"] = 0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f; // WBTC on Arbitrum
        wbtcAddresses["optimism"] = 0x68f180fcCe6836688e9084f035309E29Bf0A2095; // WBTC on Optimism
        wbtcAddresses["base"] = 0x0555E30da8f98308EdB960aa94C0Db47230d2B9c; // WBTC on Base Mainnet
        wbtcAddresses["base-sepolia"] = 0xaa75cE9Ea5448d29e126039F142CB24c6312D5Ed; // WBTC on Base Sepolia
        wbtcAddresses["goerli"] = 0xC04B0d3107736C32e19F1c62b2aF67BE61d63a05; // WBTC on Goerli
        wbtcAddresses["sepolia"] = 0x29f2D40B0605204364af54EC677bD022dA425d03; // WBTC on Sepolia
    }

    function run() public {
        string memory network = vm.envOr("NETWORK", string("localhost"));
        address usdcAddress = usdcAddresses[network];
        address wbtcAddress = wbtcAddresses[network];
        require(usdcAddress != address(0), string.concat("No USDC address configured for network: ", network));
        require(wbtcAddress != address(0), string.concat("No WBTC address configured for network: ", network));
        require(usdcAddress.code.length > 0, "USDC address has no code on this chain");
        require(wbtcAddress.code.length > 0, "WBTC address has no code on this chain");

        // Optional: hand admin rights to a multisig. With two-step ownership the
        // new owner must call acceptOwnership() before the transfer takes effect.
        address finalOwner = vm.envOr("OWNER", address(0));

        console.log("Deploying to network:", network);
        console.log("Using USDC address:", usdcAddress);
        console.log("Using WBTC address:", wbtcAddress);

        vm.startBroadcast();
        TimelockPiggyBank timelockPiggyBank = new TimelockPiggyBank(usdcAddress, wbtcAddress);
        if (finalOwner != address(0)) {
            timelockPiggyBank.transferOwnership(finalOwner);
        }
        vm.stopBroadcast();

        require(address(timelockPiggyBank.usdcToken()) == usdcAddress, "USDC mismatch");
        require(address(timelockPiggyBank.wbtcToken()) == wbtcAddress, "WBTC mismatch");
        require(!timelockPiggyBank.paused(), "Deployed paused");

        console.log("TimelockPiggyBank deployed to: %s", address(timelockPiggyBank));
        console.log("Owner:", timelockPiggyBank.owner());
        if (finalOwner != address(0)) {
            console.log("Pending owner (must call acceptOwnership):", finalOwner);
        }

        console.log("\nNext steps:");
        console.log("1. Update CONTRACT_ADDRESS in frontend/src/lib/contracts.ts");
        console.log("2. Make a small test deposit and withdrawal before announcing");
    }
}
