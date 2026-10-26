// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/TimelockPiggyBank.sol";
import "../src/MockUSDC.sol";
import "../src/MockWBTC.sol";

/// Drives random deposits, top-ups, time jumps, withdrawals and admin settlements.
contract VaultHandler is Test {
    TimelockPiggyBank public vault;
    MockUSDC public usdc;
    MockWBTC public wbtc;
    address public admin;
    address[] public users;

    constructor(TimelockPiggyBank _vault, MockUSDC _usdc, MockWBTC _wbtc, address _admin) {
        vault = _vault;
        usdc = _usdc;
        wbtc = _wbtc;
        admin = _admin;
        for (uint256 i = 0; i < 3; i++) {
            address user = makeAddr(string.concat("user", vm.toString(i)));
            users.push(user);
            vm.deal(user, 1_000 ether);
            usdc.mint(user, 1e15);
            wbtc.mint(user, 1e15);
            vm.startPrank(user);
            usdc.approve(address(vault), type(uint256).max);
            wbtc.approve(address(vault), type(uint256).max);
            vm.stopPrank();
        }
    }

    function _user(uint256 seed) internal view returns (address) {
        return users[seed % users.length];
    }

    function _duration(uint256 seed) internal pure returns (uint256) {
        return [uint256(90 days), 180 days, 270 days, 360 days][seed % 4];
    }

    function deposit(uint256 userSeed, uint256 assetSeed, uint256 amount, uint256 durationSeed) external {
        address user = _user(userSeed);
        uint256 lock = _duration(durationSeed);
        vm.startPrank(user);
        uint256 asset = assetSeed % 3;
        if (asset == 0) vault.depositUSDC(bound(amount, 1, 1e12), lock);
        else if (asset == 1) vault.depositETH{value: bound(amount, 1, 10 ether)}(lock);
        else vault.depositWBTC(bound(amount, 1, 1e10), lock);
        vm.stopPrank();
    }

    function topUp(uint256 userSeed, uint256 idSeed, uint256 amount) external {
        address user = _user(userSeed);
        uint256 count = vault.userDepositCount(user);
        if (count == 0) return;
        uint256 id = idSeed % count;
        TimelockPiggyBank.Deposit memory d = vault.getDeposit(user, id);
        if (d.isWithdrawn || block.timestamp >= d.depositTime + d.lockDuration) return;

        vm.startPrank(user);
        if (d.assetType == TimelockPiggyBank.AssetType.USDC) vault.topUpUSDC(id, bound(amount, 1, 1e12));
        else if (d.assetType == TimelockPiggyBank.AssetType.ETH) vault.topUpETH{value: bound(amount, 1, 10 ether)}(id);
        else vault.topUpWBTC(id, bound(amount, 1, 1e10));
        vm.stopPrank();
    }

    function warp(uint256 secondsAhead) external {
        vm.warp(block.timestamp + bound(secondsAhead, 1 hours, 200 days));
    }

    function withdraw(uint256 userSeed, uint256 idSeed) external {
        address user = _user(userSeed);
        uint256 count = vault.userDepositCount(user);
        if (count == 0) return;
        uint256 id = idSeed % count;
        TimelockPiggyBank.Deposit memory d = vault.getDeposit(user, id);
        if (d.isWithdrawn || block.timestamp < d.depositTime + d.lockDuration) return;
        vm.prank(user);
        vault.withdraw(id);
    }

    function settle(uint256 userSeed, uint256 idSeed) external {
        address user = _user(userSeed);
        uint256 count = vault.userDepositCount(user);
        if (count == 0) return;
        uint256 id = idSeed % count;
        if (vault.getDeposit(user, id).isWithdrawn) return;
        vm.prank(admin);
        vault.adminSettleDeposit(user, id);
    }

    function userCount() external view returns (uint256) {
        return users.length;
    }
}

contract VaultInvariantTest is Test {
    TimelockPiggyBank vault;
    MockUSDC usdc;
    MockWBTC wbtc;
    VaultHandler handler;

    function setUp() public {
        usdc = new MockUSDC();
        wbtc = new MockWBTC();
        vault = new TimelockPiggyBank(address(usdc), address(wbtc));
        handler = new VaultHandler(vault, usdc, wbtc, address(this));
        targetContract(address(handler));
    }

    function invariant_vaultCoversEveryReserve() public view {
        assertGe(usdc.balanceOf(address(vault)), vault.totalReservedUSDC());
        assertGe(wbtc.balanceOf(address(vault)), vault.totalReservedWBTC());
        assertGe(address(vault).balance, vault.totalReservedETH());
    }

    function invariant_userTotalsMatchReservesAndDeposits() public view {
        uint256 usdcSum;
        uint256 ethSum;
        uint256 wbtcSum;
        for (uint256 u = 0; u < handler.userCount(); u++) {
            address user = handler.users(u);
            uint256 count = vault.userDepositCount(user);
            uint256 active;
            uint256[3] memory locked;
            for (uint256 i = 0; i < count; i++) {
                TimelockPiggyBank.Deposit memory d = vault.getDeposit(user, i);
                if (d.isWithdrawn) continue;
                active++;
                locked[uint256(d.assetType)] += d.amount;
            }
            assertEq(vault.getActiveDepositCount(user), active);
            assertEq(vault.getTotalLockedUSDC(user), locked[0]);
            assertEq(vault.getTotalLockedETH(user), locked[1]);
            assertEq(vault.getTotalLockedWBTC(user), locked[2]);
            usdcSum += locked[0];
            ethSum += locked[1];
            wbtcSum += locked[2];
        }
        assertEq(vault.totalReservedUSDC(), usdcSum);
        assertEq(vault.totalReservedETH(), ethSum);
        assertEq(vault.totalReservedWBTC(), wbtcSum);
    }

    receive() external payable {}
}
