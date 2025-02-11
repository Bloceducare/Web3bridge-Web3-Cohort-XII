// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

//import "./IERC20.sol";

contract SaveERC20 {
    error AddressZeroDetected();
    error ZeroValueNotAllowed();
    error InsufficientFunds();
    error CantSendToZeroAddress();
    error NotOwner();
    error InsufficientContractBalance();

    address public owner;
    address public tokenAddress;

    mapping(address => uint256) balances;

    event DepositSuccessful(address indexed user, uint256 indexed amount);
    event WithdrawalSuccessful(address indexed user, uint256 indexed amount);
    event TransferSuccessful(
        address indexed from,
        address indexed _to,
        uint256 indexed amount
    );

    constructor(address _tokenAddress) {
        owner = msg.sender;
        tokenAddress = _tokenAddress;
    }

    // modifier onlyOwner() {
    //     require(owner == msg.sender, "not owner");
    //      _;
    // }

    function deposit(uint256 _amount) external {
        if (msg.sender == address(0)) {
            revert AddressZeroDetected();
        }

        if (_amount <= 0) {
            revert ZeroValueNotAllowed();
        }

        uint256 _userTokenBalance = IERC20(tokenAddress).balanceOf(msg.sender);
        if (_userTokenBalance < _amount) {
            revert InsufficientFunds();
        }

        IERC20(tokenAddress).transferFrom(msg.sender, address(this), _amount);

        balances[msg.sender] += _amount;
        emit DepositSuccessful(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external {
        if (msg.sender == address(0)) {
            revert AddressZeroDetected();
        }

        if (_amount <= 0) {
            revert ZeroValueNotAllowed();
        }

        uint256 _userBalance = balances[msg.sender];
        if (_amount > _userBalance) {
            revert InsufficientFunds();
        }

        balances[msg.sender] -= _amount;

        IERC20(tokenAddress).transfer(msg.sender, _amount);
        emit WithdrawalSuccessful(msg.sender, _amount);
    }

    function myBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

    function getAnyBalance(address _user) external view returns (uint256) {
        onlyOwner();
        return balances[_user];
    }

    function getContractBalance() external view returns (uint256) {
        onlyOwner();
        return IERC20(tokenAddress).balanceOf(address(this));
    }

    function transferFunds(address _to, uint256 _amount) external {
        if (msg.sender == address(0)) {
            revert AddressZeroDetected();
        }

        if (_to == address(0)) {
            revert CantSendToZeroAddress();
        }

        if (balances[msg.sender] < _amount) {
            revert InsufficientFunds();
        }

        balances[msg.sender] -= _amount;

        IERC20(tokenAddress).transfer(_to, _amount);

        emit TransferSuccessful(msg.sender, _to, _amount);
    }

    function depositForAnotherUserFromWithin(
        address _user,
        uint256 _amount
    ) external {
        if (msg.sender == address(0)) {
            revert AddressZeroDetected();
        }
        if (_user == address(0)) {
            revert CantSendToZeroAddress();
        }

        if (balances[msg.sender] < _amount) {
            revert InsufficientFunds();
        }

        balances[msg.sender] -= _amount;
        balances[_user] += _amount;
    }

    function depositForAnotherUser(address _user, uint256 _amount) external {
        if (msg.sender == address(0)) {
            revert AddressZeroDetected();
        }
        if (_user == address(0)) {
            revert CantSendToZeroAddress();
        }

        uint256 _userTokenBalance = IERC20(tokenAddress).balanceOf(msg.sender);
        if (_userTokenBalance < _amount) {
            revert InsufficientFunds();
        }

        IERC20(tokenAddress).transferFrom(msg.sender, address(this), _amount);
        balances[_user] += _amount;
    }

    function ownerWithdraw(uint256 _amount) external {
        onlyOwner();

        if (IERC20(tokenAddress).balanceOf(address(this)) < _amount) {
            revert InsufficientContractBalance();
        }
        IERC20(tokenAddress).transfer(owner, _amount);
    }

    //gas optimization instead of using onlyOwner modifier
    function onlyOwner() private view {
        if (msg.sender != owner) {
            revert NotOwner();
        }
    }
}
