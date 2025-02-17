# Creation of a simple ERC-20 token following the neccessary standard.

**Token Details:** The contract defines the token name (Marisol), symbol (MAR), and decimals (18).

**Total Supply:** The total supply is set during deployment and assigned to the deployer's address.

**Balances and Allowances:** The balanceOf mapping tracks token balances, and the allowance mapping tracks approved spending limits.

**Events:** The `Transfer` and `Approval` events are emitted for token transfers and approvals.

**Functions:**

*transfer:* Allows users to send tokens to another address.

*approve:* Allows users to approve another address to spend tokens on their behalf.

*transferFrom:* Allows approved addresses to transfer tokens on behalf of the owner.

PS: 

In `test`, you'll find different test scenerios this contract passes. 
for further reading, check [erc-20 token standard](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/#methods)