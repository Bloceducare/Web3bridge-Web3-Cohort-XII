import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { MULTICALL_ABI, PAIR_ABI, ERC20_ABI } from './ABI';

// MUlticall contract address
const MULTICALL_ADDRESS = '0xeefba1e63905ef1d7acba5a8513c70307c1ce441';

function App() {
  const [pairAddress, setPairAddress] = useState('');
  const [pairData, setPairData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [examplePairs, setExamplePairs] = useState([
    { name: 'WETH/USDC', address: '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc' },
    { name: 'WETH/DAI', address: '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11' },
    { name: 'WETH/USDT', address: '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852' },
  ]);

  // Provider setup
  const provider = new ethers.providers.JsonRpcProvider('https://eth.llamarpc.com');

  const fetchPairData = async (address) => {
    setIsLoading(true);
    setError('');
    setPairData(null);

    try {
      console.log('Starting data fetch for pair address:', address);

      if (!ethers.utils.isAddress(address)) {
        throw new Error('Invalid Ethereum address');
      }

      // Create pair contract interface
      const pairContract = new ethers.Contract(address, PAIR_ABI, provider);

      // Get token addresses directly
      const token0Address = await pairContract.token0();
      const token1Address = await pairContract.token1();

      console.log('Token0 address:', token0Address);
      console.log('Token1 address:', token1Address);

      // Create token contract interfaces
      const token0Contract = new ethers.Contract(token0Address, ERC20_ABI, provider);
      const token1Contract = new ethers.Contract(token1Address, ERC20_ABI, provider);

      // Create multicall contract
      const multicallContract = new ethers.Contract(MULTICALL_ADDRESS, MULTICALL_ABI, provider);

      // Encode function calls
      const calls = [
        {
          target: address,
          callData: pairContract.interface.encodeFunctionData('getReserves', []),
        },
        {
          target: address,
          callData: pairContract.interface.encodeFunctionData('totalSupply', []),
        },
        {
          target: token0Address,
          callData: token0Contract.interface.encodeFunctionData('name', []),
        },
        {
          target: token0Address,
          callData: token0Contract.interface.encodeFunctionData('symbol', []),
        },
        {
          target: token0Address,
          callData: token0Contract.interface.encodeFunctionData('decimals', []),
        },
        {
          target: token1Address,
          callData: token1Contract.interface.encodeFunctionData('name', []),
        },
        {
          target: token1Address,
          callData: token1Contract.interface.encodeFunctionData('symbol', []),
        },
        {
          target: token1Address,
          callData: token1Contract.interface.encodeFunctionData('decimals', []),
        },
      ];

      // Execute multicall
      console.log('Executing multicall...');
      const [blockNumber, returnData] = await multicallContract.aggregate(calls);

      console.log('Multicall executed, block number:', blockNumber.toString());
      console.log('Multicall return data length:', returnData.length);

      // Decode results
      const reservesResult = pairContract.interface.decodeFunctionResult(
        'getReserves',
        returnData[0],
      );
      const totalSupplyResult = pairContract.interface.decodeFunctionResult(
        'totalSupply',
        returnData[1],
      );

      const token0NameResult = token0Contract.interface.decodeFunctionResult('name', returnData[2]);
      const token0SymbolResult = token0Contract.interface.decodeFunctionResult(
        'symbol',
        returnData[3],
      );
      const token0DecimalsResult = token0Contract.interface.decodeFunctionResult(
        'decimals',
        returnData[4],
      );

      const token1NameResult = token1Contract.interface.decodeFunctionResult('name', returnData[5]);
      const token1SymbolResult = token1Contract.interface.decodeFunctionResult(
        'symbol',
        returnData[6],
      );
      const token1DecimalsResult = token1Contract.interface.decodeFunctionResult(
        'decimals',
        returnData[7],
      );

      // Extract values
      const reserve0 = reservesResult.reserve0;
      const reserve1 = reservesResult.reserve1;
      const totalSupply = totalSupplyResult[0];

      const token0Name = token0NameResult[0];
      const token0Symbol = token0SymbolResult[0];
      const token0Decimals = token0DecimalsResult[0];

      const token1Name = token1NameResult[0];
      const token1Symbol = token1SymbolResult[0];
      const token1Decimals = token1DecimalsResult[0];

      // Calculate price ratios
      const price0In1 = reserve1
        .mul(ethers.BigNumber.from(10).pow(token0Decimals))
        .div(reserve0.mul(ethers.BigNumber.from(10).pow(token1Decimals)));

      const price1In0 = reserve0
        .mul(ethers.BigNumber.from(10).pow(token1Decimals))
        .div(reserve1.mul(ethers.BigNumber.from(10).pow(token0Decimals)));

      // Organize the data
      const data = {
        pairAddress: address,
        token0: {
          address: token0Address,
          name: token0Name,
          symbol: token0Symbol,
          decimals: token0Decimals,
          reserve: ethers.utils.formatUnits(reserve0, token0Decimals),
          price: ethers.utils.formatUnits(price0In1, token1Decimals),
        },
        token1: {
          address: token1Address,
          name: token1Name,
          symbol: token1Symbol,
          decimals: token1Decimals,
          reserve: ethers.utils.formatUnits(reserve1, token1Decimals),
          price: ethers.utils.formatUnits(price1In0, token0Decimals),
        },
        totalSupply: ethers.utils.formatUnits(totalSupply, 18), // LP tokens typically have 18 decimals
        blockNumber: blockNumber.toString(),
        timestamp: new Date().toISOString(),
      };

      console.log('Final processed data:', data);
      setPairData(data);
    } catch (err) {
      console.error('Error fetching pair data:', err);
      setError(`Error: ${err.message || 'Failed to fetch pair data'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchPairData(pairAddress);
  };

  // Handle example pair selection
  const handleExamplePair = (address) => {
    setPairAddress(address);
    fetchPairData(address);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4'>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='max-w-4xl mx-auto'
      >
        <h1 className='text-4xl font-bold text-center mb-2 text-indigo-800 mt-8'>
          Uniswap V2 Pair Explorer
        </h1>
        <p className='text-center text-gray-600 mb-8'>
          Explore liquidity pairs and token details on Uniswap V2
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className='bg-white p-6 rounded-xl shadow-lg mb-6 hover:shadow-xl transition-shadow duration-300'
        >
          <form onSubmit={handleSubmit} className='flex flex-col md:flex-row gap-4'>
            <input
              type='text'
              value={pairAddress}
              onChange={(e) => setPairAddress(e.target.value)}
              placeholder='Enter Uniswap V2 Pair Address'
              className='flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200'
            />
            <button
              type='submit'
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg font-medium text-white shadow-md transition-all duration-200 ${
                isLoading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <span className='flex items-center justify-center'>
                  <svg
                    className='animate-spin -ml-1 mr-2 h-5 w-5 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                'Fetch Data'
              )}
            </button>
          </form>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className='mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 mr-2'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className='mt-4'>
            <p className='text-gray-600 mb-2 text-sm'>Quick examples:</p>
            <div className='flex flex-wrap gap-2'>
              {examplePairs.map((pair) => (
                <button
                  key={pair.address}
                  onClick={() => handleExamplePair(pair.address)}
                  className='px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors duration-200'
                >
                  {pair.name}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {pairData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className='bg-white p-6 rounded-xl shadow-lg'
            >
              <h2 className='text-2xl font-semibold mb-6 text-indigo-800 border-b pb-2'>
                Pair Details
              </h2>

              <div className='mb-6 transition-all duration-300 hover:bg-gray-50 p-3 rounded-lg'>
                <h3 className='text-lg font-medium text-gray-700 mb-2'>Pair Address</h3>
                <div className='p-3 bg-gray-50 rounded-lg break-all border border-gray-100 shadow-sm'>
                  {pairData.pairAddress}
                </div>
                <div className='mt-2 text-sm text-gray-500'>
                  Block Number: {pairData.blockNumber}
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className='bg-blue-50 p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100'
                >
                  <h3 className='text-lg font-medium text-blue-800 mb-3 flex items-center'>
                    <span className='w-3 h-3 bg-blue-400 rounded-full mr-2'></span>
                    Token 0: {pairData.token0.symbol}
                  </h3>
                  <div className='space-y-3'>
                    <div>
                      <span className='font-medium text-gray-700'>Name:</span>{' '}
                      {pairData.token0.name}
                    </div>
                    <div>
                      <span className='font-medium text-gray-700'>Symbol:</span>{' '}
                      {pairData.token0.symbol}
                    </div>
                    <div>
                      <span className='font-medium text-gray-700'>Decimals:</span>{' '}
                      {pairData.token0.decimals}
                    </div>
                    <div className='pt-1 border-t border-blue-100'>
                      <span className='font-medium text-gray-700'>Address:</span>
                      <div className='break-all mt-1 text-sm bg-white p-2 rounded border border-blue-100 shadow-sm'>
                        {pairData.token0.address}
                      </div>
                    </div>
                    <div className='pt-2 border-t border-blue-100'>
                      <span className='font-medium text-gray-700'>Reserve:</span>
                      <div className='mt-1 text-xl font-semibold text-blue-800'>
                        {parseFloat(pairData.token0.reserve).toLocaleString(undefined, {
                          maximumFractionDigits: 6,
                        })}{' '}
                        {pairData.token0.symbol}
                      </div>
                    </div>
                    <div className='pt-2 border-t border-blue-100'>
                      <span className='font-medium text-gray-700'>Price:</span>
                      <div className='flex items-baseline mt-1'>
                        <span className='text-lg font-semibold text-blue-800'>
                          1 {pairData.token0.symbol} =
                        </span>
                        <span className='ml-2 text-lg font-semibold text-purple-800'>
                          {parseFloat(pairData.token0.price).toLocaleString(undefined, {
                            maximumFractionDigits: 6,
                          })}{' '}
                          {pairData.token1.symbol}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className='bg-purple-50 p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-purple-100'
                >
                  <h3 className='text-lg font-medium text-purple-800 mb-3 flex items-center'>
                    <span className='w-3 h-3 bg-purple-400 rounded-full mr-2'></span>
                    Token 1: {pairData.token1.symbol}
                  </h3>
                  <div className='space-y-3'>
                    <div>
                      <span className='font-medium text-gray-700'>Name:</span>{' '}
                      {pairData.token1.name}
                    </div>
                    <div>
                      <span className='font-medium text-gray-700'>Symbol:</span>{' '}
                      {pairData.token1.symbol}
                    </div>
                    <div>
                      <span className='font-medium text-gray-700'>Decimals:</span>{' '}
                      {pairData.token1.decimals}
                    </div>
                    <div className='pt-1 border-t border-purple-100'>
                      <span className='font-medium text-gray-700'>Address:</span>
                      <div className='break-all mt-1 text-sm bg-white p-2 rounded border border-purple-100 shadow-sm'>
                        {pairData.token1.address}
                      </div>
                    </div>
                    <div className='pt-2 border-t border-purple-100'>
                      <span className='font-medium text-gray-700'>Reserve:</span>
                      <div className='mt-1 text-xl font-semibold text-purple-800'>
                        {parseFloat(pairData.token1.reserve).toLocaleString(undefined, {
                          maximumFractionDigits: 6,
                        })}{' '}
                        {pairData.token1.symbol}
                      </div>
                    </div>
                    <div className='pt-2 border-t border-purple-100'>
                      <span className='font-medium text-gray-700'>Price:</span>
                      <div className='flex items-baseline mt-1'>
                        <span className='text-lg font-semibold text-purple-800'>
                          1 {pairData.token1.symbol} =
                        </span>
                        <span className='ml-2 text-lg font-semibold text-blue-800'>
                          {parseFloat(pairData.token1.price).toLocaleString(undefined, {
                            maximumFractionDigits: 6,
                          })}{' '}
                          {pairData.token0.symbol}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className='bg-green-50 p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-green-100'
              >
                <h3 className='text-lg font-medium text-green-800 mb-3 flex items-center'>
                  <span className='w-3 h-3 bg-green-400 rounded-full mr-2'></span>
                  Liquidity Pool Details
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='p-3 bg-white rounded-lg shadow-sm border border-green-100'>
                    <div className='text-sm text-gray-600 mb-1'>Total Supply</div>
                    <div className='text-xl font-semibold text-green-800'>
                      {parseFloat(pairData.totalSupply).toLocaleString(undefined, {
                        maximumFractionDigits: 6,
                      })}{' '}
                      LP Tokens
                    </div>
                  </div>
                  <div className='p-3 bg-white rounded-lg shadow-sm border border-green-100'>
                    <div className='text-sm text-gray-600 mb-1'>Last Updated</div>
                    <div className='text-green-800 font-medium'>
                      {new Date(pairData.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className='mt-6 text-center text-gray-500 text-sm'
        >
          <p>&copy; {new Date().getFullYear()} Uniswap V2 Pair Explorer | Built with Ethers.js</p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default App;
