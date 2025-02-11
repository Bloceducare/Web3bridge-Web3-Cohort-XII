// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./IUSDB.sol";
import "./IVIPContributor.sol";
import {ERC721Holder} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract PiggyBank is ERC721Holder {
    IUSDB public USDBContract;
    IVIPContributor public NFTContract;

    // state variables
    uint256 public targetAmount;
    uint256 public immutable withdrawalDate;
    uint8 public contributorsCount;
    address public manager;

    mapping(address => uint256) public contributionsAmnt;
    mapping(address => uint256) public contributorCount;

    // events
    event Contributed(
        address indexed Contributor,
        uint256 amount,
        uint256 time
    );

    event Withdrawn(uint256 amount, uint256 time);
    event NFTMinted(address minter, address receiver);

    // constructor
    constructor(
        address _USDBContract,
        address _NFTContract,
        uint256 _targetAmount,
        uint256 _withdrawalDate,
        address _manager
    ) {
        require(
            _withdrawalDate > block.timestamp,
            "WITHDRAWAL MUST BE IN FUTURE"
        );
        require(_targetAmount > 0, "Target amount must be greater than zero");

        USDBContract = IUSDB(_USDBContract);
        NFTContract = IVIPContributor(_NFTContract);

        targetAmount = _targetAmount;
        withdrawalDate = _withdrawalDate;
        manager = _manager;
    }

    modifier onlyManager() {
        require(msg.sender == manager, "YOU WAN THIEF ABI ?");
        _;
    }

    // save
    function save(uint256 _amountToContribute) external {
        require(msg.sender != address(0), "UNAUTHORIZED ADDRESS");
        require(block.timestamp <= withdrawalDate, "YOU CAN NO LONGER SAVE");
        require(
            USDBContract.balanceOf(msg.sender) >= _amountToContribute,
            "YOU ARE BROKE"
        );
        require(
            USDBContract.allowance(msg.sender, address(this)) >=
                _amountToContribute,
            "Amount is not allowed"
        );

        // If this is the first contribution from the sender, increase the contributors count
        if (contributionsAmnt[msg.sender] == 0) {
            contributorsCount += 1;

            // Track the number of times the user has contributed
        }

        contributorCount[msg.sender] += 1;
        // Mint NFT if this is the contributor's second time contributing
        if (contributorCount[msg.sender] == 2) {
            // NFTContract.safeTransferFrom(address(this), msg.sender, 0);
            NFTContract.safeMint(msg.sender);
            emit NFTMinted(address(this), msg.sender);
        }

        // Transfer the contribution amount
        USDBContract.transferFrom(
            msg.sender,
            address(this),
            _amountToContribute
        );

        // Update contributions amount
        contributionsAmnt[msg.sender] += _amountToContribute;

        emit Contributed(msg.sender, _amountToContribute, block.timestamp);
    }

    // withdrawal
    function withdrawal() external onlyManager {
        // require that its withdrawal time or greater
        require(block.timestamp >= withdrawalDate, "NOT YET TIME");

        // require contract bal is > or = targetAmount
        require(
            USDBContract.balanceOf(address(this)) >= targetAmount,
            "TARGET AMOUNT NOT REACHED"
        );

        uint256 contractBal = USDBContract.balanceOf(address(this));

        // // transfer to manager
        USDBContract.transfer(manager, contractBal);

        emit Withdrawn(contractBal, block.timestamp);
    }
}
