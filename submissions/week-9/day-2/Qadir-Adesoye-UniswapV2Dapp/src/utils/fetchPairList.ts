import axios from 'axios';

export interface PairToken {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

export async function fetchPairList(limit: number, offset: number): Promise<PairToken[]> {
  const url = 'https://raw.githubusercontent.com/jab416171/uniswap-pairtokens/master/uniswap_pair_tokens.json';
  try {
    const response = await axios.get(url);
    const tokens: PairToken[] = response.data.tokens;
    return tokens.slice(offset, offset + limit); // Paginate results
  } catch (error) {
    throw new Error('Failed to fetch pair list');
  }
}

export async function fetchTotalPairs(): Promise<number> {
  const url = 'https://raw.githubusercontent.com/jab416171/uniswap-pairtokens/master/uniswap_pair_tokens.json';
  const response = await axios.get(url);
  return response.data.tokens.length;
}