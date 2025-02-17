// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface INFT {
  function mintNFT(address to) external;
}

contract PiggyBank {
    // state variables
    IERC20 public token;
    INFT public nft;
    uint256 public targetAmount;
    mapping(address => uint256) public contributions;
    uint256 public immutable withdrawalDate;
    uint8 public contributorsCount;
    address public manager;

    // events
    event Contributed (
        address indexed Contributor,
        uint256 amount,
        uint256 time
    );

    event Withdrawn (
        uint256 amount,
        uint256 time
    );

    // constructor
    constructor (uint256 _targetAmount, uint256 _withdrawalDate, address _manager, address _token, address _nft) {
      require(_withdrawalDate > block.timestamp, 'WITHDRAWAL MUST BE IN FUTURE');
      
      targetAmount = _targetAmount;
      withdrawalDate = _withdrawalDate;
      manager = _manager;
      token = IERC20(_token);
      nft = INFT(_nft);
    }

    modifier onlyManager () {
        require(msg.sender == manager, 'ONLY MANAGER HAS AUTHORIZE ACCESS');
        _;
    }

    // save
    function save (uint256 amount) external {
      require(msg.sender != address(0), 'UNAUTHORIZED ADDRESS');

      require(block.timestamp <= withdrawalDate, 'YOU CAN NO LONGER SAVE');

      require(amount > 0, "AMOUNT MUST BE GREATER THAN ZERO");

      require(token.balanceOf(msg.sender) >= amount, "INSUFFICIENT FUND");

      require(token.transferFrom(msg.sender, address(this), amount), "TRANSFER FAILED");

      // check if the caller is a first time contributor
      if(contributions[msg.sender] == 0) {
        contributorsCount += 1;
      } else if(contributions[msg.sender] == 1) {
        nft.mintNFT(msg.sender);
      }

      contributions[msg.sender] += amount;

      emit Contributed(msg.sender, amount, block.timestamp);  
    }

    // withdrawal
    function withdrawal (uint256 amount) external onlyManager {
      // require that its withdrawal time or greater
      require(block.timestamp >= withdrawalDate, 'NOT YET TIME');

      require(token.balanceOf(address(this)) >= amount, 'INSUFFICIENT FUND');

      // require contract bal is > or = targetAmount
      require(token.balanceOf(address(this)) >= targetAmount, 'TARGET AMOUNT NOT REACHED');
      
      uint256 _contractBal = token.balanceOf(address(this));

      // transfer to manager
      // token.transferFrom(address(this), msg.sender, amount);
      require(token.transfer(msg.sender, amount), "TRANSFER FAILED");

      emit Withdrawn(_contractBal, block.timestamp);
    }

    function getBalance() external view returns(uint256) {
      return token.balanceOf(address(this));
    }
}
