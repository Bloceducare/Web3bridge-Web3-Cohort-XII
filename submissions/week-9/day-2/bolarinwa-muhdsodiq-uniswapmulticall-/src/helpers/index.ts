import { ethers } from "ethers";
import { getCreate2Address } from "ethers";

export const erc20ABI = [
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    "function decimals() external view returns (uint8)"
  ];


const factoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'; // Uniswap V2 Factory
const initCodeHash = '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f'; // Uniswap V2 init code hash
export function getPairAddress(tokenA: string, tokenB: string): string {
  const [token0, token1] = tokenA < tokenB ? [tokenA, tokenB] : [tokenB, tokenA];
  const salt = ethers.solidityPackedKeccak256(['address', 'address'], [token0, token1]);
  return getCreate2Address(factoryAddress, salt, initCodeHash);
}
 