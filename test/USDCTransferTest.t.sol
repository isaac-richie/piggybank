// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/TimelockPiggyBank.sol";
import "../src/MockUSDC.sol";

contract USDCTransferTest is Test {
    TimelockPiggyBank public timelockPiggyBank;
    MockUSDC public mockUSDC;

    address public owner;
    address public user;
    address public beneficiary;

    // Test amounts
    uint256 public constant USDC_10 = 10 * 10 ** 6; // 10 USDC (6 decimals)
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
        mockUSDC.mint(user, USDC_10 * 10); // Give user 100 USDC total

        // Give user some ETH for gas
        vm.deal(user, 1 ether);
    }

    function testSuccessfulUSDCTransfer() public {
        console.log("=== Testing Successful USDC Transfer ===");

        // Check initial balances
        uint256 initialUserBalance = mockUSDC.balanceOf(user);
        uint256 initialContractBalance = mockUSDC.balanceOf(
            address(timelockPiggyBank)
        );

        console.log("Initial user USDC balance:", initialUserBalance);
        console.log("Initial contract USDC balance:", initialContractBalance);

        // User approves the contract to spend USDC
        vm.prank(user);
        mockUSDC.approve(address(timelockPiggyBank), USDC_10);

        console.log("User approved contract to spend", USDC_10, "USDC");

        // Check allowance
        uint256 allowance = mockUSDC.allowance(
            user,
            address(timelockPiggyBank)
        );
        console.log("Allowance:", allowance);
        assertEq(allowance, USDC_10, "Allowance should be 10 USDC");

        // User deposits 10 USDC
        vm.prank(user);
        timelockPiggyBank.depositUSDC(USDC_10, LOCK_3_MONTHS, beneficiary);

        console.log("User deposited 10 USDC successfully");

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
            initialUserBalance - USDC_10,
            "User balance should decrease by 10 USDC"
        );
        assertEq(
            finalContractBalance,
            initialContractBalance + USDC_10,
            "Contract balance should increase by 10 USDC"
        );

        // Check deposit was recorded
        uint256 depositCount = timelockPiggyBank.getUserDepositCount(user);
        assertEq(depositCount, 1, "User should have 1 deposit");

        // Get deposit details
        TimelockPiggyBank.Deposit memory deposit = timelockPiggyBank.getDeposit(
            user,
            0
        );

        console.log("Deposit amount:", deposit.amount);
        console.log("Deposit lock duration:", deposit.lockDuration);
        console.log("Deposit beneficiary:", deposit.beneficiary);
        console.log("Is ETH deposit:", deposit.isETH);

        // Verify deposit details
        assertEq(deposit.amount, USDC_10, "Deposit amount should be 10 USDC");
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
        assertEq(totalLocked, USDC_10, "Total locked should be 10 USDC");

        console.log("USDC transfer test passed!");
    }

    function testUSDCTransferWithInsufficientAllowance() public {
        console.log(
            "=== Testing USDC Transfer with Insufficient Allowance ==="
        );

        // User approves less than needed
        vm.prank(user);
        mockUSDC.approve(address(timelockPiggyBank), USDC_10 / 2); // Only approve 5 USDC

        console.log("User approved only 5 USDC, trying to deposit 10 USDC");

        // This should fail
        vm.prank(user);
        vm.expectRevert(); // Should revert due to insufficient allowance
        timelockPiggyBank.depositUSDC(USDC_10, LOCK_3_MONTHS, beneficiary);

        console.log("Correctly failed with insufficient allowance");
    }

    function testUSDCTransferWithInsufficientBalance() public {
        console.log("=== Testing USDC Transfer with Insufficient Balance ===");

        // Give user only 5 USDC by transferring the rest away
        uint256 userBalance = mockUSDC.balanceOf(user);
        uint256 amountToTransfer = userBalance - (5 * 10 ** 6);

        vm.prank(user);
        mockUSDC.transfer(address(0x1), amountToTransfer);

        // User approves 10 USDC but only has 5
        vm.prank(user);
        mockUSDC.approve(address(timelockPiggyBank), USDC_10);

        console.log(
            "User has 5 USDC, approved 10 USDC, trying to deposit 10 USDC"
        );

        // This should fail due to insufficient balance
        vm.prank(user);
        vm.expectRevert(); // Should revert due to insufficient balance
        timelockPiggyBank.depositUSDC(USDC_10, LOCK_3_MONTHS, beneficiary);

        console.log("Correctly failed with insufficient balance");
    }

    function testUSDCTransferWithZeroAmount() public {
        console.log("=== Testing USDC Transfer with Zero Amount ===");

        // User approves some amount
        vm.prank(user);
        mockUSDC.approve(address(timelockPiggyBank), USDC_10);

        // Try to deposit 0 USDC
        vm.prank(user);
        vm.expectRevert(); // Should revert due to zero amount
        timelockPiggyBank.depositUSDC(0, LOCK_3_MONTHS, beneficiary);

        console.log("Correctly failed with zero amount");
    }

    function testUSDCTransferWithInvalidLockDuration() public {
        console.log("=== Testing USDC Transfer with Invalid Lock Duration ===");

        // User approves some amount
        vm.prank(user);
        mockUSDC.approve(address(timelockPiggyBank), USDC_10);

        // Try to deposit with invalid lock duration (not 3, 6, 9, or 12 months)
        vm.prank(user);
        vm.expectRevert(); // Should revert due to invalid lock duration
        timelockPiggyBank.depositUSDC(USDC_10, 30 days, beneficiary);

        console.log("Correctly failed with invalid lock duration");
    }

    function testUSDCTransferWithZeroBeneficiary() public {
        console.log("=== Testing USDC Transfer with Zero Beneficiary ===");

        // User approves some amount
        vm.prank(user);
        mockUSDC.approve(address(timelockPiggyBank), USDC_10);

        // Try to deposit with zero beneficiary
        vm.prank(user);
        vm.expectRevert(); // Should revert due to zero beneficiary
        timelockPiggyBank.depositUSDC(USDC_10, LOCK_3_MONTHS, address(0));

        console.log("Correctly failed with zero beneficiary");
    }

    function testMultipleUSDCTransfers() public {
        console.log("=== Testing Multiple USDC Transfers ===");

        // User approves enough for multiple deposits
        vm.prank(user);
        mockUSDC.approve(address(timelockPiggyBank), USDC_10 * 3);

        // First deposit
        vm.prank(user);
        timelockPiggyBank.depositUSDC(USDC_10, LOCK_3_MONTHS, beneficiary);

        // Second deposit
        vm.prank(user);
        timelockPiggyBank.depositUSDC(USDC_10, LOCK_6_MONTHS, beneficiary);

        // Third deposit
        vm.prank(user);
        timelockPiggyBank.depositUSDC(USDC_10, LOCK_9_MONTHS, beneficiary);

        // Check deposit count
        uint256 depositCount = timelockPiggyBank.getUserDepositCount(user);
        assertEq(depositCount, 3, "User should have 3 deposits");

        // Check total locked amount
        uint256 totalLocked = timelockPiggyBank.getTotalLockedAmount(user);
        assertEq(totalLocked, USDC_10 * 3, "Total locked should be 30 USDC");

        console.log("Multiple USDC transfers test passed!");
    }
}
