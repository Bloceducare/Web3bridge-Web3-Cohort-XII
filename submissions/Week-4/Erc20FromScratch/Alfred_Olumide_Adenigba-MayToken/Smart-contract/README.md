# MayToken

MayToken is a simple ERC-20-like token implemented in Solidity. It supports basic token functionalities such as transfers, approvals, allowances, minting, and burning.

## Features
- **Transfer Tokens**: Send tokens between accounts.
- **Allowance System**: Allow approved addresses to spend tokens on behalf of the owner.
- **Minting**: The contract owner can create new tokens.
- **Burning**: Users can destroy their own tokens.
- **Events**: Emits events for transparency and tracking transactions.

## Contract Details
- **Name**: MayToken
- **Symbol**: MAY
- **Decimals**: 18
- **Total Supply**: Set during deployment
- **Owner**: The contract deployer
- **Contract Address**: 0xda4B11A190A8B30e367080651e905c0B5D3Ab8C6
- **Token Address**: https://sepolia.basescan.org/token/0xda4b11a190a8b30e367080651e905c0b5d3ab8c6

## Functions

### Public Functions

#### `transfer(address _to, uint _value) -> bool`
Transfers `_value` tokens from the sender to `_to`.

#### `approve(address _spender, uint _value) -> bool`
Allows `_spender` to spend up to `_value` tokens on behalf of the sender.

#### `transferFrom(address _from, address _to, uint _value) -> bool`
Transfers `_value` tokens from `_from` to `_to`, using the allowance system.

#### `increaseAllowance(address _spender, uint _addedValue) -> bool`
Increases the allowance of `_spender` by `_addedValue`.

#### `decreaseAllowance(address _spender, uint _subtractedValue) -> bool`
Decreases the allowance of `_spender` by `_subtractedValue`.

#### `burn(uint _value) -> bool`
Burns `_value` tokens from the sender’s balance, reducing total supply.

### Owner-Only Functions

#### `mint(address _to, uint _value) -> bool`
Creates `_value` new tokens and assigns them to `_to`. Only callable by the contract owner.

## Deployment
Deploy the contract with an initial supply:
```solidity
constructor(uint256 _initialSupply)
```
This will assign all tokens to the deployer’s address.

## Events
- `Transfer(address indexed from, address indexed to, uint256 value)`
- `Approval(address indexed owner, address indexed spender, uint256 value)`
- `Burn(address indexed from, uint value)`
- `Mint(address indexed to, uint value)`

## Security Considerations
- Uses Solidity 0.8.28, which has built-in overflow protection.
- Prevents zero-address transactions.
- Restricted minting to the contract owner.

## License
This contract is **UNLICENSED**, meaning it has no predefined license attached.

## Author
Developed by **[MayLord](https://github.com/7maylord)**. Feel free to contribute and improve the project!

---

Happy coding! 🚀