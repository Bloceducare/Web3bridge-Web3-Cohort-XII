// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

// Custom interface deployed ERC20 token
interface IERC20Custom {
    function balanceOf(address _owner) external view returns (uint256);
    function transfer(address _to, uint256 _value) external returns (bool);
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool);
}

// Interface for our NFT contract
interface IOurERC721 {
    function mint(address _to) external;
}

error TargetAmountNotReached();

contract OurPiggyBank {
    uint256 public targetAmount;
    mapping(address => uint256) public contributions;
    uint256 public immutable withdrawalDate;
    uint8 public contributorsCount;
    address public manager;
    IERC20Custom public cxii;
    IOurERC721 public nftContract;
    mapping(address => uint256) public contributionCount;
    mapping(address => bool) public hasNFT;

    event Contributed(
        address indexed Contributor,
        uint256 amount,
        uint256 time
    );

    event Withdrawn(
        uint256 amount,
        uint256 time
    );

    event NFTMinted(address indexed user);

    constructor(
        uint256 _targetAmount,
        uint256 _withdrawalDate,
        address _manager,
        address _tokenAddress,
        address _nftAddress
    ) {
        require(_withdrawalDate > block.timestamp, 'WITHDRAWAL MUST BE IN FUTURE');
        
        targetAmount = _targetAmount;
        withdrawalDate = _withdrawalDate;
        manager = _manager;
        cxii = IERC20Custom(_tokenAddress);
        nftContract = IOurERC721(_nftAddress);
    }

    modifier onlyManager() {
        require(msg.sender == manager, 'YOU WAN THIEF ABI ?');
        _;
    }

    function save(uint256 _amount) external {
        require(msg.sender != address(0), 'UNAUTHORIZED ADDRESS');
        require(block.timestamp <= withdrawalDate, 'YOU CAN NO LONGER SAVE');
        require(_amount > 0, 'YOU ARE BROKE');
        
        bool txn = cxii.transferFrom(msg.sender, address(this), _amount);
        require(txn, "Transaction Failed");

        // Increment contributors count mapping only if the user is contributing for the first time
        if(contributions[msg.sender] == 0) {
            contributorsCount += 1;
        }
        
        // Increment contribution count for the user 
        contributionCount[msg.sender] += 1;
        
        // Mint NFT on second contribution
        if(contributionCount[msg.sender] == 2 && !hasNFT[msg.sender]) {
            nftContract.mint(msg.sender);
            hasNFT[msg.sender] = true;
            emit NFTMinted(msg.sender);
        }
        
        contributions[msg.sender] += _amount;
        emit Contributed(msg.sender, _amount, block.timestamp);
    }

    function withdrawal() external onlyManager {
        require(block.timestamp >= withdrawalDate, 'NOT YET TIME');
        uint256 _contractBalance = cxii.balanceOf(address(this));
        
        if (_contractBalance < targetAmount) {
            revert TargetAmountNotReached();
        }
        
        bool txn = cxii.transfer(manager, _contractBalance);
        require(txn, "Transaction Failed");

        emit Withdrawn(_contractBalance, block.timestamp);
    }
}