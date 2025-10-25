// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/TimelockPiggyBank.sol";
import "../src/MockUSDC.sol";
import "../src/MockWBTC.sol";

contract TopUpTest is Test {
    TimelockPiggyBank public timelockPiggyBank;
    MockUSDC public mockUSDC;
    MockWBTC public mockWBTC;

    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);

    uint256 public constant LOCK_3_MONTHS = 90 days;
    uint256 public constant LOCK_6_MONTHS = 180 days;
    uint256 public constant LOCK_9_MONTHS = 270 days;
    uint256 public constant LOCK_12_MONTHS = 360 days;

    uint256 public constant USDC_100 = 100 * 10 ** 6;
    uint256 public constant USDC_50 = 50 * 10 ** 6;
    uint256 public constant WBTC_1 = 1 * 10 ** 8;
    uint256 public constant WBTC_HALF = 0.5 * 10 ** 8;

    event DepositCreated(address indexed user, uint256 indexed depositId, uint256 amount, uint256 lockDuration);
    event DepositToppedUp(address indexed user, uint256 indexed depositId, uint256 amount, uint256 newTotal);

    function setUp() public {
        vm.startPrank(owner);
        mockUSDC = new MockUSDC();
        mockWBTC = new MockWBTC();
        timelockPiggyBank = new TimelockPiggyBank(address(mockUSDC), address(mockWBTC));
        vm.stopPrank();

        // Mint tokens to users
        mockUSDC.mint(user1, 1000 * 10 ** 6);
        mockUSDC.mint(user2, 1000 * 10 ** 6);
        mockWBTC.mint(user1, 10 * 10 ** 8);
        mockWBTC.mint(user2, 10 * 10 ** 8);

        // Give users some ETH
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
    }

    function testTopUpUSDCDeposit() public {
        console.log("=== Testing USDC Top Up ===");

        // User1 creates initial deposit
        vm.startPrank(user1);
        mockUSDC.approve(address(timelockPiggyBank), USDC_100 + USDC_50);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);

        // Check initial deposit
        (
            uint256 amount,
            uint256 lockDuration,
            uint256 depositTime,
            bool isWithdrawn,
            TimelockPiggyBank.AssetType assetType
        ) = timelockPiggyBank.userDeposits(user1, 0);
        assertEq(amount, USDC_100);
        console.log("Initial deposit amount:", amount);

        // Top up the deposit
        vm.expectEmit(true, true, true, true);
        emit DepositToppedUp(user1, 0, USDC_50, USDC_100 + USDC_50);
        timelockPiggyBank.topUpUSDC(0, USDC_50);

        // Verify the deposit was topped up
        (amount,,,, assetType) = timelockPiggyBank.userDeposits(user1, 0);
        assertEq(amount, USDC_100 + USDC_50);
        assertEq(uint256(assetType), uint256(TimelockPiggyBank.AssetType.USDC));
        console.log("New deposit amount after top up:", amount);

        vm.stopPrank();
        console.log("USDC top up test passed!");
    }

    function testTopUpETHDeposit() public {
        console.log("=== Testing ETH Top Up ===");

        // User1 creates initial ETH deposit
        vm.startPrank(user1);
        uint256 initialAmount = 1 ether;
        uint256 topUpAmount = 0.5 ether;

        timelockPiggyBank.depositETH{value: initialAmount}(LOCK_6_MONTHS);

        // Check initial deposit
        (
            uint256 amount,
            uint256 lockDuration,
            uint256 depositTime,
            bool isWithdrawn,
            TimelockPiggyBank.AssetType assetType
        ) = timelockPiggyBank.userDeposits(user1, 0);
        assertEq(amount, initialAmount);
        console.log("Initial ETH deposit:", amount);

        // Top up the ETH deposit
        vm.expectEmit(true, true, true, true);
        emit DepositToppedUp(user1, 0, topUpAmount, initialAmount + topUpAmount);
        timelockPiggyBank.topUpETH{value: topUpAmount}(0);

        // Verify the deposit was topped up
        (amount,,,, assetType) = timelockPiggyBank.userDeposits(user1, 0);
        assertEq(amount, initialAmount + topUpAmount);
        assertEq(uint256(assetType), uint256(TimelockPiggyBank.AssetType.ETH));
        console.log("New ETH deposit after top up:", amount);

        vm.stopPrank();
        console.log("ETH top up test passed!");
    }

    function testTopUpWBTCDeposit() public {
        console.log("=== Testing WBTC Top Up ===");

        // User1 creates initial WBTC deposit
        vm.startPrank(user1);
        mockWBTC.approve(address(timelockPiggyBank), WBTC_1 + WBTC_HALF);
        timelockPiggyBank.depositWBTC(WBTC_1, LOCK_9_MONTHS);

        // Check initial deposit
        (
            uint256 amount,
            uint256 lockDuration,
            uint256 depositTime,
            bool isWithdrawn,
            TimelockPiggyBank.AssetType assetType
        ) = timelockPiggyBank.userDeposits(user1, 0);
        assertEq(amount, WBTC_1);
        console.log("Initial WBTC deposit:", amount);

        // Top up the WBTC deposit
        vm.expectEmit(true, true, true, true);
        emit DepositToppedUp(user1, 0, WBTC_HALF, WBTC_1 + WBTC_HALF);
        timelockPiggyBank.topUpWBTC(0, WBTC_HALF);

        // Verify the deposit was topped up
        (amount,,,, assetType) = timelockPiggyBank.userDeposits(user1, 0);
        assertEq(amount, WBTC_1 + WBTC_HALF);
        assertEq(uint256(assetType), uint256(TimelockPiggyBank.AssetType.WBTC));
        console.log("New WBTC deposit after top up:", amount);

        vm.stopPrank();
        console.log("WBTC top up test passed!");
    }

    function testTopUpWithZeroAmount() public {
        console.log("=== Testing Top Up with Zero Amount ===");

        // User1 creates deposit
        vm.startPrank(user1);
        mockUSDC.approve(address(timelockPiggyBank), USDC_100);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);

        // Try to top up with zero amount
        vm.expectRevert(TimelockPiggyBank.ZeroAmount.selector);
        timelockPiggyBank.topUpUSDC(0, 0);

        vm.stopPrank();
        console.log("Zero amount top up correctly failed!");
    }

    function testTopUpNonExistentDeposit() public {
        console.log("=== Testing Top Up Non-Existent Deposit ===");

        vm.startPrank(user1);
        mockUSDC.approve(address(timelockPiggyBank), USDC_50);

        // Try to top up a non-existent deposit
        vm.expectRevert(TimelockPiggyBank.DepositNotFound.selector);
        timelockPiggyBank.topUpUSDC(0, USDC_50);

        vm.stopPrank();
        console.log("Top up non-existent deposit correctly failed!");
    }

    function testTopUpWithdrawnDeposit() public {
        console.log("=== Testing Top Up Withdrawn Deposit ===");

        // User1 creates and withdraws deposit
        vm.startPrank(user1);
        mockUSDC.approve(address(timelockPiggyBank), USDC_100 + USDC_50);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);

        // Fast forward to unlock time
        vm.warp(block.timestamp + LOCK_3_MONTHS + 1);

        // Withdraw the deposit
        timelockPiggyBank.withdraw(0);

        // Try to top up withdrawn deposit
        vm.expectRevert(TimelockPiggyBank.DepositAlreadyWithdrawn.selector);
        timelockPiggyBank.topUpUSDC(0, USDC_50);

        vm.stopPrank();
        console.log("Top up withdrawn deposit correctly failed!");
    }

    function testTopUpWrongAssetType() public {
        console.log("=== Testing Top Up with Wrong Asset Type ===");

        // User1 creates USDC deposit
        vm.startPrank(user1);
        mockUSDC.approve(address(timelockPiggyBank), USDC_100);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);

        // Try to top up USDC deposit with ETH
        vm.expectRevert(TimelockPiggyBank.InvalidDepositId.selector);
        timelockPiggyBank.topUpETH{value: 0.5 ether}(0);

        vm.stopPrank();
        console.log("Top up with wrong asset type correctly failed!");
    }

    function testMultipleTopUps() public {
        console.log("=== Testing Multiple Top Ups ===");

        vm.startPrank(user1);
        mockUSDC.approve(address(timelockPiggyBank), USDC_100 + USDC_50 + USDC_50);

        // Initial deposit
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);

        // First top up
        timelockPiggyBank.topUpUSDC(0, USDC_50);
        (uint256 amount1,,,,) = timelockPiggyBank.userDeposits(user1, 0);
        assertEq(amount1, USDC_100 + USDC_50);
        console.log("After first top up:", amount1);

        // Second top up
        timelockPiggyBank.topUpUSDC(0, USDC_50);
        (uint256 amount2,,,,) = timelockPiggyBank.userDeposits(user1, 0);
        assertEq(amount2, USDC_100 + USDC_50 + USDC_50);
        console.log("After second top up:", amount2);

        vm.stopPrank();
        console.log("Multiple top ups test passed!");
    }

    function testTopUpDoesNotChangeUnlockTime() public {
        console.log("=== Testing Top Up Does Not Change Unlock Time ===");

        vm.startPrank(user1);
        mockUSDC.approve(address(timelockPiggyBank), USDC_100 + USDC_50);

        // Initial deposit
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);
        (uint256 amount1, uint256 lockDuration1, uint256 depositTime1,,) = timelockPiggyBank.userDeposits(user1, 0);

        // Wait some time
        vm.warp(block.timestamp + 30 days);

        // Top up
        timelockPiggyBank.topUpUSDC(0, USDC_50);
        (uint256 amount2, uint256 lockDuration2, uint256 depositTime2,,) = timelockPiggyBank.userDeposits(user1, 0);

        // Verify lock duration and deposit time haven't changed
        assertEq(lockDuration1, lockDuration2);
        assertEq(depositTime1, depositTime2);
        assertEq(amount2, amount1 + USDC_50);
        console.log("Lock duration unchanged:", lockDuration2);
        console.log("Deposit time unchanged:", depositTime2);
        console.log("Amount increased:", amount2);

        vm.stopPrank();
        console.log("Top up preserves unlock time test passed!");
    }
}
