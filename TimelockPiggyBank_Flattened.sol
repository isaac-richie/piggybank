// SPDX-License-Identifier: MIT
pragma solidity >=0.4.16 >=0.6.2 ^0.8.20;

// lib/openzeppelin-contracts/contracts/utils/Context.sol

// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}

// lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol

// OpenZeppelin Contracts (last updated v5.4.0) (utils/introspection/IERC165.sol)

/**
 * @dev Interface of the ERC-165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[ERC].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

// lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol

// OpenZeppelin Contracts (last updated v5.4.0) (token/ERC20/IERC20.sol)

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

// lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol

// OpenZeppelin Contracts (last updated v5.1.0) (utils/ReentrancyGuard.sol)

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _status = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        _status = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == ENTERED;
    }
}

// lib/openzeppelin-contracts/contracts/interfaces/IERC165.sol

// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC165.sol)

// lib/openzeppelin-contracts/contracts/interfaces/IERC20.sol

// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC20.sol)

// lib/openzeppelin-contracts/contracts/access/Ownable.sol

// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

// lib/openzeppelin-contracts/contracts/utils/Pausable.sol

// OpenZeppelin Contracts (last updated v5.3.0) (utils/Pausable.sol)

/**
 * @dev Contract module which allows children to implement an emergency stop
 * mechanism that can be triggered by an authorized account.
 *
 * This module is used through inheritance. It will make available the
 * modifiers `whenNotPaused` and `whenPaused`, which can be applied to
 * the functions of your contract. Note that they will not be pausable by
 * simply including this module, only once the modifiers are put in place.
 */
abstract contract Pausable is Context {
    bool private _paused;

    /**
     * @dev Emitted when the pause is triggered by `account`.
     */
    event Paused(address account);

    /**
     * @dev Emitted when the pause is lifted by `account`.
     */
    event Unpaused(address account);

    /**
     * @dev The operation failed because the contract is paused.
     */
    error EnforcedPause();

    /**
     * @dev The operation failed because the contract is not paused.
     */
    error ExpectedPause();

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    modifier whenNotPaused() {
        _requireNotPaused();
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    modifier whenPaused() {
        _requirePaused();
        _;
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */
    function paused() public view virtual returns (bool) {
        return _paused;
    }

    /**
     * @dev Throws if the contract is paused.
     */
    function _requireNotPaused() internal view virtual {
        if (paused()) {
            revert EnforcedPause();
        }
    }

    /**
     * @dev Throws if the contract is not paused.
     */
    function _requirePaused() internal view virtual {
        if (!paused()) {
            revert ExpectedPause();
        }
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @dev Returns to normal state.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
}

// lib/openzeppelin-contracts/contracts/interfaces/IERC1363.sol

// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC1363.sol)

/**
 * @title IERC1363
 * @dev Interface of the ERC-1363 standard as defined in the https://eips.ethereum.org/EIPS/eip-1363[ERC-1363].
 *
 * Defines an extension interface for ERC-20 tokens that supports executing code on a recipient contract
 * after `transfer` or `transferFrom`, or code on a spender contract after `approve`, in a single transaction.
 */
interface IERC1363 is IERC20, IERC165 {
    /*
     * Note: the ERC-165 identifier for this interface is 0xb0202a11.
     * 0xb0202a11 ===
     *   bytes4(keccak256('transferAndCall(address,uint256)')) ^
     *   bytes4(keccak256('transferAndCall(address,uint256,bytes)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256,bytes)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256,bytes)'))
     */

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @param data Additional data with no specified format, sent in call to `spender`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value, bytes calldata data) external returns (bool);
}

// lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol

// OpenZeppelin Contracts (last updated v5.3.0) (token/ERC20/utils/SafeERC20.sol)

/**
 * @title SafeERC20
 * @dev Wrappers around ERC-20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    /**
     * @dev An operation with an ERC-20 token failed.
     */
    error SafeERC20FailedOperation(address token);

    /**
     * @dev Indicates a failed `decreaseAllowance` request.
     */
    error SafeERC20FailedDecreaseAllowance(address spender, uint256 currentAllowance, uint256 requestedDecrease);

    /**
     * @dev Transfer `value` amount of `token` from the calling contract to `to`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     */
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeCall(token.transfer, (to, value)));
    }

    /**
     * @dev Transfer `value` amount of `token` from `from` to `to`, spending the approval given by `from` to the
     * calling contract. If `token` returns no value, non-reverting calls are assumed to be successful.
     */
    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeCall(token.transferFrom, (from, to, value)));
    }

    /**
     * @dev Variant of {safeTransfer} that returns a bool instead of reverting if the operation is not successful.
     */
    function trySafeTransfer(IERC20 token, address to, uint256 value) internal returns (bool) {
        return _callOptionalReturnBool(token, abi.encodeCall(token.transfer, (to, value)));
    }

    /**
     * @dev Variant of {safeTransferFrom} that returns a bool instead of reverting if the operation is not successful.
     */
    function trySafeTransferFrom(IERC20 token, address from, address to, uint256 value) internal returns (bool) {
        return _callOptionalReturnBool(token, abi.encodeCall(token.transferFrom, (from, to, value)));
    }

    /**
     * @dev Increase the calling contract's allowance toward `spender` by `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 oldAllowance = token.allowance(address(this), spender);
        forceApprove(token, spender, oldAllowance + value);
    }

    /**
     * @dev Decrease the calling contract's allowance toward `spender` by `requestedDecrease`. If `token` returns no
     * value, non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeDecreaseAllowance(IERC20 token, address spender, uint256 requestedDecrease) internal {
        unchecked {
            uint256 currentAllowance = token.allowance(address(this), spender);
            if (currentAllowance < requestedDecrease) {
                revert SafeERC20FailedDecreaseAllowance(spender, currentAllowance, requestedDecrease);
            }
            forceApprove(token, spender, currentAllowance - requestedDecrease);
        }
    }

    /**
     * @dev Set the calling contract's allowance toward `spender` to `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful. Meant to be used with tokens that require the approval
     * to be set to zero before setting it to a non-zero value, such as USDT.
     *
     * NOTE: If the token implements ERC-7674, this function will not modify any temporary allowance. This function
     * only sets the "standard" allowance. Any temporary allowance will remain active, in addition to the value being
     * set here.
     */
    function forceApprove(IERC20 token, address spender, uint256 value) internal {
        bytes memory approvalCall = abi.encodeCall(token.approve, (spender, value));

        if (!_callOptionalReturnBool(token, approvalCall)) {
            _callOptionalReturn(token, abi.encodeCall(token.approve, (spender, 0)));
            _callOptionalReturn(token, approvalCall);
        }
    }

    /**
     * @dev Performs an {ERC1363} transferAndCall, with a fallback to the simple {ERC20} transfer if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            safeTransfer(token, to, value);
        } else if (!token.transferAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} transferFromAndCall, with a fallback to the simple {ERC20} transferFrom if the target
     * has no code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferFromAndCallRelaxed(
        IERC1363 token,
        address from,
        address to,
        uint256 value,
        bytes memory data
    ) internal {
        if (to.code.length == 0) {
            safeTransferFrom(token, from, to, value);
        } else if (!token.transferFromAndCall(from, to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} approveAndCall, with a fallback to the simple {ERC20} approve if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * NOTE: When the recipient address (`to`) has no code (i.e. is an EOA), this function behaves as {forceApprove}.
     * Opposedly, when the recipient address (`to`) has code, this function only attempts to call {ERC1363-approveAndCall}
     * once without retrying, and relies on the returned value to be true.
     *
     * Reverts if the returned value is other than `true`.
     */
    function approveAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            forceApprove(token, to, value);
        } else if (!token.approveAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     *
     * This is a variant of {_callOptionalReturnBool} that reverts if call fails to meet the requirements.
     */
    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        uint256 returnSize;
        uint256 returnValue;
        assembly ("memory-safe") {
            let success := call(gas(), token, 0, add(data, 0x20), mload(data), 0, 0x20)
            // bubble errors
            if iszero(success) {
                let ptr := mload(0x40)
                returndatacopy(ptr, 0, returndatasize())
                revert(ptr, returndatasize())
            }
            returnSize := returndatasize()
            returnValue := mload(0)
        }

        if (returnSize == 0 ? address(token).code.length == 0 : returnValue != 1) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     *
     * This is a variant of {_callOptionalReturn} that silently catches all reverts and returns a bool instead.
     */
    function _callOptionalReturnBool(IERC20 token, bytes memory data) private returns (bool) {
        bool success;
        uint256 returnSize;
        uint256 returnValue;
        assembly ("memory-safe") {
            success := call(gas(), token, 0, add(data, 0x20), mload(data), 0, 0x20)
            returnSize := returndatasize()
            returnValue := mload(0)
        }
        return success && (returnSize == 0 ? address(token).code.length > 0 : returnValue == 1);
    }
}

// src/TimelockPiggyBank.sol

/**
 * @title TimelockPiggyBank
 * @dev A secure timelock contract for USDC deposits with multiple lock durations
 * @notice Users can deposit USDC for 3, 6, 9, or 12 months and withdraw after unlock
 */
contract TimelockPiggyBank is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // Lock duration options in seconds
    uint256 public constant LOCK_3_MONTHS = 90 days;
    uint256 public constant LOCK_6_MONTHS = 180 days;
    uint256 public constant LOCK_9_MONTHS = 270 days;
    uint256 public constant LOCK_12_MONTHS = 365 days;

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
    event DepositCreated(
        address indexed user,
        uint256 indexed depositId,
        uint256 amount,
        uint256 lockDuration
    );

    event DepositWithdrawn(
        address indexed user,
        uint256 indexed depositId,
        uint256 amount,
        address indexed to
    );

    event DepositForwarded(
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
    function depositUSDC(
        uint256 amount,
        uint256 lockDuration
    ) external nonReentrant whenNotPaused onlyWhitelisted {
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
    function depositETH(
        uint256 lockDuration
    ) external payable nonReentrant whenNotPaused onlyWhitelisted {
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
    function depositWBTC(
        uint256 amount,
        uint256 lockDuration
    ) external nonReentrant whenNotPaused onlyWhitelisted {
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
    function forwardDeposit(
        uint256 depositId,
        address to
    ) external nonReentrant whenNotPaused {
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
            (bool success, ) = payable(to).call{value: depositInfo.amount}("");
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
    function isDepositUnlocked(
        address user,
        uint256 depositId
    ) external view returns (bool) {
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
    function getDeposit(
        address user,
        uint256 depositId
    ) external view returns (Deposit memory) {
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
    function isValidLockDuration(
        uint256 lockDuration
    ) public pure returns (bool) {
        return
            lockDuration == LOCK_3_MONTHS ||
            lockDuration == LOCK_6_MONTHS ||
            lockDuration == LOCK_9_MONTHS ||
            lockDuration == LOCK_12_MONTHS;
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
    function rescueTokens(
        address token,
        uint256 amount,
        address to
    ) external onlyOwner {
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

        (bool success, ) = payable(to).call{value: balance}("");
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
    function addMultipleToWhitelist(
        address[] calldata users
    ) external onlyOwner {
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
    function getTotalLockedAmount(
        address user
    ) external view returns (uint256) {
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
    function getAvailableWithdrawalAmount(
        address user
    ) external view returns (uint256) {
        uint256 total = 0;
        uint256 count = userDepositCount[user];

        for (uint256 i = 0; i < count; i++) {
            Deposit memory depositInfo = userDeposits[user][i];
            if (!depositInfo.isWithdrawn) {
                uint256 unlockTime = depositInfo.depositTime +
                    depositInfo.lockDuration;
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
            if (
                !depositInfo.isWithdrawn &&
                depositInfo.assetType == AssetType.USDC
            ) {
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
            if (
                !depositInfo.isWithdrawn &&
                depositInfo.assetType == AssetType.ETH
            ) {
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
            if (
                !depositInfo.isWithdrawn &&
                depositInfo.assetType == AssetType.WBTC
            ) {
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
    function getActiveDepositCount(
        address user
    ) external view returns (uint256) {
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

