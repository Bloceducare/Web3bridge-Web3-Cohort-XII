// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract MyERC20Token is IERC20 {
    string public name = "Idealz";
    string public symbol = "DZ";
    uint8 public decimals = 18;
    uint256 private _totalSupply;
    address public owner;
    
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    constructor(uint256 initialSupply) {
        owner = msg.sender;
        _totalSupply = initialSupply * 10 ** uint256(decimals);
        _balances[msg.sender] = _totalSupply;
        emit Transfer(address(0), msg.sender, _totalSupply);
    }
    
    // This specifies the limit on the number of tokens the smart contract allows.
    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }
    
    // This function indicates the number of tokens an address holds, to check the total balance of a contract
    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }
    // This ensures the transfer of a specified amount of tokens to the receiver’s address, the sender must have a sufficient balance to send
    function transfer(address recipient, uint256 amount) public override returns (bool) {
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        _balances[msg.sender] -= amount;
        _balances[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }
    // This function returns the number of tokens an approved contract is allowed to spend or withdraw
    function allowance(address owner, address spender) public view override returns (uint256) {
        return _allowances[owner][spender];
    }
    // It allows a contract to spend a specified amount of tokens from an account on behalf of the token holder. 
    function approve(address spender, uint256 amount) public override returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    // This function allows a transfer from an account that is not making the transaction that is token transfer on behalf of the owner as long as they have been approved.
    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        require(_balances[sender] >= amount, "Insufficient balance");
        require(_allowances[sender][msg.sender] >= amount, "Allowance exceeded");
        
        _balances[sender] -= amount;
        _balances[recipient] += amount;
        _allowances[sender][msg.sender] -= amount;
        
        emit Transfer(sender, recipient, amount);
        return true;
    }
}
