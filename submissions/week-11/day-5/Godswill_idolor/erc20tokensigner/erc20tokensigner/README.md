# ERC20 Token Signer Project

This project demonstrates a token contract with signature verification for minting tokens.

## Overview

The `TOKENSIGNER` contract is an ERC20 token that uses ECDSA signatures for verification before minting. The contract ensures that only the intended recipient with a valid signature can mint tokens. This is useful for scenarios like airdrops, where tokens should only be minted to authorized addresses.

## Contract Functionality

- `mintWithSignature(address y, uint256 amount, bytes memory signature)`: Mints tokens to address `y` if a valid signature is provided
- `cverify(address x, uint256 y, bytes memory sig)`: Internal function that verifies the signature is valid and was created by address `x`

## Tests

The tests demonstrate:

1. **Valid Signature Test**: Tests that tokens can be minted when a valid signature is provided by the recipient
2. **Invalid Signature Test**: Tests that tokens cannot be minted when an invalid signature is provided
3. **Cross-Account Prevention Test**: Tests that an attacker cannot mint tokens for themselves using someone else's signature

## How to Run

```bash
# Install dependencies
forge install

# Build the project
forge build

# Run the tests
forge test -vv
```

## Test Details

The tests use Foundry's Forge framework to:

1. Create private/public key pairs for testing
2. Sign messages with the correct format (matching the contract's verification logic)
3. Test both successful and failing scenarios
4. Use assertions to verify the expected behavior

## Troubleshooting

If you encounter Solidity compiler issues:

1. Try updating your Foundry installation: `foundryup`
2. Modify the `foundry.toml` file to specify a compatible solc version
3. Make sure you have the right remappings in `remappings.txt`
