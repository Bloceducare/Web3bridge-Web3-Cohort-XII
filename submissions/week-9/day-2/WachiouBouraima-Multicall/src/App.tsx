import { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import PAIR_ABI from "../ABI/V2Pair.json";
import MULTICALL_ABI from "../ABI/multicall.json"
import Header from '../components/Header.tsx';

const ERC20_ABI = [
  'function decimals() external view returns (uint8)'
];

const MULTI_CALL_ADDR = import.meta.env.VITE_MULTICALL_ADDRESS_MAINNET

function App() {
  const [pairAddress, setPairAddress] = useState('');
  const [pairData, setPairData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPairData = async () => {
    if (!ethers.isAddress(pairAddress)) {
      setError('Invalid Address');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_NODE_PROVIDER);


      const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);

      const multicallContract = new ethers.Contract(MULTI_CALL_ADDR, MULTICALL_ABI, provider);

      const token0Call = {
        target: pairAddress,
        callData: pairContract.interface.encodeFunctionData('token0')
      };

      const token1Call = {
        target: pairAddress,
        callData: pairContract.interface.encodeFunctionData('token1')
      };

      const getReservesCall = {
        target: pairAddress,
        callData: pairContract.interface.encodeFunctionData('getReserves')
      };
      const totalSupplyCall = {
        target: pairAddress,
        callData: pairContract.interface.encodeFunctionData('totalSupply')
      };

      const [blockNumber, returnData] = await multicallContract.aggregate([
        token0Call, token1Call, getReservesCall, totalSupplyCall
      ]);


      const token0Address = pairContract.interface.decodeFunctionResult('token0', returnData[0])[0];
      const token1Address = pairContract.interface.decodeFunctionResult('token1', returnData[1])[0];
      const reserves = pairContract.interface.decodeFunctionResult('getReserves', returnData[2]);
      const totalSupply = pairContract.interface.decodeFunctionResult('totalSupply', returnData[3])[0]

    

      const token0Contract = new ethers.Contract(token0Address, ERC20_ABI, provider);
      const token1Contract = new ethers.Contract(token1Address, ERC20_ABI, provider)
      
      const token0DecimalsCall = {
        target: token0Address,
        callData: token0Contract.interface.encodeFunctionData('decimals')
      };

      const token1DecimalsCall = {
        target: token1Address,
        callData: token1Contract.interface.encodeFunctionData('decimals')
      };

      const [blockNumber2, returnDecimalsDatas] = await multicallContract.aggregate([
        token0DecimalsCall, token1DecimalsCall
      ]);


      const token0Decimals = token0Contract.interface.decodeFunctionResult('decimals', returnDecimalsDatas[0])[0];
      const token1Decimals = token1Contract.interface.decodeFunctionResult('decimals', returnDecimalsDatas[1])[0];


      const reserve0 = ethers.formatUnits(reserves[0], token0Decimals);
      const reserve1 = ethers.formatUnits(reserves[1], token1Decimals);

      setPairData({
        pairToken: {
          totalSupply: totalSupply,
        },
        token0: {
          address: token0Address,
          reserve: reserve0,
          decimals: token0Decimals
        },
        token1: {
          address: token1Address,
          reserve: reserve1,
          decimals: token1Decimals
        }
      });

    } catch (err) {
      console.error(err);
      setError('Data recovery error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Uniswap Pair Explorer V2" />
      <div className="App" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
  
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={pairAddress}
            onChange={(e) => setPairAddress(e.target.value)}
            placeholder="Uniswap V2 pair address"
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <button
            onClick={fetchPairData}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1a73e8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'loading...' : 'Get data'}
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {pairData && (
          <div style={{
            backgroundColor: 'black',
            padding: '15px',
            borderRadius: '4px'
          }}>
            <h2>Information about the pair</h2>

            <div style={{ marginBottom: '15px' }}>
              <h3>Pair Token</h3>
              <p><strong>LP totalSUpply:</strong> {pairData.pairToken.totalSupply}</p>
            </div>

            <div>


            </div>
            <div style={{ marginBottom: '15px' }}>
              <h3>Token 0</h3>
              <p><strong>Address:</strong> {pairData.token0.address}</p>
              <p><strong>Reserve:</strong> {pairData.token0.reserve}</p>
              <p><strong>Decimals:</strong> {pairData.token0.decimals}</p>
            </div>

            <div>
              <h3>Token 1</h3>
              <p><strong>Address:</strong> {pairData.token1.address}</p>
              <p><strong>Reserve:</strong> {pairData.token1.reserve}</p>
              <p><strong>Decimals:</strong> {pairData.token1.decimals}</p>
            </div>
          </div>
        )}
      </div>
    </>

  );
}

export default App;