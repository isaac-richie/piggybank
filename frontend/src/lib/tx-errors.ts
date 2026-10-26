import { BaseError, ContractFunctionRevertedError, UserRejectedRequestError } from 'viem';

const CONTRACT_ERRORS: Record<string, string> = {
  InvalidLockDuration: 'That lock duration is not supported.',
  DepositNotFound: 'This lock could not be found.',
  DepositAlreadyWithdrawn: 'This lock has already been closed.',
  DepositNotUnlocked: 'This lock has not reached its unlock date yet.',
  DepositAlreadyUnlocked: 'This lock has already unlocked, so it can no longer be topped up. Start a new lock instead.',
  InsufficientBalance: 'The vault could not send these funds. Your lock is still recorded — please contact support.',
  ZeroAmount: 'Enter an amount greater than zero.',
  ZeroAddress: 'Enter a valid destination address.',
  InvalidDepositId: 'This action does not match the lock’s asset.',
  NotWhitelisted: 'Your address is not on the allowlist yet. Please contact support.',
  EnforcedPause: 'The vault is paused right now. Please try again later.',
  ERC20InsufficientBalance: 'The vault does not hold enough of this token to pay out. Your lock is still recorded — please contact support.',
  ERC20InsufficientAllowance: 'Token approval was too low. Please try again.',
  SafeERC20FailedOperation: 'The token transfer failed. Please check your balance and try again.',
};

export function getTxErrorMessage(err: unknown, fallback = 'Transaction failed. Please try again.') {
  if (err instanceof BaseError) {
    const rejected = err.walk((e) => e instanceof UserRejectedRequestError);
    if (rejected) return 'You cancelled the request in your wallet.';

    const revert = err.walk((e) => e instanceof ContractFunctionRevertedError);
    if (revert instanceof ContractFunctionRevertedError) {
      const name = revert.data?.errorName;
      if (name && CONTRACT_ERRORS[name]) return CONTRACT_ERRORS[name];
      if (revert.reason) return revert.reason;
    }

    const text = `${err.shortMessage} ${err.details ?? ''}`.toLowerCase();
    if (text.includes('insufficient funds')) return 'Not enough ETH to cover this amount plus gas.';
    if (text.includes('user rejected') || text.includes('denied')) return 'You cancelled the request in your wallet.';
    return err.shortMessage || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
