// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract TicketNFT {
    string public name;
    string public symbol;
    string private _baseURI;
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    uint256 private _tokenIdCounter;
    mapping(uint256 => string) private _tokenImages;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    constructor(string memory _name, string memory _symbol, string memory baseURI_) {
        _baseURI = baseURI_;
        name = _name;
        symbol = _symbol;
    }

    function setBaseURI(string memory baseURI_) public {
        _baseURI = baseURI_;
    }

    function _baseTokenURI() internal view returns (string memory) {
        return _baseURI;
    }

    function tokenImage(uint256 _tokenId) public view returns (string memory) {
        require(_owners[_tokenId] != address(0), "Token does not exist");
        return _tokenImages[_tokenId];
    }

    function balanceOf(address _owner) public view returns (uint256) {
        require(_owner != address(0), "Invalid address");
        return _balances[_owner];
    }

    function ownerOf(uint256 _tokenId) public view returns (address) {
        address owner = _owners[_tokenId];
        require(owner != address(0), "Token does not exist");
        return owner;
    }

    function transferFrom(address _from, address _to, uint256 _tokenId) public {
        require(ownerOf(_tokenId) == _from, "Not owner");
        require(_to != address(0), "Invalid recipient");
        _balances[_from]--;
        _balances[_to]++;
        _owners[_tokenId] = _to;
        emit Transfer(_from, _to, _tokenId);
    }

    function mint(address _to, string memory _imageData) public {
        require(_to != address(0), "Invalid address");
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        _owners[newTokenId] = _to;
        _balances[_to]++;
        _tokenImages[newTokenId] = _imageData;
        emit Transfer(address(0), _to, newTokenId);
    }
}