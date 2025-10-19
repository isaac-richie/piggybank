// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/TimelockPiggyBank.sol";
import "../src/MockUSDC.sol";

contract DepositWithdrawalTest is Test {
    TimelockPiggyBank public timelockPiggyBank;
    MockUSDC public mockUSDC;

    address public owner;
    address public user;
    address public beneficiary;

    // Test amounts
    uint256 public constant USDC_100 = 100 * 10 ** 6; // 100 USDC (6 decimals)
    uint256 public constant USDC_50 = 50 * 10 ** 6; // 50 USDC (6 decimals)
    uint256 public constant USDC_10 = 10 * 10 ** 6; // 10 USDC (6 decimals)

    // Lock durations
    uint256 public constant LOCK_3_MONTHS = 3 minutes;
    uint256 public constant LOCK_6_MONTHS = 6 minutes;
    uint256 public constant LOCK_9_MONTHS = 9 minutes;
    uint256 public constant LOCK_12_MONTHS = 12 minutes;

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

    function setUp() public {
        // Deploy MockUSDC
        mockUSDC = new MockUSDC();

        // Deploy TimelockPiggyBank with MockUSDC
        timelockPiggyBank = new TimelockPiggyBank(address(mockUSDC));

        // Set up addresses
        owner = address(this);
        user = makeAddr("user");
        beneficiary = makeAddr("beneficiary");

        // Give user some USDC
        mockUSDC.mint(user, USDC_100 * 10); // Give user 1000 USDC total

        // Give user some ETH for gas
        vm.deal(user, 1 ether);
    }

    function testDepositUSDC() public {
        console.log("=== Testing USDC Deposit ===");

        // Check initial state
        uint256 initialUserBalance = mockUSDC.balanceOf(user);
        uint256 initialContractBalance = mockUSDC.balanceOf(
            address(timelockPiggyBank)
        );
        uint256 initialDepositCount = timelockPiggyBank.getUserDepositCount(
            user
        );

        console.log("Initial user USDC balance:", initialUserBalance);
        console.log("Initial contract USDC balance:", initialContractBalance);
        console.log("Initial deposit count:", initialDepositCount);

        // User approves the contract to spend USDC
        vm.prank(user);
        mockUSDC.approve(address(timelockPiggyBank), USDC_100);

        // User deposits 100 USDC
        vm.prank(user);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS, beneficiary);

        // Check final state
        uint256 finalUserBalance = mockUSDC.balanceOf(user);
        uint256 finalContractBalance = mockUSDC.balanceOf(
            address(timelockPiggyBank)
        );
        uint256 finalDepositCount = timelockPiggyBank.getUserDepositCount(user);

        console.log("Final user USDC balance:", finalUserBalance);
        console.log("Final contract USDC balance:", finalContractBalance);
        console.log("Final deposit count:", finalDepositCount);

        // Verify balances
        assertEq(
            finalUserBalance,
            initialUserBalance - USDC_100,
            "User balance should decrease by 100 USDC"
        );
        assertEq(
            finalContractBalance,
            initialContractBalance + USDC_100,
            "Contract balance should increase by 100 USDC"
        );
        assertEq(
            finalDepositCount,
            initialDepositCount + 1,
            "Deposit count should increase by 1"
        );

        // Verify deposit details
        TimelockPiggyBank.Deposit memory deposit = timelockPiggyBank.getDeposit(
            user,
            0
        );
        assertEq(deposit.amount, USDC_100, "Deposit amount should be 100 USDC");
        assertEq(
            deposit.lockDuration,
            LOCK_3_MONTHS,
            "Lock duration should be 3 months"
        );
        assertEq(deposit.beneficiary, beneficiary, "Beneficiary should match");
        assertEq(deposit.isWithdrawn, false, "Deposit should not be withdrawn");
        assertEq(deposit.isETH, false, "Should not be ETH deposit");

        // Check total locked amount
        uint256 totalLocked = timelockPiggyBank.getTotalLockedAmount(user);
        assertEq(totalLocked, USDC_100, "Total locked should be 100 USDC");

        console.log("USDC deposit test passed!");
    }

    function testDepositETH() public {
        console.log("=== Testing ETH Deposit ===");

        // Check initial state
        uint256 initialUserETH = user.balance;
        uint256 initialContractETH = address(timelockPiggyBank).balance;
        uint256 initialDepositCount = timelockPiggyBank.getUserDepositCount(
            user
        );

        console.log("Initial user ETH balance:", initialUserETH);
        console.log("Initial contract ETH balance:", initialContractETH);
        console.log("Initial deposit count:", initialDepositCount);

        // User deposits 1 ETH
        vm.prank(user);
        timelockPiggyBank.depositETH{value: 1 ether}(
            LOCK_6_MONTHS,
            beneficiary
        );

        // Check final state
        uint256 finalUserETH = user.balance;
        uint256 finalContractETH = address(timelockPiggyBank).balance;
        uint256 finalDepositCount = timelockPiggyBank.getUserDepositCount(user);

        console.log("Final user ETH balance:", finalUserETH);
        console.log("Final contract ETH balance:", finalContractETH);
        console.log("Final deposit count:", finalDepositCount);

        // Verify balances
        assertEq(
            finalUserETH,
            initialUserETH - 1 ether,
            "User ETH should decrease by 1 ETH"
        );
        assertEq(
            finalContractETH,
            initialContractETH + 1 ether,
            "Contract ETH should increase by 1 ETH"
        );
        assertEq(
            finalDepositCount,
            initialDepositCount + 1,
            "Deposit count should increase by 1"
        );

        // Verify deposit details
        TimelockPiggyBank.Deposit memory deposit = timelockPiggyBank.getDeposit(
            user,
            0
        );
        assertEq(deposit.amount, 1 ether, "Deposit amount should be 1 ETH");
        assertEq(
            deposit.lockDuration,
            LOCK_6_MONTHS,
            "Lock duration should be 6 months"
        );
        assertEq(deposit.beneficiary, beneficiary, "Beneficiary should match");
        assertEq(deposit.isWithdrawn, false, "Deposit should not be withdrawn");
        assertEq(deposit.isETH, true, "Should be ETH deposit");

        console.log("ETH deposit test passed!");
    }

    function testWithdrawUSDCAfterUnlock() public {
        console.log("=== Testing USDC Withdrawal After Unlock ===");

        // User deposits USDC
        vm.prank(user);
        mockUSDC.approve(address(timelockPiggyBank), USDC_100);
        vm.prank(user);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS, beneficiary);

        // Fast forward time to after unlock
        vm.warp(block.timestamp + LOCK_3_MONTHS + 1);

        // Check initial balances
        uint256 initialUserBalance = mockUSDC.balanceOf(user);
        uint256 initialContractBalance = mockUSDC.balanceOf(
            address(timelockPiggyBank)
        );

        console.log("Initial user USDC balance:", initialUserBalance);
        console.log("Initial contract USDC balance:", initialContractBalance);

        // User withdraws
        vm.prank(user);
        timelockPiggyBank.withdraw(0);

        // Check final balances
        uint256 finalUserBalance = mockUSDC.balanceOf(user);
        uint256 finalContractBalance = mockUSDC.balanceOf(
            address(timelockPiggyBank)
        );

        console.log("Final user USDC balance:", finalUserBalance);
        console.log("Final contract USDC balance:", finalContractBalance);

        // Verify balances
        assertEq(
            finalUserBalance,
            initialUserBalance + USDC_100,
            "User balance should increase by 100 USDC"
        );
        assertEq(
            finalContractBalance,
            initialContractBalance - USDC_100,
            "Contract balance should decrease by 100 USDC"
        );

        // Verify deposit is marked as withdrawn
        TimelockPiggyBank.Deposit memory deposit = timelockPiggyBank.getDeposit(
            user,
            0
        );
        assertEq(
            deposit.isWithdrawn,
            true,
            "Deposit should be marked as withdrawn"
        );

        console.log("USDC withdrawal test passed!");
    }

    function testWithdrawETHAfterUnlock() public {
        console.log("=== Testing ETH Withdrawal After Unlock ===");

        // User deposits ETH
        vm.prank(user);
        timelockPiggyBank.depositETH{value: 1 ether}(
            LOCK_6_MONTHS,
            beneficiary
        );

        // Fast forward time to after unlock
        vm.warp(block.timestamp + LOCK_6_MONTHS + 1);

        // Check initial balances
        uint256 initialUserETH = user.balance;
        uint256 initialContractETH = address(timelockPiggyBank).balance;

        console.log("Initial user ETH balance:", initialUserETH);
        console.log("Initial contract ETH balance:", initialContractETH);

        // User withdraws
        vm.prank(user);
        timelockPiggyBank.withdraw(0);

        // Check final balances
        uint256 finalUserETH = user.balance;
        uint256 finalContractETH = address(timelockPiggyBank).balance;

        console.log("Final user ETH balance:", finalUserETH);
        console.log("Final contract ETH balance:", finalContractETH);

        // Verify balances
        assertEq(
            finalUserETH,
            initialUserETH + 1 ether,
            "User ETH should increase by 1 ETH"
        );
        assertEq(
            finalContractETH,
            initialContractETH - 1 ether,
            "Contract ETH should decrease by 1 ETH"
        );

        // Verify deposit is marked as withdrawn
        TimelockPiggyBank.Deposit memory deposit = timelockPiggyBank.getDeposit(
            user,
            0
        );
        assertEq(
            deposit.isWithdrawn,
            true,
            "Deposit should be marked as withdrawn"
        );

        console.log("ETH withdrawal test passed!");
    }

    function testWithdrawBeforeUnlock() public {
        console.log("=== Testing Withdrawal Before Unlock (Should Fail) ===");

        // User deposits USDC
        vm.prank(user);
        mockUSDC.approve(address(timelockPiggyBank), USDC_100);
        vm.prank(user);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS, beneficiary);

        // Try to withdraw before unlock (should fail)
        vm.prank(user);
        vm.expectRevert(); // Should revert because not unlocked
        timelockPiggyBank.withdraw(0);

        console.log("Correctly failed to withdraw before unlock");
    }

    function testForwardDeposit() public {
        console.log("=== Testing Forward Deposit ===");

        address forwardTo = makeAddr("forwardTo");

        // User deposits USDC
        vm.prank(user);
        mockUSDC.approve(address(timelockPiggyBank), USDC_100);
        vm.prank(user);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS, beneficiary);

        // Fast forward time to after unlock
        vm.warp(block.timestamp + LOCK_3_MONTHS + 1);

        // Check initial balances
        uint256 initialForwardToBalance = mockUSDC.balanceOf(forwardTo);
        uint256 initialContractBalance = mockUSDC.balanceOf(
            address(timelockPiggyBank)
        );

        console.log("Initial forwardTo USDC balance:", initialForwardToBalance);
        console.log("Initial contract USDC balance:", initialContractBalance);

        // User forwards deposit
        vm.prank(user);
        timelockPiggyBank.forwardDeposit(0, forwardTo);

        // Check final balances
        uint256 finalForwardToBalance = mockUSDC.balanceOf(forwardTo);
        uint256 finalContractBalance = mockUSDC.balanceOf(
            address(timelockPiggyBank)
        );

        console.log("Final forwardTo USDC balance:", finalForwardToBalance);
        console.log("Final contract USDC balance:", finalContractBalance);

        // Verify balances
        assertEq(
            finalForwardToBalance,
            initialForwardToBalance + USDC_100,
            "ForwardTo balance should increase by 100 USDC"
        );
        assertEq(
            finalContractBalance,
            initialContractBalance - USDC_100,
            "Contract balance should decrease by 100 USDC"
        );

        // Verify deposit is marked as withdrawn
        TimelockPiggyBank.Deposit memory deposit = timelockPiggyBank.getDeposit(
            user,
            0
        );
        assertEq(
            deposit.isWithdrawn,
            true,
            "Deposit should be marked as withdrawn"
        );

        console.log("Forward deposit test passed!");
    }

    function testMultipleDepositsAndWithdrawals() public {
        console.log("=== Testing Multiple Deposits and Withdrawals ===");

        // First deposit - USDC
        vm.prank(user);
        mockUSDC.approve(address(timelockPiggyBank), USDC_100);
        vm.prank(user);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS, beneficiary);

        // Second deposit - ETH
        vm.prank(user);
        timelockPiggyBank.depositETH{value: 1 ether}(
            LOCK_6_MONTHS,
            beneficiary
        );

        // Third deposit - USDC
        vm.prank(user);
        mockUSDC.approve(address(timelockPiggyBank), USDC_50);
        vm.prank(user);
        timelockPiggyBank.depositUSDC(USDC_50, LOCK_9_MONTHS, beneficiary);

        // Check deposit count
        uint256 depositCount = timelockPiggyBank.getUserDepositCount(user);
        assertEq(depositCount, 3, "User should have 3 deposits");

        // Fast forward to unlock first deposit
        vm.warp(block.timestamp + LOCK_3_MONTHS + 1);

        // Withdraw first deposit
        vm.prank(user);
        timelockPiggyBank.withdraw(0);

        // Check that first deposit is withdrawn
        TimelockPiggyBank.Deposit memory deposit0 = timelockPiggyBank
            .getDeposit(user, 0);
        assertEq(
            deposit0.isWithdrawn,
            true,
            "First deposit should be withdrawn"
        );

        // Check that other deposits are not withdrawn
        TimelockPiggyBank.Deposit memory deposit1 = timelockPiggyBank
            .getDeposit(user, 1);
        TimelockPiggyBank.Deposit memory deposit2 = timelockPiggyBank
            .getDeposit(user, 2);
        assertEq(
            deposit1.isWithdrawn,
            false,
            "Second deposit should not be withdrawn"
        );
        assertEq(
            deposit2.isWithdrawn,
            false,
            "Third deposit should not be withdrawn"
        );

        console.log("Multiple deposits and withdrawals test passed!");
    }

    function testIsDepositUnlocked() public {
        console.log("=== Testing IsDepositUnlocked Function ===");

        // User deposits USDC
        vm.prank(user);
        mockUSDC.approve(address(timelockPiggyBank), USDC_100);
        vm.prank(user);
        timelockPiggyBank.depositUSDC(USDC_100, LOCK_3_MONTHS, beneficiary);

        // Check if deposit is unlocked before time
        bool isUnlockedBefore = timelockPiggyBank.isDepositUnlocked(user, 0);
        assertEq(
            isUnlockedBefore,
            false,
            "Deposit should not be unlocked before time"
        );

        // Fast forward time to after unlock
        vm.warp(block.timestamp + LOCK_3_MONTHS + 1);

        // Check if deposit is unlocked after time
        bool isUnlockedAfter = timelockPiggyBank.isDepositUnlocked(user, 0);
        assertEq(
            isUnlockedAfter,
            true,
            "Deposit should be unlocked after time"
        );

        console.log("IsDepositUnlocked test passed!");
    }
}
