// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

contract ERC20 {
    string public name;
    string public symbol;
    uint8 public immutable decimals;
    uint256 public immutable totalSupply;
    mapping(address => uint256) _balances;
    mapping(address => mapping(address => uint256)) _allowances;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply
    ) {
        require(bytes(_name).length > 0, "ERC20: name cannot be empty");
        require(bytes(_symbol).length > 0, "ERC20: symbol cannot be empty");
        require(_initialSupply > 0, "ERC20: supply must be greater than 0");

        name = _name;
        symbol = _symbol;
        decimals = 18;

        // Calculate total supply with decimals
        totalSupply = _initialSupply * 10 ** decimals;

        // Assign all tokens to contract deployer
        _balances[msg.sender] = totalSupply;

        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function balanceOf(address _owner) public view returns (uint256) {
        require(
            _owner != address(0),
            "ERC20: balance query for the zero address"
        );
        return _balances[_owner];
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_to != address(0), "ERC20: transfer to the zero address");
        require(_value > 0, "ERC20: transfer amount must be greater than 0");
        require(
            _balances[msg.sender] >= _value,
            "ERC20: transfer amount exceeds balance"
        );

        _balances[msg.sender] -= _value;
        _balances[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool) {
        require(_from != address(0), "ERC20: transfer from the zero address");
        require(_to != address(0), "ERC20: transfer to the zero address");
        require(_value > 0, "ERC20: transfer amount must be greater than 0");
        require(
            _balances[_from] >= _value,
            "ERC20: transfer amount exceeds balance"
        );
        require(
            _allowances[_from][msg.sender] >= _value,
            "ERC20: insufficient allowance"
        );

        _balances[_from] -= _value;
        _balances[_to] += _value;
        _allowances[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool) {
        require(_spender != address(0), "ERC20: approve to the zero address");
        require(
            _balances[msg.sender] >= _value,
            "ERC20: approve amount exceeds balance"
        );

        _allowances[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(
        address _owner,
        address _spender
    ) public view returns (uint256) {
        require(
            _owner != address(0),
            "ERC20: allowance query for the zero address owner"
        );
        require(
            _spender != address(0),
            "ERC20: allowance query for the zero address spender"
        );
        return _allowances[_owner][_spender];
    }
}
