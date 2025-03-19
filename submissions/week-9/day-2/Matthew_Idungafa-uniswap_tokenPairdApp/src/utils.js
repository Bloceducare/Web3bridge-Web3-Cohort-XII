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

export { fetchPairData, handleSubmit, handleExamplePair };
