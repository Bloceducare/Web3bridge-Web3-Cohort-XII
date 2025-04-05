## Problem Statement

The main problem my project is solving is the need for efficient and consolidated blockchain data retrieval. By using the Multicall contract, users can batch multiple constant function call results into one, reducing the number of separate calls and improving performance.

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file:

```
VITE_MULTICALL_ADDRESS_MAINNET="0xeefba1e63905ef1d7acba5a8513c70307c1ce441"
VITE_NODE_PROVIDER='https://mainnet.infura.io/v3/your-infura-api-key'
```