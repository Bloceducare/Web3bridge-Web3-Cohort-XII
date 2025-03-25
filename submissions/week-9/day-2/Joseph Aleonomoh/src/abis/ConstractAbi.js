export const UniswapV2ABI = [
    "function name() public pure returns (string memory)",
    "function symbol() public pure returns (string memory)",
    "function decimals() public pure returns (uint8)",
    "function totalSupply() public view returns (uint)",
    "function token0() public view returns (address)",
    "function token1() public view returns (address)",
    "function getReserves() public view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",

]


// export const MultiCallABI = [     
//     "function tryAggregate(bool requireSuccess, Call[] memory calls) public returns (Result[] memory returnData)",
//    ]

export const MultiCallABI = [     
    "function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] memory calls) public returns (tuple(bool success, bytes returnData)[] memory)"
    ];
