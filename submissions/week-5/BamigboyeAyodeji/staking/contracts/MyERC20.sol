// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MyERC20 {
    address public _owner;
    uint256 private _totalSupply;
    string public name;
    string public symbol;
    uint8 public decimals;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    modifier onlyOwner() {
        require(msg.sender == _owner, "YOU ARE NOT THE OWNER");
        _;
    }

    constructor(string memory _name, uint256 _initialSupply, uint8 _decimals, string memory _symbol) {
        _owner = msg.sender;
        name = _name;
        symbol = _symbol;
        decimals = _decimals > 0 ? _decimals : 18;
        _totalSupply = _initialSupply * 10**decimals;
        _balances[msg.sender] = _totalSupply;  // Assign all tokens to contract deployer
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(_balances[msg.sender] >= amount, "YOUR BALANCE IS NOT ENOUGH");
        require(to != address(0), "INVALID ADDRESS");

        _balances[msg.sender] -= amount;
        _balances[to] += amount;

        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        require(spender != address(0), "INVALID ADDRESS");

        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function allowance(address owner, address spender) external view returns (uint256) {
        return _allowances[owner][spender];
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(_balances[from] >= amount, "YOUR BALANCE IS NOT ENOUGH");
        require(_allowances[from][msg.sender] >= amount, "INSUFFICIENT ALLOWANCE");

        _balances[from] -= amount;
        _balances[to] += amount;
        _allowances[from][msg.sender] -= amount;

        emit Transfer(from, to, amount);
        return true;
    }

    function mint(address to, uint256 amount) external onlyOwner returns (bool) {
        require(to != address(0), "INVALID ADDRESS");

        _totalSupply += amount;
        _balances[to] += amount;

        emit Transfer(address(0), to, amount);
        return true;
    }

    function burn(address from, uint256 amount) external onlyOwner returns (bool) {
        require(from != address(0), "INVALID ADDRESS");
        require(_balances[from] >= amount, "INSUFFICIENT BALANCE");

        _balances[from] -= amount;
        _totalSupply -= amount;

        emit Transfer(from, address(0), amount);
        return true;
    }
}