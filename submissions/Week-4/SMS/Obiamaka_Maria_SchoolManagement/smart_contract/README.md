#DLToken - A Custom ERC20 Token

#Overview

DLToken is a custom ERC20 token implemented from scratch using Solidity. It features standard token operations such as transfers, approvals, and allowances, along with custom functionalities like minting and burning mechanisms.

#Features

Token Name & Symbol: Configurable during deployment

Total Supply: Initialized at contract deployment

Decimals: 18 (default ERC20 standard)

Minting: Initial supply minted to the contract owner

Burning Mechanism: 5% of each transfer is burned

Transfer & Allowance System: Standard ERC20-like functions for managing token transfers

Smart Contract Functions

#View Functions

getTokenName(): Returns the token's name.

getSymbol(): Returns the token's symbol.

getTotalSupply(): Returns the total supply of tokens.

decimal(): Returns the number of decimal places (18).

balanceOf(address): Returns the token balance of a given address.

allowance(owner, delegate): Returns the remaining number of tokens a delegate is allowed to spend.

State-Changing Functions

transfer(receiver, amount): Transfers tokens from the sender to a recipient.

approve(delegate, amount): Approves a delegate to spend a specified amount of tokens.

transferFrom(owner, buyer, amount): Transfers tokens on behalf of another user.

burn(address, amount): Internal function that burns 5% of the transferred tokens.

mint(amount, address): Internal function to mint new tokens during contract deployment.

Events

Transfer(address indexed sender, address indexed receiver, uint256 amount): Emitted on token transfers, including minting and burning.

Approval(address indexed owner, address indexed spender, uint256 amount): Emitted when an approval is granted.

Deployment

Ensure you have Solidity 0.8.27 installed.

Deploy the contract with the required constructor parameters: tokenName and tokenSymbol.

The deployer becomes the initial owner and receives the minted tokens.

Usage

Transfer Tokens: Users can transfer tokens to other addresses.

Approve Delegates: Users can approve other addresses to spend tokens on their behalf.

Burn Mechanism: 5% of transferred tokens are burned to reduce total supply.

License

This project is UNLICENSED.


