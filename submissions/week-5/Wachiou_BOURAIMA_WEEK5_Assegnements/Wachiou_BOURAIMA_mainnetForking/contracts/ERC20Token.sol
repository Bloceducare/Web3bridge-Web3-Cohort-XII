// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract ERC20Token {
    address public _owner;

    constructor() {
        _owner = msg.sender;
    }
    event Transfered(address to, address from,uint256 amount );
    event Approved(address spender, uint256 amount);
    function TotalSupply() public pure returns (uint256) {
        return 1000000;
    }
    function balanceOf(address owner) public view returns (uint256) {
        return owner.balance;
    }

    function Transfer(address to, uint256 amount) public {
        require(msg.sender == _owner, "You are not the owner");
        payable(to).transfer(amount);
        emit Transfered(_owner, to, amount);
    }
    function TransferFrom(address from, address to, uint256 amount) public {
        require(msg.sender == _owner, "You are not the owner");
        payable(to).transfer(amount);
        emit Transfered(from, to, amount);
    }
    function Approve(address spender, uint256 amount)  public   {
        require(spender == msg.sender, "You are not the spender");
        emit Approved(spender, amount);

        
    }
    function Allowaance(address owner, address spender) public view returns (uint256) {
        require(spender == msg.sender, "You are not the spender");
        return owner.balance;
    }

}
