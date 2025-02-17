// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract MyTestToken {
    // Token details
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    
    // Balances for each account
    mapping(address => uint256) public balanceOf;
    // Allowances for each account: owner => spender => amount
    mapping(address => mapping(address => uint256)) public allowance;
    
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    
    constructor() {
        name = 'kodedcoin';           
        symbol = 'KDC';      
        decimals = 1;   
    }
    

    function _transfer(address _from, address _to, uint256 _value) internal {
        require(_to != address(0), "Cannot transfer to zero address");
        require(balanceOf[_from] >= _value, "Insufficient balance");
        
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        
        emit Transfer(_from, _to, _value);
    }
    
    
    function transfer(address _to, uint256 _value) external returns (bool success) {
        _transfer(msg.sender, _to, _value);
        return true;
    }
    
    // Approve another address to spend tokens on your behalf
    function approve(address _spender, uint256 _value) external returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    
    // Transfer tokens from one address to another, using allowance mechanism
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success) {
        require(allowance[_from][msg.sender] >= _value, "Allowance exceeded");
        
        allowance[_from][msg.sender] -= _value;
        _transfer(_from, _to, _value);
        return true;
    }
    
    // Mint function: Allows any caller to create new tokens for themselves
    function mint(uint256 _amount) external returns (bool) {
        totalSupply += _amount;
        balanceOf[msg.sender] += _amount;
        
        // Emit Transfer event from the zero address to signal token creation
        emit Transfer(address(0), msg.sender, _amount);
        return true;
    }
}
