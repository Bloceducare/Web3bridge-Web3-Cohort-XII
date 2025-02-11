// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyToken {
    // Token details
    string public name;
    string public symbol;
    uint8 public decimals = 18; // Standard ERC-20 decimals
    uint256 public totalSupply;

    // Balances and allowances
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // Constructor to initialize token details and total supply
    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10 ** uint256(decimals)); // Adjust for decimals
        balanceOf[msg.sender] = totalSupply; // Assign all tokens to the deployer
        emit Transfer(address(0), msg.sender, totalSupply); // Minting event
    }

    // Transfer tokens from the sender to another address
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0), "Invalid address"); // Prevent sending to zero address
        require(balanceOf[msg.sender] >= _value, "Insufficient balance"); // Check sender's balance
        balanceOf[msg.sender] -= _value; // Deduct from sender
        balanceOf[_to] += _value; // Add to recipient
        emit Transfer(msg.sender, _to, _value); // Emit Transfer event
        return true;
    }

    // Approve another address to spend tokens on behalf of the sender
    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(_spender != address(0), "Invalid address"); // Prevent approving zero address
        allowance[msg.sender][_spender] = _value; // Set allowance
        emit Approval(msg.sender, _spender, _value); // Emit Approval event
        return true;
    }

    // Transfer tokens on behalf of an owner (requires prior approval)
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0), "Invalid address"); // Prevent sending to zero address
        require(balanceOf[_from] >= _value, "Insufficient balance"); // Check owner's balance
        require(allowance[_from][msg.sender] >= _value, "Allowance exceeded"); // Check allowance
        balanceOf[_from] -= _value; // Deduct from owner
        balanceOf[_to] += _value; // Add to recipient
        allowance[_from][msg.sender] -= _value; // Deduct from allowance
        emit Transfer(_from, _to, _value); // Emit Transfer event
        return true;
    }
}