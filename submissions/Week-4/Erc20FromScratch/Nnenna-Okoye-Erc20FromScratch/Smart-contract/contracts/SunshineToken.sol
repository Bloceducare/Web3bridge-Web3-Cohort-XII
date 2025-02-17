// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

contract SunshineToken {
    
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;

    
    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;

    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    
    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _initialSupply) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _initialSupply * (10 ** uint256(_decimals)); 
        balances[msg.sender] = totalSupply; 
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    
    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }

    
    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_to != address(0), "Invalid recipient address");
        require(balances[msg.sender] >= _value, "Insufficient balance");

        balances[msg.sender] -= _value;
        balances[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    
    function approve(address _spender, uint256 _value) public returns (bool) {
        require(_spender != address(0), "Invalid spender address");

        allowances[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(_to != address(0), "Invalid recipient address");
        require(balances[_from] >= _value, "Insufficient balance");
        require(allowances[_from][msg.sender] >= _value, "Allowance exceeded");

        balances[_from] -= _value;
        balances[_to] += _value;
        allowances[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);
        return true;
    }

    
    function allowance(address _owner, address _spender) public view returns (uint256) {
        return allowances[_owner][_spender];
    }
}
