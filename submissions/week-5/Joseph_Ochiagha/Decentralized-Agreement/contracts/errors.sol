// SPDX-License-Identifier:UNLICENSE
pragma solidity ^0.8.28;

library Errors {
    error InvalidAddress();
    error InvalidDate();
    error EmptyString();
    error InvalidPrice();
    error Unauthorized();
    error InsufficientFunds();
    error NotBuyer();
    error DisputeResolutionNotAllowed();
    error NotEscrowAgent();
    error AlreadyDelivered();
    error DeliveryDateNotReached();
    error DeliveryNotConfirmed();
    error NoFundsInEscrow();
    error ETHNotAccepted();
    error TokenTransferFailed();
}
