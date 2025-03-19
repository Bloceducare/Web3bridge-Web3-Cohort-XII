// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface ERC20Interface {

    function balanceOf(address _owner) external view returns(uint256 balance);
    function transfer(address _to, uint256 _amount) external returns (bool success);
    function transferFrom(address _from, address _to, uint256 _amount) external returns(bool success);
    function approve(address _spender, uint256 _amount) external returns (bool success);
    function allowance(address _owner, address _spender) external view returns (uint256 balance);

    event Transfer(address indexed _from, address indexed _to, uint256 _amount);
    event Approval(address indexed _owner, address indexed _spender, uint256 _amount);

    
}

contract ERC20Implementation is ERC20Interface {

    uint256 private Max_UINT256 = 2**256 - 1;
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowed;

    uint256 totalSupply;

    string public name;
    uint8 public decimals;
    string public symbol;

    
    constructor(uint256 _totalSupply, string memory _tokenName, uint8 _decimal, string memory _tokenSymbol) {
        balances[msg.sender] = _totalSupply;
        totalSupply = _totalSupply;
        name = _tokenName;
        decimals = _decimal;
        symbol = _tokenSymbol;
    }

    function transfer(address _to, uint256 _amount) public override returns (bool success) {
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        balances[msg.sender] -= _amount;
        balances[_to] += _amount;
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _amount) public override returns (bool success) {
        uint256 allowanceSpending = allowed[_from][msg.sender];
        require(balances[_from] >= _amount && allowanceSpending >= _amount, "Insufficient balance or allowance");
        balances[_to] += _amount;
        balances[_from] -= _amount;

        if (allowanceSpending < Max_UINT256) {
            allowed[_from][msg.sender] -= _amount;
        }

        emit Transfer(_from, _to, _amount);
        return true;
    }

    function approve(address _spender, uint256 _amount) public override returns (bool success) {
        allowed[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    function allowance(address _owner, address _spender) public override view returns (uint256 balance) {
        return allowed[_owner][_spender];
    }

    function balanceOf(address _owner) public override view returns (uint256 balance) {
        return balances[_owner];
    }
}