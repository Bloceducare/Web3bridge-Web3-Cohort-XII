// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract CustomERC20 {
    // Token details
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    
    // Balances and allowances
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    // Events required by ERC20 standard
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    // Constructor to initialize token details
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 initialSupply
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        
        // Mint initial supply to the deployer
        totalSupply = initialSupply * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
        
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    // Transfer tokens from sender to recipient
    function transfer(address to, uint256 amount) public returns (bool) {
        require(to != address(0), "ERC20: transfer to zero address");
        require(balanceOf[msg.sender] >= amount, "ERC20: insufficient balance");
        
        unchecked {
            balanceOf[msg.sender] -= amount;
            balanceOf[to] += amount;
        }
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    // Approve spender to spend tokens on behalf of owner
    function approve(address spender, uint256 amount) public returns (bool) {
        require(spender != address(0), "ERC20: approve to zero address");
        
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    // Transfer tokens from one address to another using allowance
    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(from != address(0), "ERC20: transfer from zero address");
        require(to != address(0), "ERC20: transfer to zero address");
        require(balanceOf[from] >= amount, "ERC20: insufficient balance");
        require(allowance[from][msg.sender] >= amount, "ERC20: insufficient allowance");
        
        unchecked {
            allowance[from][msg.sender] -= amount;
            balanceOf[from] -= amount;
            balanceOf[to] += amount;
        }
        
        emit Transfer(from, to, amount);
        return true;
    }
    
    // Increase allowance
    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        require(spender != address(0), "ERC20: approve to zero address");
        
        unchecked {
            allowance[msg.sender][spender] += addedValue;
        }
        
        emit Approval(msg.sender, spender, allowance[msg.sender][spender]);
        return true;
    }
    
    // Decrease allowance
    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        require(spender != address(0), "ERC20: approve to zero address");
        uint256 currentAllowance = allowance[msg.sender][spender];
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        
        unchecked {
            allowance[msg.sender][spender] = currentAllowance - subtractedValue;
        }
        
        emit Approval(msg.sender, spender, allowance[msg.sender][spender]);
        return true;
    }
    
    // Optional: Mint new tokens (only owner)
    function mint(address to, uint256 amount) public returns (bool) {
        require(to != address(0), "ERC20: mint to zero address");
        
        unchecked {
            totalSupply += amount;
            balanceOf[to] += amount;
        }
        
        emit Transfer(address(0), to, amount);
        return true;
    }
    
    // Optional: Burn tokens
    function burn(uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "ERC20: burn amount exceeds balance");
        
        unchecked {
            balanceOf[msg.sender] -= amount;
            totalSupply -= amount;
        }
        
        emit Transfer(msg.sender, address(0), amount);
        return true;
    }
}