// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


interface IERC20Token {
    function transfer(address, uint256) external returns (bool);
    function approve(address, uint256) external returns (bool);
    function transferFrom(address, address, uint256) external returns (bool);
    function totalSupply() external view returns (uint256);
    function balanceOf(address) external view returns (uint256);
    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}


contract PiggyBankMineNFTERC is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    address internal piggyTokenAddress;
    struct User {
        uint256 balance;
        uint256 target;
        uint256 depositCount;
        bool hasNFT;
    }

    mapping(address => User) public users;


    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event TargetSet(address indexed user, uint256 target);

    constructor(address _piggyTokenAddress) ERC721("PiggyBank NFT", "PBNFT") {
        piggyTokenAddress = _piggyTokenAddress;
    }

    function deposit() public payable {
        require(msg.value > 0, "You must deposit some Ether");
        users[msg.sender].balance += msg.value;
        users[msg.sender].depositCount += 1;
        
        require(
            IERC20Token(piggyTokenAddress).transferFrom(
            msg.sender, address(this),
            msg.value
        ),
        "Transfer Failed"
        );

        // Mint NFT after second deposit
        if (users[msg.sender].depositCount == 2 && !users[msg.sender].hasNFT) {
            _tokenIds.increment();
            uint256 newTokenId = _tokenIds.current();
            _mint(msg.sender, newTokenId);
            _setTokenURI(newTokenId, "https://your-nft-metadata-uri.json");
            users[msg.sender].hasNFT = true;
        }

        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) public {
        require(amount > 0, "You must withdraw amount greater than 0");
        require(users[msg.sender].balance >= amount, "Insufficient balance");
        require(IERC20Token(piggyTokenAddress).transfer(msg.sender, amount), "Transfer failed");

        users[msg.sender].balance -= amount;

        payable(msg.sender).transfer(amount);
        emit Withdrawn(msg.sender, amount);
    }

    function setTarget(uint256 target) public {
        users[msg.sender].target = target;
        emit TargetSet(msg.sender, target);
    }

    function checkBalance(address user) public view returns (uint256) {
        return users[user].balance;
    }
}
