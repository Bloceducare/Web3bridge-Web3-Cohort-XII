import { TokenData } from '../types';

interface TokenInfoProps {
  token: TokenData;
  reserve: string;
}

export default function TokenInfo({ token, reserve }: TokenInfoProps) {
  return (
    <div className="bg-gray-700 p-4 rounded-xl transition-all duration-300 hover:bg-gray-600">
      <h3 className="text-lg font-semibold text-white">{token.symbol}</h3>
      <p className="text-sm text-gray-300">Name: {token.name}</p>
      <p className="text-sm text-gray-300 break-all">Address: {token.address}</p>
      <p className="text-sm text-gray-300">Decimals: {token.decimals}</p>
      <p className="text-sm text-gray-300">Reserve: {reserve}</p>
    </div>
  );
}