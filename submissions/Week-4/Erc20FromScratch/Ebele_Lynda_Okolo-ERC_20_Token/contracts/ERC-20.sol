// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

contract MyToken {
    // Mapping of addresses to balances
    mapping (address => uint256) public balances;

    // Mapping of addresses to allowed spenders
    mapping (address => mapping (address => uint256)) public allowed;

    // Total supply of tokens
    uint256 public totalSupply;

    // Token metadata
    string public name;
    string public symbol;
    uint8 public decimals;

    // Event emitted when tokens are transferred
    event Transfer(address indexed from, address indexed to, uint256 value);

    // Event emitted when approval is given
    event Approval(address indexed owner, address indexed spender, uint256 value);

  // Constructor  // Constructor
    constructor(uint256 _totalSupply, string memory _name, string memory _symbol, uint8 _decimals) {
        // Initialize token metadata
        name = _name;
        symbol = _symbol;
        decimals = _decimals;

        // Initialize total supply
        totalSupply = _totalSupply;
    }

    // Function to mint new tokens
    function mint(uint256 _amount) public {
        // Update total supply
        totalSupply += _amount;

        // Update minter's balance
        balances[msg.sender] += _amount;
    }

    // Function to transfer tokens
    function transfer(address _to, uint256 _value) public returns (bool) {
        // Check if sender has enough balance
        require(balances[msg.sender] >= _value, "Insufficient balance");

        // Update sender's balance
        balances[msg.sender] -= _value;

        // Update recipient's balance
        balances[_to] += _value;

        // Emit transfer event
        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    // Function to approve spender
    function approve(address _spender, uint256 _value) public returns (bool) {
        // Update allowed spenders
        allowed[msg.sender][_spender] = _value;

        // Emit approval event
        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    // Function to transfer tokens from one address to another
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        // Check if spender has enough allowance
        require(allowed[_from][msg.sender] >= _value, "Insufficient allowance");

        // Check if sender has enough balance
        require(balances[_from] >= _value, "Insufficient balance");

        // Update spender's allowance
        allowed[_from][msg.sender] -= _value;

        // Update sender's balance
        balances[_from] -= _value;

        // Update recipient's balance
        balances[_to] += _value;

        // Emit transfer event
        emit Transfer(_from, _to, _value);

        return true;
    }

    // Function to get the balance of an address
    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }

    // Function to get the allowance of an address for a spender
    function allowance(address _owner, address _spender) public view returns (uint256) {
        return allowed[_owner][_spender];
    }
}