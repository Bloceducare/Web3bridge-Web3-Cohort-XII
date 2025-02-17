// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract erc20 {

string public name = "LagosCoin";
string public symbol = "LGC";
uint8 public decimals = 18;
uint256 public totalSupply;
address public owner;

mapping(address => uint256) public balances;
mapping (address => mapping(address => uint256)) allowances;
mapping (address => mapping(address => uint256)) approves;

event Transfer (address indexed _from, address indexed _to, uint256 _value);
event approval (address indexed owner, address indexed spender, uint256 _value);

constructor (string memory _name, string memory _symbol, uint8 _decimals, uint256 _totalSupply) {
	name = _name;
	symbol = _symbol;
	decimals = _decimals;
	totalSupply = _totalSupply;
	owner = msg.sender;
	balances[owner] = _totalSupply;
}

function balanceOf(address _owner) public view returns (uint256 balance){
	require(_owner != address(0), "THIS ADDRESS IS INVALID");
	balance = balances[owner];
}

function transfer(address _to, uint256 _value) public returns (bool success) {
	require( msg.sender != address(0) && _to != address(0), "THIS ADDRESS IS INVALID");
	require( balances[msg.sender] >= _value,"INSUFFICIENT FUNDS");

	balances[msg.sender] -= _value;
	balances[msg.sender] += _value;
	emit Transfer (msg.sender, _to, _value);

	success = true;
}


function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
	require( _from != address(0) && _to != address(0), "THIS ADDRESS IS NOT VALID");
	require( balances[_from] >= _value, "FUNDS NOT SUFFICIENT");

	balances[_from] -= _value;
	balances[_to] += _value;
	allowances[msg.sender][_from] -= _value;

	emit Transfer (_from, _to, _value);

	success = true;
}

// approves the piggy to spend mney from the token - like a persons signture, verifying someone can spend for catch in the cheque//
function approve(address _spender, uint256 _value) public returns (bool success) {
	require(_spender != address(0) && msg.sender != address(0), "INVALID ADDRESS");
    require(balances[msg.sender] >= _value, "INSUFFICIENT BALANCE");

    approves[_spender][msg.sender] = _value;
    allowances[_spender][msg.sender] = _value;	//money sent to spender
    success = true;

    emit approval(msg.sender, _spender, _value);
}



// like a check book, to tell someone to
function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
}






// function name() public view returns (string)
// function symbol() public view returns (string)
// function decimals() public view returns (uint8)
// function totalSupply() public view returns (uint256)

// function balanceOf(address _owner) public view returns (uint256 balance)
// function transfer(address _to, uint256 _value) public returns (bool success)
// function transferFrom(address _from, address _to, uint256 _value) public returns (bool success)
// function approve(address _spender, uint256 _value) public returns (bool success)
// function allowance(address _owner, address _spender) public view returns (uint256 remaining)


// function mint
//function Burn

}