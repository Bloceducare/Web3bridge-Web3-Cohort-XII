import { usePairContext } from '../context/PairContext';
import { ethers } from 'ethers';
import { MULTICALL_ADDRESS } from '../constants/addresses';
import UNISWAP_V2_PAIR_ABI from '../ABI/uniswapV2Pair.json';
import ERC20_ABI from '../ABI/erc20.json';
import MULTICALL_V2_ABI from '../ABI/multicallV2.json';

export function usePairData() {
    const {
        pairAddress,
        setPairData,
        setLoading,
        setError
    } = usePairContext();

    const fetchPairData = async () => {
        if (!ethers.isAddress(pairAddress)) {
            setError('Please enter a valid Ethereum address');
            return;
        }

        setLoading(true);
        setError('');
        setPairData(null);

        try {
            // Using a public provider
            const provider = ethers.getDefaultProvider('mainnet');

            const multicallContract = new ethers.Contract(
                MULTICALL_ADDRESS,
                MULTICALL_V2_ABI,
                provider
            );
            const pairContract = new ethers.Contract(
                pairAddress,
                UNISWAP_V2_PAIR_ABI,
                provider
            );

            // Prepare calls for pair data
            const pairCalls = [
                {
                    target: pairAddress,
                    callData: pairContract.interface.encodeFunctionData('token0'),
                },
                {
                    target: pairAddress,
                    callData: pairContract.interface.encodeFunctionData('token1'),
                },
                {
                    target: pairAddress,
                    callData: pairContract.interface.encodeFunctionData('getReserves'),
                },
                {
                    target: pairAddress,
                    callData: pairContract.interface.encodeFunctionData('totalSupply'),
                },
            ];

            // Execute multicall for pair data
            const [, pairResults] = await multicallContract.aggregate.staticCall(pairCalls);

            // Decode pair results
            const token0Address = ethers.getAddress(
                ethers.AbiCoder.defaultAbiCoder().decode(['address'], pairResults[0])[0]
            );
            const token1Address = ethers.getAddress(
                ethers.AbiCoder.defaultAbiCoder().decode(['address'], pairResults[1])[0]
            );
            const reserves = ethers.AbiCoder.defaultAbiCoder().decode(
                ['uint112', 'uint112', 'uint32'],
                pairResults[2]
            );
            const totalSupply = ethers.AbiCoder.defaultAbiCoder().decode(
                ['uint256'],
                pairResults[3]
            )[0];

            // contracts for token0 and token1
            const token0Contract = new ethers.Contract(
                token0Address,
                ERC20_ABI,
                provider
            );
            const token1Contract = new ethers.Contract(
                token1Address,
                ERC20_ABI,
                provider
            );

            // Prepare calls for token details
            const tokenCalls = [
                {
                    target: token0Address,
                    callData: token0Contract.interface.encodeFunctionData('name'),
                },
                {
                    target: token0Address,
                    callData: token0Contract.interface.encodeFunctionData('symbol'),
                },
                {
                    target: token0Address,
                    callData: token0Contract.interface.encodeFunctionData('decimals'),
                },
                {
                    target: token1Address,
                    callData: token1Contract.interface.encodeFunctionData('name'),
                },
                {
                    target: token1Address,
                    callData: token1Contract.interface.encodeFunctionData('symbol'),
                },
                {
                    target: token1Address,
                    callData: token1Contract.interface.encodeFunctionData('decimals'),
                },
            ];

            // Execute multicall for token details
            const [, tokenResults] = await multicallContract.aggregate.staticCall(tokenCalls);

            // Decode token results
            const token0Name = ethers.AbiCoder.defaultAbiCoder().decode(
                ['string'],
                tokenResults[0]
            )[0];
            const token0Symbol = ethers.AbiCoder.defaultAbiCoder().decode(
                ['string'],
                tokenResults[1]
            )[0];
            const token0Decimals = ethers.AbiCoder.defaultAbiCoder().decode(
                ['uint8'],
                tokenResults[2]
            )[0];
            const token1Name = ethers.AbiCoder.defaultAbiCoder().decode(
                ['string'],
                tokenResults[3]
            )[0];
            const token1Symbol = ethers.AbiCoder.defaultAbiCoder().decode(
                ['string'],
                tokenResults[4]
            )[0];
            const token1Decimals = ethers.AbiCoder.defaultAbiCoder().decode(
                ['uint8'],
                tokenResults[5]
            )[0];

            // Calculate formatted reserves
            const reserve0 = ethers.formatUnits(reserves[0], token0Decimals);
            const reserve1 = ethers.formatUnits(reserves[1], token1Decimals);
            const formattedTotalSupply = ethers.formatUnits(totalSupply, 18); // LP tokens have 18 decimals

            // Set the pair data
            setPairData({
                pair: {
                    address: pairAddress,
                    totalSupply: formattedTotalSupply,
                },
                token0: {
                    address: token0Address,
                    name: token0Name,
                    symbol: token0Symbol,
                    decimals: token0Decimals,
                    reserve: reserve0,
                },
                token1: {
                    address: token1Address,
                    name: token1Name,
                    symbol: token1Symbol,
                    decimals: token1Decimals,
                    reserve: reserve1,
                },
                lastUpdated: new Date(Number(reserves[2]) * 1000).toLocaleString(),
            });
        } catch (err) {
            console.error('Error fetching pair data:', err);
            setError(`Error fetching pair data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return { fetchPairData };
}