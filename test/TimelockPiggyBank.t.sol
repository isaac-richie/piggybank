// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/TimelockPiggyBank.sol";
import "../src/MockUSDC.sol";

contract TimelockPiggyBankTest is Test {
    TimelockPiggyBank public timelockPiggyBank;
    MockUSDC public mockUSDC;

    address public owner;
    address public user1;
    address public user2;

    // Lock durations in seconds
    uint256 public constant LOCK_3_MONTHS = 3 minutes;
    uint256 public constant LOCK_6_MONTHS = 6 minutes;
    uint256 public constant LOCK_9_MONTHS = 9 minutes;
    uint256 public constant LOCK_12_MONTHS = 12 minutes;

    // USDC amounts (6 decimals)
    uint256 public constant USDC_100 = 100 * 10 ** 6;
    uint256 public constant USDC_1000 = 1000 * 10 ** 6;

    event DepositCreated(
        address indexed user,
        uint256 indexed depositId,
        uint256 amount,
        uint256 lockDuration,
        address beneficiary
    );

    event DepositWithdrawn(
        address indexed user,
        uint256 indexed depositId,
        uint256 amount,
        address indexed to
    );

    event TokensRescued(
        address indexed token,
        uint256 amount,
        address indexed to
    );

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        // Deploy mock USDC
        mockUSDC = new MockUSDC();

        // Deploy TimelockPiggyBank
        timelockPiggyBank = new TimelockPiggyBank(address(mockUSDC));

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
        emit DepositCreated(user1, 0, USDC_100, LOCK_3_MONTHS, user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS, user1);

        // Check deposit was created
        TimelockPiggyBank.Deposit memory deposit = timelockPiggyBank.getDeposit(
            user1,
            0
        );
        assertEq(deposit.amount, USDC_100);
        assertEq(deposit.lockDuration, LOCK_3_MONTHS);
        assertEq(deposit.beneficiary, user1);
        assertEq(deposit.isWithdrawn, false);
        assertEq(deposit.isETH, false);

        // Check user deposit count
        assertEq(timelockPiggyBank.getUserDepositCount(user1), 1);

        // Check total locked amount
        assertEq(timelockPiggyBank.getTotalLockedAmount(user1), USDC_100);
    }

    function testInvalidLockDuration() public {
        vm.prank(user1);
        vm.expectRevert(TimelockPiggyBank.InvalidLockDuration.selector);
        timelockPiggyBank.depositUSDC(USDC_100, 30 days, user1);
    }

    function testZeroAmount() public {
        vm.prank(user1);
        vm.expectRevert(TimelockPiggyBank.ZeroAmount.selector);
        timelockPiggyBank.depositUSDC(0, LOCK_3_MONTHS, user1);
    }

    function testZeroAddressBeneficiary() public {
        vm.prank(user1);
        vm.expectRevert(TimelockPiggyBank.ZeroAddress.selector);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS, address(0));
    }

    function testMultipleDeposits() public {
        // First deposit
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS, user1);

        // Second deposit
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_6_MONTHS, user2);

        assertEq(timelockPiggyBank.getUserDepositCount(user1), 2);
        assertEq(timelockPiggyBank.getTotalLockedAmount(user1), USDC_100 * 2);
    }

    function testWithdrawBeforeUnlock() public {
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS, user1);

        vm.prank(user1);
        vm.expectRevert(TimelockPiggyBank.DepositNotUnlocked.selector);
        timelockPiggyBank.withdraw(0);
    }

    function testWithdrawAfterUnlock() public {
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS, user1);

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
        TimelockPiggyBank.Deposit memory deposit = timelockPiggyBank.getDeposit(
            user1,
            0
        );
        assertTrue(deposit.isWithdrawn);
    }

    function testDoubleWithdrawal() public {
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS, user1);

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
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS, user1);

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
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS, user1);

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
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS, user1);

        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_6_MONTHS, user1);

        // Initially no deposits are unlocked
        assertEq(timelockPiggyBank.getAvailableWithdrawalAmount(user1), 0);

        // Fast forward to unlock first deposit
        vm.warp(block.timestamp + LOCK_3_MONTHS + 1);
        assertEq(
            timelockPiggyBank.getAvailableWithdrawalAmount(user1),
            USDC_100
        );

        // Fast forward to unlock second deposit
        vm.warp(block.timestamp + (LOCK_6_MONTHS - LOCK_3_MONTHS));
        assertEq(
            timelockPiggyBank.getAvailableWithdrawalAmount(user1),
            USDC_100 * 2
        );
    }

    function testDepositWithDifferentBeneficiaries() public {
        // User1 deposits with user2 as beneficiary
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS, user2);

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
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS, user1);

        // Fast forward time
        vm.warp(block.timestamp + 91 days);

        // User2 tries to withdraw user1's deposit (user2 has no deposits)
        vm.prank(user2);
        vm.expectRevert(TimelockPiggyBank.DepositNotFound.selector);
        timelockPiggyBank.withdraw(0);
    }

    function testContractBalance() public {
        vm.prank(user1);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS, user1);

        assertEq(timelockPiggyBank.getContractBalance(), USDC_100);
    }

    function testAllLockDurations() public {
        uint256[] memory durations = timelockPiggyBank.getValidLockDurations();

        // Test each valid duration
        for (uint256 i = 0; i < durations.length; i++) {
            vm.prank(user1);
            timelockPiggyBank.depositUSDC(USDC_100, durations[i], user1);
        }

        assertEq(timelockPiggyBank.getUserDepositCount(user1), 4);
        assertEq(timelockPiggyBank.getTotalLockedAmount(user1), USDC_100 * 4);
    }

    // ============ ETH DEPOSIT TESTS ============

    function testValidETHDeposit() public {
        uint256 ethAmount = 1 ether;

        vm.prank(user1);
        vm.expectEmit(true, true, true, true);
        emit DepositCreated(user1, 0, ethAmount, LOCK_3_MONTHS, user1);
        timelockPiggyBank.depositETH{value: ethAmount}(LOCK_3_MONTHS, user1);

        // Check deposit was created
        TimelockPiggyBank.Deposit memory deposit = timelockPiggyBank.getDeposit(
            user1,
            0
        );
        assertEq(deposit.amount, ethAmount);
        assertEq(deposit.lockDuration, LOCK_3_MONTHS);
        assertEq(deposit.beneficiary, user1);
        assertEq(deposit.isWithdrawn, false);
        assertEq(deposit.isETH, true);

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
        timelockPiggyBank.depositETH{value: 0}(LOCK_3_MONTHS, user1);
    }

    function testETHDepositWithZeroBeneficiary() public {
        vm.prank(user1);
        vm.expectRevert(TimelockPiggyBank.ZeroAddress.selector);
        timelockPiggyBank.depositETH{value: 1 ether}(LOCK_3_MONTHS, address(0));
    }

    function testETHDepositWithInvalidLockDuration() public {
        vm.prank(user1);
        vm.expectRevert(TimelockPiggyBank.InvalidLockDuration.selector);
        timelockPiggyBank.depositETH{value: 1 ether}(30 days, user1);
    }

    function testETHWithdrawalAfterUnlock() public {
        uint256 ethAmount = 1 ether;

        vm.prank(user1);
        timelockPiggyBank.depositETH{value: ethAmount}(LOCK_3_MONTHS, user1);

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
        TimelockPiggyBank.Deposit memory deposit = timelockPiggyBank.getDeposit(
            user1,
            0
        );
        assertTrue(deposit.isWithdrawn);
    }

    function testETHForwardDeposit() public {
        uint256 ethAmount = 1 ether;

        vm.prank(user1);
        timelockPiggyBank.depositETH{value: ethAmount}(LOCK_3_MONTHS, user1);

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
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS, user1);

        // Deposit ETH
        vm.prank(user1);
        timelockPiggyBank.depositETH{value: 1 ether}(LOCK_6_MONTHS, user2);

        assertEq(timelockPiggyBank.getUserDepositCount(user1), 2);
        assertEq(
            timelockPiggyBank.getTotalLockedAmount(user1),
            USDC_100 + 1 ether
        );

        // Check both deposits
        TimelockPiggyBank.Deposit memory usdcDeposit = timelockPiggyBank
            .getDeposit(user1, 0);
        TimelockPiggyBank.Deposit memory ethDeposit = timelockPiggyBank
            .getDeposit(user1, 1);

        assertEq(usdcDeposit.amount, USDC_100);
        assertEq(usdcDeposit.isETH, false);
        assertEq(ethDeposit.amount, 1 ether);
        assertEq(ethDeposit.isETH, true);
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
        timelockPiggyBank.depositETH{value: ethAmount}(LOCK_3_MONTHS, user2);

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
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS, user1);

        vm.prank(user1);
        timelockPiggyBank.depositETH{value: 1 ether}(LOCK_6_MONTHS, user2);

        // Transfer ownership
        timelockPiggyBank.transferOwnership(newOwner);

        // Deposits should still be accessible
        assertEq(timelockPiggyBank.getUserDepositCount(user1), 2);
        assertEq(
            timelockPiggyBank.getTotalLockedAmount(user1),
            USDC_100 + 1 ether
        );

        // New owner should be able to access admin functions
        vm.prank(newOwner);
        timelockPiggyBank.pause();
    }
}
