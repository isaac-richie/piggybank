// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/utils/Pausable.sol";

/**
 * @title TimelockPiggyBank
 * @dev A secure timelock contract for USDC deposits with multiple lock durations
 * @notice Users can deposit USDC for 3, 6, 9, or 12 months and withdraw after unlock
 */
contract TimelockPiggyBank is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // Lock duration options in seconds (converted from minutes)
    uint256 public constant LOCK_3_MONTHS = 3 minutes; // 3 minutes
    uint256 public constant LOCK_6_MONTHS = 6 minutes; // 6 minutes
    uint256 public constant LOCK_9_MONTHS = 9 minutes; // 9 minutes
    uint256 public constant LOCK_12_MONTHS = 12 minutes; // 12 minutes

    // Token contracts
    IERC20 public immutable usdcToken;
    IERC20 public immutable wbtcToken;

    // Asset types
    enum AssetType {
        USDC,
        ETH,
        WBTC
    }

    // Deposit structure
    struct Deposit {
        uint256 amount;
        uint256 lockDuration;
        uint256 depositTime;
        bool isWithdrawn;
        AssetType assetType;
    }

    // Mapping from user to their deposits
    mapping(address => mapping(uint256 => Deposit)) public userDeposits;
    mapping(address => uint256) public userDepositCount;

    // Whitelist mapping
    mapping(address => bool) public isWhitelisted;
    bool public whitelistEnabled;

    // Events
    event DepositCreated(address indexed user, uint256 indexed depositId, uint256 amount, uint256 lockDuration);

    event DepositToppedUp(address indexed user, uint256 indexed depositId, uint256 amount, uint256 newTotal);

    event DepositWithdrawn(address indexed user, uint256 indexed depositId, uint256 amount, address indexed to);

    event DepositForwarded(address indexed user, uint256 indexed depositId, uint256 amount, address indexed to);

    event TokensRescued(address indexed token, uint256 amount, address indexed to);

    event UserWhitelisted(address indexed user);
    event UserRemovedFromWhitelist(address indexed user);
    event WhitelistEnabled();
    event WhitelistDisabled();

    // Errors
    error InvalidLockDuration();
    error DepositNotFound();
    error DepositAlreadyWithdrawn();
    error DepositNotUnlocked();
    error InsufficientBalance();
    error ZeroAmount();
    error ZeroAddress();
    error InvalidDepositId();
    error NotWhitelisted();

    /**
     * @dev Constructor
     * @param _usdcToken Address of the USDC token contract
     * @param _wbtcToken Address of the WBTC token contract
     */
    constructor(address _usdcToken, address _wbtcToken) Ownable(msg.sender) {
        if (_usdcToken == address(0)) revert ZeroAddress();
        if (_wbtcToken == address(0)) revert ZeroAddress();
        usdcToken = IERC20(_usdcToken);
        wbtcToken = IERC20(_wbtcToken);
        whitelistEnabled = false; // Whitelist disabled by default
    }

    /**
     * @dev Modifier to check if user is whitelisted (if whitelist is enabled)
     */
    modifier onlyWhitelisted() {
        if (whitelistEnabled && !isWhitelisted[msg.sender]) {
            revert NotWhitelisted();
        }
        _;
    }

    /**
     * @dev Deposit USDC into the contract with a specific lock duration
     * @param amount Amount of USDC to deposit (in 6 decimals)
     * @param lockDuration Lock duration in seconds (must be one of the valid durations)
     */
    function depositUSDC(uint256 amount, uint256 lockDuration) external nonReentrant whenNotPaused onlyWhitelisted {
        if (amount == 0) revert ZeroAmount();
        if (!isValidLockDuration(lockDuration)) revert InvalidLockDuration();

        // Transfer USDC from user to contract
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);

        // Create deposit record
        uint256 depositId = userDepositCount[msg.sender];
        userDeposits[msg.sender][depositId] = Deposit({
            amount: amount,
            lockDuration: lockDuration,
            depositTime: block.timestamp,
            isWithdrawn: false,
            assetType: AssetType.USDC
        });

        userDepositCount[msg.sender]++;

        emit DepositCreated(msg.sender, depositId, amount, lockDuration);
    }

    /**
     * @dev Deposit ETH into the contract with a specific lock duration
     * @param lockDuration Lock duration in seconds (must be one of the valid durations)
     */
    function depositETH(uint256 lockDuration) external payable nonReentrant whenNotPaused onlyWhitelisted {
        if (msg.value == 0) revert ZeroAmount();
        if (!isValidLockDuration(lockDuration)) revert InvalidLockDuration();

        // Create deposit record
        uint256 depositId = userDepositCount[msg.sender];
        userDeposits[msg.sender][depositId] = Deposit({
            amount: msg.value,
            lockDuration: lockDuration,
            depositTime: block.timestamp,
            isWithdrawn: false,
            assetType: AssetType.ETH
        });

        userDepositCount[msg.sender]++;

        emit DepositCreated(msg.sender, depositId, msg.value, lockDuration);
    }

    /**
     * @dev Deposit WBTC into the contract with a specific lock duration
     * @param amount Amount of WBTC to deposit (in 8 decimals)
     * @param lockDuration Lock duration in seconds (must be one of the valid durations)
     */
    function depositWBTC(uint256 amount, uint256 lockDuration) external nonReentrant whenNotPaused onlyWhitelisted {
        if (amount == 0) revert ZeroAmount();
        if (!isValidLockDuration(lockDuration)) revert InvalidLockDuration();

        // Transfer WBTC from user to contract
        wbtcToken.safeTransferFrom(msg.sender, address(this), amount);

        // Create deposit record
        uint256 depositId = userDepositCount[msg.sender];
        userDeposits[msg.sender][depositId] = Deposit({
            amount: amount,
            lockDuration: lockDuration,
            depositTime: block.timestamp,
            isWithdrawn: false,
            assetType: AssetType.WBTC
        });

        userDepositCount[msg.sender]++;

        emit DepositCreated(msg.sender, depositId, amount, lockDuration);
    }

    /**
     * @dev Top up an existing USDC deposit
     * @param depositId ID of the deposit to top up
     * @param amount Amount of USDC to add
     */
    function topUpUSDC(uint256 depositId, uint256 amount) external nonReentrant whenNotPaused onlyWhitelisted {
        if (amount == 0) revert ZeroAmount();

        Deposit storage depositInfo = userDeposits[msg.sender][depositId];
        if (depositInfo.amount == 0) revert DepositNotFound();
        if (depositInfo.isWithdrawn) revert DepositAlreadyWithdrawn();
        if (depositInfo.assetType != AssetType.USDC) revert InvalidDepositId();

        // Transfer USDC from user to contract
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);

        // Update deposit amount
        depositInfo.amount += amount;

        emit DepositToppedUp(msg.sender, depositId, amount, depositInfo.amount);
    }

    /**
     * @dev Top up an existing ETH deposit
     * @param depositId ID of the deposit to top up
     */
    function topUpETH(uint256 depositId) external payable nonReentrant whenNotPaused onlyWhitelisted {
        if (msg.value == 0) revert ZeroAmount();

        Deposit storage depositInfo = userDeposits[msg.sender][depositId];
        if (depositInfo.amount == 0) revert DepositNotFound();
        if (depositInfo.isWithdrawn) revert DepositAlreadyWithdrawn();
        if (depositInfo.assetType != AssetType.ETH) revert InvalidDepositId();

        // Update deposit amount
        depositInfo.amount += msg.value;

        emit DepositToppedUp(msg.sender, depositId, msg.value, depositInfo.amount);
    }

    /**
     * @dev Top up an existing WBTC deposit
     * @param depositId ID of the deposit to top up
     * @param amount Amount of WBTC to add (in 8 decimals)
     */
    function topUpWBTC(uint256 depositId, uint256 amount) external nonReentrant whenNotPaused onlyWhitelisted {
        if (amount == 0) revert ZeroAmount();

        Deposit storage depositInfo = userDeposits[msg.sender][depositId];
        if (depositInfo.amount == 0) revert DepositNotFound();
        if (depositInfo.isWithdrawn) revert DepositAlreadyWithdrawn();
        if (depositInfo.assetType != AssetType.WBTC) revert InvalidDepositId();

        // Transfer WBTC from user to contract
        wbtcToken.safeTransferFrom(msg.sender, address(this), amount);

        // Update deposit amount
        depositInfo.amount += amount;

        emit DepositToppedUp(msg.sender, depositId, amount, depositInfo.amount);
    }

    /**
     * @dev Fallback function to receive ETH
     */
    receive() external payable {
        // ETH sent directly to contract without calling depositETH
        // This will be handled by admin rescue function
    }

    /**
     * @dev Withdraw a specific deposit after it's unlocked
     * @param depositId ID of the deposit to withdraw
     */
    function withdraw(uint256 depositId) external nonReentrant whenNotPaused {
        _withdraw(msg.sender, depositId, msg.sender);
    }

    /**
     * @dev Forward a specific deposit to another address after it's unlocked
     * @param depositId ID of the deposit to forward
     * @param to Address to forward the deposit to
     */
    function forwardDeposit(uint256 depositId, address to) external nonReentrant whenNotPaused {
        if (to == address(0)) revert ZeroAddress();
        _withdraw(msg.sender, depositId, to);
    }

    /**
     * @dev Internal function to handle withdrawals
     * @param user Address of the user who made the deposit
     * @param depositId ID of the deposit to withdraw
     * @param to Address to send the funds to
     */
    function _withdraw(address user, uint256 depositId, address to) internal {
        Deposit storage depositInfo = userDeposits[user][depositId];

        if (depositInfo.amount == 0) revert DepositNotFound();
        if (depositInfo.isWithdrawn) revert DepositAlreadyWithdrawn();
        if (msg.sender != user) revert InvalidDepositId();

        uint256 unlockTime = depositInfo.depositTime + depositInfo.lockDuration;
        if (block.timestamp < unlockTime) revert DepositNotUnlocked();

        // Mark as withdrawn
        depositInfo.isWithdrawn = true;

        // Transfer funds to beneficiary based on asset type
        if (depositInfo.assetType == AssetType.ETH) {
            // Transfer ETH
            (bool success,) = payable(to).call{value: depositInfo.amount}("");
            if (!success) revert InsufficientBalance();
        } else if (depositInfo.assetType == AssetType.USDC) {
            // Transfer USDC
            usdcToken.safeTransfer(to, depositInfo.amount);
        } else if (depositInfo.assetType == AssetType.WBTC) {
            // Transfer WBTC
            wbtcToken.safeTransfer(to, depositInfo.amount);
        }

        emit DepositWithdrawn(user, depositId, depositInfo.amount, to);
    }

    /**
     * @dev Check if a deposit is unlocked
     * @param user Address of the user who made the deposit
     * @param depositId ID of the deposit to check
     * @return True if the deposit is unlocked
     */
    function isDepositUnlocked(address user, uint256 depositId) external view returns (bool) {
        Deposit memory depositInfo = userDeposits[user][depositId];
        if (depositInfo.amount == 0) return false;

        uint256 unlockTime = depositInfo.depositTime + depositInfo.lockDuration;
        return block.timestamp >= unlockTime;
    }

    /**
     * @dev Get deposit information
     * @param user Address of the user who made the deposit
     * @param depositId ID of the deposit
     * @return Deposit information
     */
    function getDeposit(address user, uint256 depositId) external view returns (Deposit memory) {
        return userDeposits[user][depositId];
    }

    /**
     * @dev Get user's total deposit count
     * @param user Address of the user
     * @return Total number of deposits made by the user
     */
    function getUserDepositCount(address user) external view returns (uint256) {
        return userDepositCount[user];
    }

    /**
     * @dev Check if a lock duration is valid
     * @param lockDuration Lock duration in seconds
     * @return True if the lock duration is valid
     */
    function isValidLockDuration(uint256 lockDuration) public pure returns (bool) {
        return lockDuration == LOCK_3_MONTHS || lockDuration == LOCK_6_MONTHS || lockDuration == LOCK_9_MONTHS
            || lockDuration == LOCK_12_MONTHS;
    }

    /**
     * @dev Get all valid lock durations
     * @return Array of valid lock durations in seconds
     */
    function getValidLockDurations() external pure returns (uint256[] memory) {
        uint256[] memory durations = new uint256[](4);
        durations[0] = LOCK_3_MONTHS;
        durations[1] = LOCK_6_MONTHS;
        durations[2] = LOCK_9_MONTHS;
        durations[3] = LOCK_12_MONTHS;
        return durations;
    }

    /**
     * @dev Rescue accidentally sent tokens (owner only)
     * @param token Address of the token to rescue
     * @param amount Amount of tokens to rescue
     * @param to Address to send the rescued tokens to
     */
    function rescueTokens(address token, uint256 amount, address to) external onlyOwner {
        if (token == address(0)) revert ZeroAddress();
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        IERC20(token).safeTransfer(to, amount);
        emit TokensRescued(token, amount, to);
    }

    /**
     * @dev Rescue accidentally sent ETH (owner only)
     * @param to Address to send the rescued ETH to
     */
    function rescueETH(address to) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();

        uint256 balance = address(this).balance;
        if (balance == 0) revert ZeroAmount();

        (bool success,) = payable(to).call{value: balance}("");
        if (!success) revert InsufficientBalance();

        emit TokensRescued(address(0), balance, to);
    }

    /**
     * @dev Pause the contract (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Add a user to the whitelist (owner only)
     * @param user Address to whitelist
     */
    function addToWhitelist(address user) external onlyOwner {
        if (user == address(0)) revert ZeroAddress();
        isWhitelisted[user] = true;
        emit UserWhitelisted(user);
    }

    /**
     * @dev Add multiple users to the whitelist (owner only)
     * @param users Array of addresses to whitelist
     */
    function addMultipleToWhitelist(address[] calldata users) external onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            if (users[i] != address(0)) {
                isWhitelisted[users[i]] = true;
                emit UserWhitelisted(users[i]);
            }
        }
    }

    /**
     * @dev Remove a user from the whitelist (owner only)
     * @param user Address to remove from whitelist
     */
    function removeFromWhitelist(address user) external onlyOwner {
        isWhitelisted[user] = false;
        emit UserRemovedFromWhitelist(user);
    }

    /**
     * @dev Enable whitelist (owner only)
     */
    function enableWhitelist() external onlyOwner {
        whitelistEnabled = true;
        emit WhitelistEnabled();
    }

    /**
     * @dev Disable whitelist (owner only)
     */
    function disableWhitelist() external onlyOwner {
        whitelistEnabled = false;
        emit WhitelistDisabled();
    }

    /**
     * @dev Transfer ownership of the contract (owner only)
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) public override onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        _transferOwnership(newOwner);
    }

    /**
     * @dev Renounce ownership of the contract (owner only)
     * @notice This will make the contract ownerless - use with extreme caution!
     */
    function renounceOwnership() public override onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Get the contract's USDC balance
     * @return USDC balance of the contract
     */
    function getContractBalance() external view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }

    /**
     * @dev Get the contract's ETH balance
     * @return ETH balance of the contract
     */
    function getContractETHBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Get the contract's WBTC balance
     * @return WBTC balance of the contract
     */
    function getContractWBTCBalance() external view returns (uint256) {
        return wbtcToken.balanceOf(address(this));
    }

    /**
     * @dev Get the total amount locked for a user
     * @param user Address of the user
     * @return Total amount locked (excluding withdrawn deposits)
     */
    function getTotalLockedAmount(address user) external view returns (uint256) {
        uint256 total = 0;
        uint256 count = userDepositCount[user];

        for (uint256 i = 0; i < count; i++) {
            Deposit memory depositInfo = userDeposits[user][i];
            if (!depositInfo.isWithdrawn) {
                total += depositInfo.amount;
            }
        }

        return total;
    }

    /**
     * @dev Get the total amount available for withdrawal for a user
     * @param user Address of the user
     * @return Total amount available for withdrawal
     */
    function getAvailableWithdrawalAmount(address user) external view returns (uint256) {
        uint256 total = 0;
        uint256 count = userDepositCount[user];

        for (uint256 i = 0; i < count; i++) {
            Deposit memory depositInfo = userDeposits[user][i];
            if (!depositInfo.isWithdrawn) {
                uint256 unlockTime = depositInfo.depositTime + depositInfo.lockDuration;
                if (block.timestamp >= unlockTime) {
                    total += depositInfo.amount;
                }
            }
        }

        return total;
    }

    /**
     * @dev Get the total USDC locked for a user (excluding withdrawn deposits)
     * @param user Address of the user
     * @return Total USDC amount locked
     */
    function getTotalLockedUSDC(address user) external view returns (uint256) {
        uint256 total = 0;
        uint256 count = userDepositCount[user];

        for (uint256 i = 0; i < count; i++) {
            Deposit memory depositInfo = userDeposits[user][i];
            if (!depositInfo.isWithdrawn && depositInfo.assetType == AssetType.USDC) {
                total += depositInfo.amount;
            }
        }

        return total;
    }

    /**
     * @dev Get the total ETH locked for a user (excluding withdrawn deposits)
     * @param user Address of the user
     * @return Total ETH amount locked
     */
    function getTotalLockedETH(address user) external view returns (uint256) {
        uint256 total = 0;
        uint256 count = userDepositCount[user];

        for (uint256 i = 0; i < count; i++) {
            Deposit memory depositInfo = userDeposits[user][i];
            if (!depositInfo.isWithdrawn && depositInfo.assetType == AssetType.ETH) {
                total += depositInfo.amount;
            }
        }

        return total;
    }

    /**
     * @dev Get the total WBTC locked for a user (excluding withdrawn deposits)
     * @param user Address of the user
     * @return Total WBTC amount locked
     */
    function getTotalLockedWBTC(address user) external view returns (uint256) {
        uint256 total = 0;
        uint256 count = userDepositCount[user];

        for (uint256 i = 0; i < count; i++) {
            Deposit memory depositInfo = userDeposits[user][i];
            if (!depositInfo.isWithdrawn && depositInfo.assetType == AssetType.WBTC) {
                total += depositInfo.amount;
            }
        }

        return total;
    }

    /**
     * @dev Get the active deposit count (excluding withdrawn deposits)
     * @param user Address of the user
     * @return Number of active deposits
     */
    function getActiveDepositCount(address user) external view returns (uint256) {
        uint256 activeCount = 0;
        uint256 count = userDepositCount[user];

        for (uint256 i = 0; i < count; i++) {
            if (!userDeposits[user][i].isWithdrawn) {
                activeCount++;
            }
        }

        return activeCount;
    }
}
