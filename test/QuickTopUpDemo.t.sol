// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/TimelockPiggyBank.sol";
import "../src/MockUSDC.sol";
import "../src/MockWBTC.sol";

contract QuickTopUpDemo is Test {
    TimelockPiggyBank public timelockPiggyBank;
    MockUSDC public mockUSDC;
    MockWBTC public mockWBTC;

    address public owner = address(1);
    address public user1 = address(2);

    uint256 public constant LOCK_3_MONTHS = 3 minutes;
    uint256 public constant USDC_50 = 50 * 10 ** 6; // 50 USDC
    uint256 public constant USDC_20 = 20 * 10 ** 6; // 20 USDC
    uint256 public constant USDC_70 = 70 * 10 ** 6; // 70 USDC total

    function setUp() public {
        vm.startPrank(owner);
        mockUSDC = new MockUSDC();
        mockWBTC = new MockWBTC();
        timelockPiggyBank = new TimelockPiggyBank(address(mockUSDC), address(mockWBTC));
        vm.stopPrank();

        // Give user1 some USDC
        mockUSDC.mint(user1, 1000 * 10 ** 6);
    }

    function testDeposit50ThenTopUp20() public {
        console.log("========================================");
        console.log("    TESTING: 50 USDC + 20 USDC TOP-UP");
        console.log("========================================");
        console.log("");

        vm.startPrank(user1);

        // Check initial balance
        uint256 initialBalance = mockUSDC.balanceOf(user1);
        console.log("User's initial USDC balance:", initialBalance / 10 ** 6, "USDC");
        console.log("");

        // Step 1: Approve contract to spend USDC
        console.log("Step 1: Approving contract to spend 70 USDC (50 + 20)...");
        mockUSDC.approve(address(timelockPiggyBank), USDC_50 + USDC_20);
        console.log("   Approved!");
        console.log("");

        // Step 2: Deposit 50 USDC
        console.log("Step 2: Depositing 50 USDC with 3-minute lock...");
        timelockPiggyBank.depositUSDC(USDC_50, LOCK_3_MONTHS);

        (
            uint256 amount1,
            uint256 lockDuration1,
            uint256 depositTime1,
            bool isWithdrawn1,
            TimelockPiggyBank.AssetType assetType1
        ) = timelockPiggyBank.userDeposits(user1, 0);

        console.log("   Deposit ID: 0");
        console.log("   Amount deposited:", amount1 / 10 ** 6, "USDC");
        console.log("   Lock duration:", lockDuration1 / 60, "minutes");
        console.log("   Asset type:", assetType1 == TimelockPiggyBank.AssetType.USDC ? "USDC" : "Other");
        console.log("   User balance after deposit:", mockUSDC.balanceOf(user1) / 10 ** 6, "USDC");
        console.log("");

        // Step 3: Top up with 20 USDC
        console.log("Step 3: Topping up deposit with 20 more USDC...");
        timelockPiggyBank.topUpUSDC(0, USDC_20);

        (
            uint256 amount2,
            uint256 lockDuration2,
            uint256 depositTime2,
            bool isWithdrawn2,
            TimelockPiggyBank.AssetType assetType2
        ) = timelockPiggyBank.userDeposits(user1, 0);

        console.log("   NEW Amount:", amount2 / 10 ** 6, "USDC");
        console.log("   Lock duration (unchanged):", lockDuration2 / 60, "minutes");
        console.log("   Deposit time (unchanged):", depositTime2);
        console.log("   User balance after top-up:", mockUSDC.balanceOf(user1) / 10 ** 6, "USDC");
        console.log("");

        // Verify the results
        console.log("========================================");
        console.log("            VERIFICATION");
        console.log("========================================");
        assertEq(amount1, USDC_50, "Initial deposit should be 50 USDC");
        console.log("[PASS] Initial deposit: 50 USDC");

        assertEq(amount2, USDC_70, "After top-up should be 70 USDC");
        console.log("[PASS] After top-up: 70 USDC");

        assertEq(lockDuration1, lockDuration2, "Lock duration should not change");
        console.log("[PASS] Lock duration unchanged");

        assertEq(depositTime1, depositTime2, "Deposit time should not change");
        console.log("[PASS] Deposit time unchanged");

        assertEq(mockUSDC.balanceOf(user1), initialBalance - USDC_70, "User should have spent 70 USDC total");
        console.log("[PASS] User spent exactly 70 USDC total");

        assertEq(mockUSDC.balanceOf(address(timelockPiggyBank)), USDC_70, "Contract should have 70 USDC");
        console.log("[PASS] Contract holds 70 USDC");
        console.log("");

        console.log("========================================");
        console.log("        ALL TESTS PASSED!");
        console.log("========================================");

        vm.stopPrank();
    }
}
