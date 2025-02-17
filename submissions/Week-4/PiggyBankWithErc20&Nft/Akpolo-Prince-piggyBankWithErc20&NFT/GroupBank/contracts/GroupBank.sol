// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IOurERC721 is IERC721 {
    function mint(address _to) external;
    
}

contract OurPiggyBank {

    // state variables
    uint256 public targetAmount;
    mapping(address => uint256) public contributions;
    uint256 public immutable withdrawalDate;
    uint8 public contributorsCount;
    address public manager;
    IERC20 cxii;
    mapping(address => uint256) vvip;
    mapping(address => bool) isMinted;
    IOurERC721 cxii_nft; 
    

    // events
    event Contributed (
        address indexed Contributor,
        uint256 amount,
        uint256 time
    );

    event Withdrawn (
        uint256 amount,
        uint256 time
    );

    // constructor
    constructor (uint256 _targetAmount, uint256 _withdrawalDate, address _manager, address erc20TokenAddress, address erc721TokenAddress) {
        require(_withdrawalDate > block.timestamp, 'WITHDRAWAL MUST BE IN FUTURE');
        
        targetAmount = _targetAmount;
        withdrawalDate = _withdrawalDate;
        manager = _manager;
        cxii = IERC20(erc20TokenAddress);
        cxii_nft = IOurERC721(erc721TokenAddress);

    }

    modifier onlyManager () {
        require(msg.sender == manager, 'YOU WAN THIEF ABI ?');
        _;
    }

    // save
    function save (uint256 _amount) external {
        
        require(msg.sender != address(0), 'UNAUTHORIZED ADDRESS');

        require(block.timestamp <= withdrawalDate, 'YOU CAN NO LONGER SAVE');

        require(_amount > 0, 'YOU ARE BROKE');
        
        bool txn = cxii.transferFrom(msg.sender, address(this), _amount);
        
        require(txn, "Transaction Failed");

        // check if the caller is a first time contributor
        if(contributions[msg.sender] == 0) {
            contributorsCount += 1;
        }
        
        if(vvip[msg.sender] >= 2 && isMinted[msg.sender]  == false) {
            // mint nft
            cxii_nft.mint(msg.sender);

            isMinted[msg.sender] = true;
        }else {
            vvip[msg.sender] += 1;
        }
        
        contributions[msg.sender] += _amount;

        emit Contributed(msg.sender, _amount, block.timestamp);
        
    }

    // withdrawal
    function withdrawal () external onlyManager {
        // require that its withdrawal time or greater
        require(block.timestamp >= withdrawalDate, 'NOT YET TIME');
        
        uint256 _contractBalance =  cxii.balanceOf(address(this));

        // require contract bal is > or = targetAmount
        require(_contractBalance >= targetAmount, 'TARGET AMOUNT NOT REACHED');
        
        bool txn = cxii.transfer(manager, _contractBalance);
        
        require(txn, "Transaction Failed");

        emit Withdrawn(_contractBalance, block.timestamp);
    }

    function getBalance() public view returns(uint256) {
         return cxii.balanceOf(address(this));
    }

    function geterc721Balance(address _address) public view returns (uint256) {
        return cxii_nft.balanceOf(_address);
    }

}
