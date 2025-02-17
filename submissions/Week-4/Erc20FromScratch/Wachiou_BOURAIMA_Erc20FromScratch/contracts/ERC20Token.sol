// SPDX-License-Identifier: MIT 

pragma solidity ^0.8.20;

contract ERC20Token {

    address public _owner;
    uint256 public totalSupply;
    string public name;
    string public symbol;


    mapping(address => uint256) public _balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value, uint256 transferAt);
    event Approval(address indexed owner, address indexed spender, uint256 value, uint256 approvedAt);
    event minted(address _to, uint256 amount, uint256 mintedAt );


    modifier onlyOwner() {
        require(msg.sender == _owner, "YOU ARE NOT THE OWNER");
        _;
    }
    constructor(string memory _name, uint256 _initialSupply, uint8 decimals, string memory _symbol) {
        _owner = msg.sender;
        uint256 _decimals = decimals > 0 ? decimals : 18;
        totalSupply = _initialSupply * 10**_decimals;
        name = _name;
        symbol = _symbol;
        _balanceOf[address(this)] = totalSupply;
    }

    
    function transfer(address _to, uint256 _amount) external {
        require(_balanceOf[msg.sender] >= _amount, "YOUR BALANCE IS NOT ENOUGH");
        require(_to != address(0), "INVALID ADDRESS");

        _balanceOf[msg.sender] -= _amount;
        _balanceOf[_to] += _amount;

        emit Transfer(msg.sender, _to, _amount, block.timestamp);
     
    }

    function approve(address _spender, uint256 _amount) external  {
        require(_spender != address(0), "INVALID ADDRESS");

        allowance[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount, block.timestamp);
       
    }

    function transferFrom(address _from, address _to, uint256 _amount) external {
        require(_balanceOf[_from] >= _amount, "YOUR BALANCE IS NOT ENOUGH");
        require(allowance[_from][msg.sender] >= _amount, "INSUFFICIENT ALLOWANCE");

        _balanceOf[_from] -= _amount;
        _balanceOf[_to] += _amount;
        allowance[_from][msg.sender] -= _amount;

        emit Transfer(_from, _to, _amount, block.timestamp);
       
    }
    
    function _mint(address _to, uint256 _amount) external onlyOwner returns (bool) {
        require(_to != address(0), "UNAUTHORISED ADDRESS");
        require(totalSupply > 0, "TOTAL SUPPLY REACHED");
        require(_amount <= totalSupply, "OMO OGA SHEBI YOU WAN BROKE ME");
        _balanceOf[_to] += _amount;
        _balanceOf[address(this)] -=  _amount;

        emit minted(_to, _amount, block.timestamp);
        return true;


    }
    function balanceOf(address _account) external view returns (uint256) {
        return _balanceOf[_account];
    }

    function _burn(address _from, uint256 _amount) external onlyOwner returns (bool) {
        require(_from != address(0), "UNAUTHORISED ADDRESS");
        require(_balanceOf[_from] >= _amount, "INSUFFICIENT BALANCE");
        _balanceOf[_from] -= _amount;
        totalSupply -= _amount;

        return true;
    }


}
