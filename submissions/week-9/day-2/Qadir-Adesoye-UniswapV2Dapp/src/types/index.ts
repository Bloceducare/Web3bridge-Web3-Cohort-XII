export interface TokenData {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
  }
  
  export interface PairData {
    pairAddress: string;
    token0: TokenData;
    token1: TokenData;
    reserves0: string;
    reserves1: string;
    totalSupply: string;
  }