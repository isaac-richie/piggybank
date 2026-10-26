// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/TimelockPiggyBank.sol";
import "../src/MockUSDC.sol";
import "../src/MockWBTC.sol";

contract TimelockPiggyBankTest is Test {
    TimelockPiggyBank public timelockPiggyBank;
    MockUSDC public mockUSDC;
    MockWBTC public mockWBTC;

    address public owner;
    address public user1;
    address public user2;

    // Lock durations in seconds
    uint256 public constant LOCK_3_MONTHS = 90 days;
    uint256 public constant LOCK_6_MONTHS = 180 days;
    uint256 public constant LOCK_9_MONTHS = 270 days;
    uint256 public constant LOCK_12_MONTHS = 360 days;

    // USDC amounts (6 decimals)
    uint256 public constant USDC_100 = 100 * 10 ** 6;
    uint256 public constant USDC_1000 = 1000 * 10 ** 6;

    event DepositCreated(address indexed user, uint256 indexed depositId, uint256 amount, uint256 lockDuration);

    event DepositWithdrawn(address indexed user, uint256 indexed depositId, uint256 amount, address indexed to);

    event TokensRescued(address indexed token, uint256 amount, address indexed to);

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        // Deploy mock tokens
        mockUSDC = new MockUSDC();
        mockWBTC = new MockWBTC();

        // Deploy TimelockPiggyBank
        timelockPiggyBank = new TimelockPiggyBank(address(mockUSDC), address(mockWBTC));

        // Mint USDC to users
        mockUSDC.mint(user1, USDC_1000);
        mockUSDC.mint(user2, USDC_1000);

        // Give ETH to users
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);

        // Approve contract to spend USDC
        vm.prank(user1);
        mockUSDC.approve(address(timelockPiggyBank), USDC_1000);

        vm.prank(user2);
        mockUSDC.approve(address(timelockPiggyBank), USDC_1000);
    }

    function testDeployment() public {
        assertEq(timelockPiggyBank.owner(), owner);
        assertEq(address(timelockPiggyBank.usdcToken()), address(mockUSDC));

        // Check valid lock durations
        uint256[] memory durations = timelockPiggyBank.getValidLockDurations();
        assertEq(durations.length, 4);
        assertEq(durations[0], LOCK_3_MONTHS);
        assertEq(durations[1], LOCK_6_MONTHS);
        assertEq(durations[2], LOCK_9_MONTHS);
        assertEq(durations[3], LOCK_12_MONTHS);
    }

    function testValidDeposit() public {
        vm.prank(user1);
        vm.expectEmit(true, true, true, true);
        emit DepositCreated(user1, 0, USDC_100, LOCK_3_MONTHS);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);

        // Check deposit was created
        TimelockPiggyBank.Deposit memory deposit = timelockPiggyBank.getDeposit(user1, 0);
        assertEq(deposit.amount, USDC_100);
        assertEq(deposit.lockDuration, LOCK_3_MONTHS);
        assertEq(deposit.isWithdrawn, false);
        assertEq(uint256(deposit.assetType), uint256(TimelockPiggyBank.AssetType.USDC));

        // Check user deposit count
        assertEq(timelockPiggyBank.getUserDepositCount(user1), 1);

        // Check total locked amount
        assertEq(timelockPiggyBank.getTotalLockedAmount(user1), USDC_100);
    }

    function testInvalidLockDuration() public {
        vm.prank(user1);
        vm.expectRevert(TimelockPiggyBank.InvalidLockDuration.selector);
        timelockPiggyBank.depositUSDC(USDC_100, 30 days);
    }

    function testZeroAmount() public {
        vm.prank(user1);
        vm.expectRevert(TimelockPiggyBank.ZeroAmount.selector);
        timelockPiggyBank.depositUSDC(0, LOCK_3_MONTHS);
    }

    function testZeroAddressBeneficiary() public {
        // This test is no longer relevant since we removed beneficiary parameter
        // Deposits now automatically use msg.sender
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);

        // Verify deposit was created
        assertEq(timelockPiggyBank.getUserDepositCount(user1), 1);
    }

    function testMultipleDeposits() public {
        // First deposit
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);

        // Second deposit
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_6_MONTHS);

        assertEq(timelockPiggyBank.getUserDepositCount(user1), 2);
        assertEq(timelockPiggyBank.getTotalLockedAmount(user1), USDC_100 * 2);
    }

    function testWithdrawBeforeUnlock() public {
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);

        vm.prank(user1);
        vm.expectRevert(TimelockPiggyBank.DepositNotUnlocked.selector);
        timelockPiggyBank.withdraw(0);
    }

    function testWithdrawAfterUnlock() public {
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);

        // Fast forward time by 91 days
        vm.warp(block.timestamp + 91 days);

        uint256 balanceBefore = mockUSDC.balanceOf(user1);

        vm.prank(user1);
        vm.expectEmit(true, true, true, true);
        emit DepositWithdrawn(user1, 0, USDC_100, user1);
        timelockPiggyBank.withdraw(0);

        uint256 balanceAfter = mockUSDC.balanceOf(user1);
        assertEq(balanceAfter - balanceBefore, USDC_100);

        // Check deposit is marked as withdrawn
        TimelockPiggyBank.Deposit memory deposit = timelockPiggyBank.getDeposit(user1, 0);
        assertTrue(deposit.isWithdrawn);
    }

    function testDoubleWithdrawal() public {
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);

        // Fast forward time
        vm.warp(block.timestamp + 91 days);

        // First withdrawal
        vm.prank(user1);
        timelockPiggyBank.withdraw(0);

        // Second withdrawal should fail
        vm.prank(user1);
        vm.expectRevert(TimelockPiggyBank.DepositAlreadyWithdrawn.selector);
        timelockPiggyBank.withdraw(0);
    }

    function testForwardDeposit() public {
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);

        // Fast forward time
        vm.warp(block.timestamp + 91 days);

        uint256 balanceBefore = mockUSDC.balanceOf(user2);

        vm.prank(user1);
        vm.expectEmit(true, true, true, true);
        emit DepositWithdrawn(user1, 0, USDC_100, user2);
        timelockPiggyBank.forwardDeposit(0, user2);

        uint256 balanceAfter = mockUSDC.balanceOf(user2);
        assertEq(balanceAfter - balanceBefore, USDC_100);
    }

    function testIsDepositUnlocked() public {
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);

        // Initially locked
        assertFalse(timelockPiggyBank.isDepositUnlocked(user1, 0));

        // Fast forward time
        vm.warp(block.timestamp + 91 days);

        // Now unlocked
        assertTrue(timelockPiggyBank.isDepositUnlocked(user1, 0));
    }

    function testRescueTokens() public {
        // Send some USDC to the contract
        mockUSDC.mint(address(timelockPiggyBank), USDC_100);

        uint256 balanceBefore = mockUSDC.balanceOf(owner);

        vm.expectEmit(true, true, true, true);
        emit TokensRescued(address(mockUSDC), USDC_100, owner);
        timelockPiggyBank.rescueTokens(address(mockUSDC), USDC_100, owner);

        uint256 balanceAfter = mockUSDC.balanceOf(owner);
        assertEq(balanceAfter - balanceBefore, USDC_100);
    }

    function testRescueCannotRemoveReservedCustomerFunds() public {
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);

        vm.expectRevert(TimelockPiggyBank.InsufficientSurplus.selector);
        timelockPiggyBank.rescueTokens(address(mockUSDC), 1, owner);

        assertEq(mockUSDC.balanceOf(address(timelockPiggyBank)), USDC_100);
        assertEq(timelockPiggyBank.getActiveDepositCount(user1), 1);
    }

    function testRescueCanRemoveOnlySurplusAboveCustomerReserves() public {
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);
        mockUSDC.mint(address(timelockPiggyBank), USDC_100);

        timelockPiggyBank.rescueTokens(address(mockUSDC), USDC_100, owner);

        assertEq(mockUSDC.balanceOf(address(timelockPiggyBank)), USDC_100);
        assertEq(timelockPiggyBank.totalReservedUSDC(), USDC_100);
        assertEq(timelockPiggyBank.getActiveDepositCount(user1), 1);
    }

    function testAdminSettlementClosesPositionAndAllowsNewDeposit() public {
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);

        uint256 balanceBefore = mockUSDC.balanceOf(user1);
        timelockPiggyBank.adminSettleDeposit(user1, 0);

        TimelockPiggyBank.Deposit memory settled = timelockPiggyBank.getDeposit(user1, 0);
        assertTrue(settled.isWithdrawn);
        assertEq(mockUSDC.balanceOf(user1), balanceBefore + USDC_100);
        assertEq(timelockPiggyBank.getActiveDepositCount(user1), 0);
        assertEq(timelockPiggyBank.getTotalLockedUSDC(user1), 0);
        assertEq(timelockPiggyBank.totalReservedUSDC(), 0);

        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_12_MONTHS);

        TimelockPiggyBank.Deposit memory nextDeposit = timelockPiggyBank.getDeposit(user1, 1);
        assertEq(nextDeposit.amount, USDC_100);
        assertEq(nextDeposit.lockDuration, LOCK_12_MONTHS);
        assertFalse(nextDeposit.isWithdrawn);
        assertEq(timelockPiggyBank.getUserDepositCount(user1), 2);
        assertEq(timelockPiggyBank.getActiveDepositCount(user1), 1);
        assertEq(timelockPiggyBank.totalReservedUSDC(), USDC_100);

        vm.warp(block.timestamp + LOCK_12_MONTHS);
        vm.prank(user1);
        timelockPiggyBank.withdraw(1);
        assertEq(timelockPiggyBank.getActiveDepositCount(user1), 0);
        assertEq(timelockPiggyBank.totalReservedUSDC(), 0);
    }

    function testAdminBatchSettlementClosesOnlySelectedPositions() public {
        vm.startPrank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_6_MONTHS);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_9_MONTHS);
        vm.stopPrank();

        uint256[] memory selected = new uint256[](2);
        selected[0] = 0;
        selected[1] = 2;
        timelockPiggyBank.adminSettleDeposits(user1, selected);

        assertTrue(timelockPiggyBank.getDeposit(user1, 0).isWithdrawn);
        assertFalse(timelockPiggyBank.getDeposit(user1, 1).isWithdrawn);
        assertTrue(timelockPiggyBank.getDeposit(user1, 2).isWithdrawn);
        assertEq(timelockPiggyBank.getActiveDepositCount(user1), 1);
        assertEq(timelockPiggyBank.getTotalLockedUSDC(user1), USDC_100);
        assertEq(timelockPiggyBank.totalReservedUSDC(), USDC_100);

        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_9_MONTHS);
        TimelockPiggyBank.Deposit memory added = timelockPiggyBank.getDeposit(user1, 3);
        assertEq(added.lockDuration, LOCK_9_MONTHS);
        assertFalse(added.isWithdrawn);
        assertEq(timelockPiggyBank.getUserDepositCount(user1), 4);
        assertEq(timelockPiggyBank.getActiveDepositCount(user1), 2);
        assertEq(timelockPiggyBank.totalReservedUSDC(), USDC_100 * 2);
    }

    function testAdminBatchSettlementPaysMixedAssetsAndClearsReserves() public {
        uint256 wbtcAmount = 1 * 10 ** 8;
        uint256 ethAmount = 1 ether;
        mockWBTC.mint(user1, wbtcAmount);

        vm.startPrank(user1);
        mockUSDC.approve(address(timelockPiggyBank), USDC_100);
        mockWBTC.approve(address(timelockPiggyBank), wbtcAmount);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);
        timelockPiggyBank.depositETH{value: ethAmount}(LOCK_6_MONTHS);
        timelockPiggyBank.depositWBTC(wbtcAmount, LOCK_9_MONTHS);
        vm.stopPrank();

        uint256[] memory selected = new uint256[](3);
        selected[0] = 0;
        selected[1] = 1;
        selected[2] = 2;
        uint256 userETHBefore = user1.balance;
        timelockPiggyBank.adminSettleDeposits(user1, selected);

        assertEq(mockUSDC.balanceOf(user1), USDC_1000);
        assertEq(mockWBTC.balanceOf(user1), wbtcAmount);
        assertEq(user1.balance, userETHBefore + ethAmount);
        assertEq(timelockPiggyBank.getActiveDepositCount(user1), 0);
        assertEq(timelockPiggyBank.totalReservedUSDC(), 0);
        assertEq(timelockPiggyBank.totalReservedETH(), 0);
        assertEq(timelockPiggyBank.totalReservedWBTC(), 0);
    }

    function testAdminBatchSettlementIsAtomicWhenVaultIsShort() public {
        vm.startPrank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_6_MONTHS);
        vm.stopPrank();

        mockUSDC.burn(address(timelockPiggyBank), USDC_100 / 2);
        uint256[] memory selected = new uint256[](2);
        selected[0] = 0;
        selected[1] = 1;

        vm.expectRevert();
        timelockPiggyBank.adminSettleDeposits(user1, selected);

        assertFalse(timelockPiggyBank.getDeposit(user1, 0).isWithdrawn);
        assertFalse(timelockPiggyBank.getDeposit(user1, 1).isWithdrawn);
        assertEq(timelockPiggyBank.getActiveDepositCount(user1), 2);
        assertEq(timelockPiggyBank.totalReservedUSDC(), USDC_100 * 2);
        assertEq(mockUSDC.balanceOf(address(timelockPiggyBank)), USDC_100 * 2 - USDC_100 / 2);
    }

    function testNonOwnerCannotAdminSettleDeposit() public {
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);

        vm.prank(user2);
        vm.expectRevert();
        timelockPiggyBank.adminSettleDeposit(user1, 0);

        assertFalse(timelockPiggyBank.getDeposit(user1, 0).isWithdrawn);
        assertEq(timelockPiggyBank.getActiveDepositCount(user1), 1);
    }

    function testPauseUnpause() public {
        timelockPiggyBank.pause();
        assertTrue(timelockPiggyBank.paused());

        timelockPiggyBank.unpause();
        assertFalse(timelockPiggyBank.paused());
    }

    function testNonOwnerCannotRescue() public {
        vm.prank(user1);
        vm.expectRevert();
        timelockPiggyBank.rescueTokens(address(mockUSDC), USDC_100, user1);
    }

    function testNonOwnerCannotPause() public {
        vm.prank(user1);
        vm.expectRevert();
        timelockPiggyBank.pause();
    }

    function testGetAvailableWithdrawalAmount() public {
        // Make deposits with different lock durations
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);

        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_6_MONTHS);

        // Initially no deposits are unlocked
        assertEq(timelockPiggyBank.getAvailableWithdrawalAmount(user1), 0);

        // Fast forward to unlock first deposit
        vm.warp(block.timestamp + LOCK_3_MONTHS + 1);
        assertEq(timelockPiggyBank.getAvailableWithdrawalAmount(user1), USDC_100);

        // Fast forward to unlock second deposit
        vm.warp(block.timestamp + (LOCK_6_MONTHS - LOCK_3_MONTHS));
        assertEq(timelockPiggyBank.getAvailableWithdrawalAmount(user1), USDC_100 * 2);
    }

    function testDepositWithDifferentBeneficiaries() public {
        // User1 deposits with user2 as beneficiary
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);

        // Fast forward time
        vm.warp(block.timestamp + 91 days);

        // User1 (depositor) should be able to forward the deposit to user2 (beneficiary)
        uint256 balanceBefore = mockUSDC.balanceOf(user2);

        vm.prank(user1);
        timelockPiggyBank.forwardDeposit(0, user2);

        uint256 balanceAfter = mockUSDC.balanceOf(user2);
        assertEq(balanceAfter - balanceBefore, USDC_100);
    }

    function testInvalidDepositId() public {
        vm.prank(user1);
        vm.expectRevert(TimelockPiggyBank.DepositNotFound.selector);
        timelockPiggyBank.withdraw(999);
    }

    function testWrongBeneficiaryCannotWithdraw() public {
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);

        // Fast forward time
        vm.warp(block.timestamp + 91 days);

        // User2 tries to withdraw user1's deposit (user2 has no deposits)
        vm.prank(user2);
        vm.expectRevert(TimelockPiggyBank.DepositNotFound.selector);
        timelockPiggyBank.withdraw(0);
    }

    function testContractBalance() public {
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);

        assertEq(timelockPiggyBank.getContractBalance(), USDC_100);
    }

    function testAllLockDurations() public {
        uint256[] memory durations = timelockPiggyBank.getValidLockDurations();

        // Test each valid duration
        for (uint256 i = 0; i < durations.length; i++) {
            vm.prank(user1);
            timelockPiggyBank.depositUSDC(USDC_100, durations[i]);
        }

        assertEq(timelockPiggyBank.getUserDepositCount(user1), 4);
        assertEq(timelockPiggyBank.getTotalLockedAmount(user1), USDC_100 * 4);
    }

    // ============ ETH DEPOSIT TESTS ============

    function testValidETHDeposit() public {
        uint256 ethAmount = 1 ether;

        vm.prank(user1);
        vm.expectEmit(true, true, true, true);
        emit DepositCreated(user1, 0, ethAmount, LOCK_3_MONTHS);
        timelockPiggyBank.depositETH{value: ethAmount}(LOCK_3_MONTHS);

        // Check deposit was created
        TimelockPiggyBank.Deposit memory deposit = timelockPiggyBank.getDeposit(user1, 0);
        assertEq(deposit.amount, ethAmount);
        assertEq(deposit.lockDuration, LOCK_3_MONTHS);
        assertEq(deposit.isWithdrawn, false);
        assertEq(uint256(deposit.assetType), uint256(TimelockPiggyBank.AssetType.ETH));

        // Check user deposit count
        assertEq(timelockPiggyBank.getUserDepositCount(user1), 1);

        // Check total locked amount
        assertEq(timelockPiggyBank.getTotalLockedAmount(user1), ethAmount);

        // Check contract ETH balance
        assertEq(timelockPiggyBank.getContractETHBalance(), ethAmount);
    }

    function testETHDepositWithZeroValue() public {
        vm.prank(user1);
        vm.expectRevert(TimelockPiggyBank.ZeroAmount.selector);
        timelockPiggyBank.depositETH{value: 0}(LOCK_3_MONTHS);
    }

    function testETHDepositWithZeroBeneficiary() public {
        // This test is no longer relevant since we removed beneficiary
        // ETH deposits now only require lockDuration
        vm.prank(user1);
        timelockPiggyBank.depositETH{value: 1 ether}(LOCK_3_MONTHS);

        // Verify deposit was created
        assertEq(timelockPiggyBank.getUserDepositCount(user1), 1);
    }

    function testETHDepositWithInvalidLockDuration() public {
        vm.prank(user1);
        vm.expectRevert(TimelockPiggyBank.InvalidLockDuration.selector);
        timelockPiggyBank.depositETH{value: 1 ether}(30 days);
    }

    function testETHWithdrawalAfterUnlock() public {
        uint256 ethAmount = 1 ether;

        vm.prank(user1);
        timelockPiggyBank.depositETH{value: ethAmount}(LOCK_3_MONTHS);

        // Fast forward time by 91 days
        vm.warp(block.timestamp + 91 days);

        uint256 balanceBefore = user1.balance;

        vm.prank(user1);
        vm.expectEmit(true, true, true, true);
        emit DepositWithdrawn(user1, 0, ethAmount, user1);
        timelockPiggyBank.withdraw(0);

        uint256 balanceAfter = user1.balance;
        assertEq(balanceAfter - balanceBefore, ethAmount);

        // Check deposit is marked as withdrawn
        TimelockPiggyBank.Deposit memory deposit = timelockPiggyBank.getDeposit(user1, 0);
        assertTrue(deposit.isWithdrawn);
    }

    function testETHForwardDeposit() public {
        uint256 ethAmount = 1 ether;

        vm.prank(user1);
        timelockPiggyBank.depositETH{value: ethAmount}(LOCK_3_MONTHS);

        // Fast forward time
        vm.warp(block.timestamp + 91 days);

        uint256 balanceBefore = user2.balance;

        vm.prank(user1);
        vm.expectEmit(true, true, true, true);
        emit DepositWithdrawn(user1, 0, ethAmount, user2);
        timelockPiggyBank.forwardDeposit(0, user2);

        uint256 balanceAfter = user2.balance;
        assertEq(balanceAfter - balanceBefore, ethAmount);
    }

    function testMixedDeposits() public {
        // Deposit USDC
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);

        // Deposit ETH
        vm.prank(user1);
        timelockPiggyBank.depositETH{value: 1 ether}(LOCK_6_MONTHS);

        assertEq(timelockPiggyBank.getUserDepositCount(user1), 2);
        assertEq(timelockPiggyBank.getTotalLockedAmount(user1), USDC_100 + 1 ether);

        // Check both deposits
        TimelockPiggyBank.Deposit memory usdcDeposit = timelockPiggyBank.getDeposit(user1, 0);
        TimelockPiggyBank.Deposit memory ethDeposit = timelockPiggyBank.getDeposit(user1, 1);

        assertEq(usdcDeposit.amount, USDC_100);
        assertEq(uint256(usdcDeposit.assetType), uint256(TimelockPiggyBank.AssetType.USDC));
        assertEq(ethDeposit.amount, 1 ether);
        assertEq(uint256(ethDeposit.assetType), uint256(TimelockPiggyBank.AssetType.ETH));
    }

    function testRescueETH() public {
        // Send some ETH to the contract
        vm.deal(address(timelockPiggyBank), 1 ether);

        // Use a different address that can receive ETH
        address recipient = makeAddr("recipient");
        vm.deal(recipient, 0); // Start with 0 balance

        uint256 balanceBefore = recipient.balance;

        // Rescue ETH to the recipient
        timelockPiggyBank.rescueETH(recipient);

        uint256 balanceAfter = recipient.balance;
        assertEq(balanceAfter - balanceBefore, 1 ether);
    }

    function testRescueETHWithZeroBalance() public {
        vm.expectRevert(TimelockPiggyBank.ZeroAmount.selector);
        timelockPiggyBank.rescueETH(owner);
    }

    function testReceiveETH() public {
        // Send ETH directly to contract
        vm.deal(address(timelockPiggyBank), 1 ether);

        // ETH should be received but not create a deposit
        assertEq(timelockPiggyBank.getContractETHBalance(), 1 ether);
        assertEq(timelockPiggyBank.getUserDepositCount(user1), 0);
    }

    function testETHDepositWithDifferentBeneficiaries() public {
        uint256 ethAmount = 1 ether;

        // User1 deposits ETH with user2 as beneficiary
        vm.prank(user1);
        timelockPiggyBank.depositETH{value: ethAmount}(LOCK_3_MONTHS);

        // Fast forward time
        vm.warp(block.timestamp + 91 days);

        // User1 (depositor) should be able to forward the deposit to user2 (beneficiary)
        uint256 balanceBefore = user2.balance;

        vm.prank(user1);
        vm.expectEmit(true, true, true, true);
        emit DepositWithdrawn(user1, 0, ethAmount, user2);
        timelockPiggyBank.forwardDeposit(0, user2);

        uint256 balanceAfter = user2.balance;
        assertEq(balanceAfter - balanceBefore, ethAmount);
    }

    // ============ OWNERSHIP TRANSFER TESTS ============

    function testTransferOwnership() public {
        address newOwner = makeAddr("newOwner");

        // Current owner should be able to transfer ownership
        assertEq(timelockPiggyBank.owner(), owner);

        timelockPiggyBank.transferOwnership(newOwner);

        assertEq(timelockPiggyBank.owner(), newOwner);
    }

    function testTransferOwnershipToZeroAddress() public {
        vm.expectRevert(TimelockPiggyBank.ZeroAddress.selector);
        timelockPiggyBank.transferOwnership(address(0));
    }

    function testNonOwnerCannotTransferOwnership() public {
        address newOwner = makeAddr("newOwner");

        vm.prank(user1);
        vm.expectRevert();
        timelockPiggyBank.transferOwnership(newOwner);
    }

    function testRenounceOwnership() public {
        // Owner should be able to renounce ownership
        assertEq(timelockPiggyBank.owner(), owner);

        timelockPiggyBank.renounceOwnership();

        assertEq(timelockPiggyBank.owner(), address(0));
    }

    function testNonOwnerCannotRenounceOwnership() public {
        vm.prank(user1);
        vm.expectRevert();
        timelockPiggyBank.renounceOwnership();
    }

    function testNewOwnerCanAccessAdminFunctions() public {
        address newOwner = makeAddr("newOwner");

        // Transfer ownership
        timelockPiggyBank.transferOwnership(newOwner);

        // New owner should be able to pause
        vm.prank(newOwner);
        timelockPiggyBank.pause();
        assertTrue(timelockPiggyBank.paused());

        // New owner should be able to unpause
        vm.prank(newOwner);
        timelockPiggyBank.unpause();
        assertFalse(timelockPiggyBank.paused());

        // New owner should be able to rescue tokens (first mint some to contract)
        mockUSDC.mint(address(timelockPiggyBank), USDC_100);
        vm.prank(newOwner);
        timelockPiggyBank.rescueTokens(address(mockUSDC), USDC_100, newOwner);

        // New owner should be able to rescue ETH
        vm.deal(address(timelockPiggyBank), 1 ether);
        vm.prank(newOwner);
        timelockPiggyBank.rescueETH(newOwner);
    }

    function testOldOwnerCannotAccessAdminFunctionsAfterTransfer() public {
        address newOwner = makeAddr("newOwner");

        // Transfer ownership
        timelockPiggyBank.transferOwnership(newOwner);

        // Old owner should not be able to pause
        vm.expectRevert();
        timelockPiggyBank.pause();

        // Old owner should not be able to rescue tokens
        vm.expectRevert();
        timelockPiggyBank.rescueTokens(address(mockUSDC), USDC_100, owner);

        // Old owner should not be able to rescue ETH
        vm.deal(address(timelockPiggyBank), 1 ether);
        vm.expectRevert();
        timelockPiggyBank.rescueETH(owner);
    }

    function testOwnershipTransferWithActiveDeposits() public {
        address newOwner = makeAddr("newOwner");

        // Create some deposits
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);

        vm.prank(user1);
        timelockPiggyBank.depositETH{value: 1 ether}(LOCK_6_MONTHS);

        // Transfer ownership
        timelockPiggyBank.transferOwnership(newOwner);

        // Deposits should still be accessible
        assertEq(timelockPiggyBank.getUserDepositCount(user1), 2);
        assertEq(timelockPiggyBank.getTotalLockedAmount(user1), USDC_100 + 1 ether);

        // New owner should be able to access admin functions
        vm.prank(newOwner);
        timelockPiggyBank.pause();
    }

    function testTopUpAfterUnlockReverts() public {
        vm.startPrank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);
        timelockPiggyBank.depositETH{value: 1 ether}(LOCK_3_MONTHS);

        vm.warp(block.timestamp + LOCK_3_MONTHS);

        vm.expectRevert(TimelockPiggyBank.DepositAlreadyUnlocked.selector);
        timelockPiggyBank.topUpUSDC(0, USDC_100);

        vm.expectRevert(TimelockPiggyBank.DepositAlreadyUnlocked.selector);
        timelockPiggyBank.topUpETH{value: 1 ether}(1);
        vm.stopPrank();

        assertEq(timelockPiggyBank.getTotalLockedUSDC(user1), USDC_100);
        assertEq(timelockPiggyBank.totalReservedETH(), 1 ether);
    }

    function testRunningTotalsTrackDepositsTopUpsAndExits() public {
        vm.startPrank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_6_MONTHS);
        timelockPiggyBank.depositETH{value: 1 ether}(LOCK_3_MONTHS);
        timelockPiggyBank.topUpUSDC(1, USDC_100);
        vm.stopPrank();

        assertEq(timelockPiggyBank.getActiveDepositCount(user1), 3);
        assertEq(timelockPiggyBank.getTotalLockedUSDC(user1), USDC_100 * 3);
        assertEq(timelockPiggyBank.getTotalLockedETH(user1), 1 ether);

        vm.warp(block.timestamp + LOCK_3_MONTHS);
        vm.prank(user1);
        timelockPiggyBank.withdraw(0);
        timelockPiggyBank.adminSettleDeposit(user1, 2);

        assertEq(timelockPiggyBank.getActiveDepositCount(user1), 1);
        assertEq(timelockPiggyBank.getTotalLockedUSDC(user1), USDC_100 * 2);
        assertEq(timelockPiggyBank.getTotalLockedETH(user1), 0);
        assertEq(timelockPiggyBank.getActiveDepositCount(user2), 0);
    }

    function testGetDepositsPaginates() public {
        vm.startPrank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS);
        timelockPiggyBank.depositETH{value: 1 ether}(LOCK_6_MONTHS);
        timelockPiggyBank.depositUSDC(USDC_100 * 2, LOCK_12_MONTHS);
        vm.stopPrank();

        TimelockPiggyBank.Deposit[] memory all = timelockPiggyBank.getDeposits(user1, 0, 10);
        assertEq(all.length, 3);
        assertEq(all[1].amount, 1 ether);
        assertEq(uint256(all[1].assetType), uint256(TimelockPiggyBank.AssetType.ETH));

        TimelockPiggyBank.Deposit[] memory tail = timelockPiggyBank.getDeposits(user1, 1, 1);
        assertEq(tail.length, 1);
        assertEq(tail[0].lockDuration, LOCK_6_MONTHS);

        assertEq(timelockPiggyBank.getDeposits(user1, 3, 10).length, 0);
        assertEq(timelockPiggyBank.getDeposits(user1, 2, type(uint256).max).length, 1);
        assertEq(timelockPiggyBank.getDeposits(user2, 0, 10).length, 0);
    }

    function testCannotRenounceOwnershipWhilePaused() public {
        timelockPiggyBank.pause();

        vm.expectRevert(TimelockPiggyBank.ContractPaused.selector);
        timelockPiggyBank.renounceOwnership();

        assertEq(timelockPiggyBank.owner(), owner);
    }

    function testConstructorRejectsSameTokenForUSDCAndWBTC() public {
        vm.expectRevert(TimelockPiggyBank.InvalidTokenConfig.selector);
        new TimelockPiggyBank(address(mockUSDC), address(mockUSDC));
    }
}
