// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MyNFT {
    string public name;
    string public symbol;
    uint256 public totalSupply;
    uint256 public nextTokenId;
    address public owner;
    address public minter;
    string public imageBase64;

    string private imageSVG;
    mapping(uint256 => address) public tokenOwners;
    mapping(address => uint256) public balances;
    mapping(uint256 => address) public tokenApprovals;
    mapping(address => uint256[]) public ownedTokens;
    mapping(address => mapping(address => bool)) public operatorApprovals;

    constructor(
        string memory _name,
        string memory _symbol,
        uint32 _totalSupply,
        string memory _imageSVG
    ) {
        name = _name;
        symbol = _symbol;
        imageSVG = _imageSVG;
        totalSupply = _totalSupply;
        minter = msg.sender;
        imageBase64 = tokenURI();
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only manager can call this function");
        _;
    }

    modifier onlyMinter() {
        require(msg.sender == minter, "Only minter can call this function");
        _;
    }

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 indexed _tokenId
    );
    event Approval(
        address indexed _owner,
        address indexed _approved,
        uint256 indexed _tokenId
    );
    event ApprovalForAll(
        address indexed _owner,
        address indexed _operator,
        bool _approved
    );

    function _isApprovedOrOwner(
        address spender,
        uint256 tokenId
    ) internal view returns (bool) {
        address _owner = tokenOwners[tokenId];
        return (spender == _owner ||
            this.getApproved(tokenId) == spender ||
            operatorApprovals[_owner][spender]);
    }

    function mint(address _to) external onlyMinter {
        require(_to != address(0), "INVALID ADDRESS");
        require(nextTokenId < totalSupply, "MAX SUPPLY REACHED");
        uint256 _tokenId = nextTokenId;
        tokenOwners[_tokenId] = _to;
        balances[_to] = balances[_to] + 1;
        nextTokenId = nextTokenId + 1;
        emit Transfer(address(0), _to, _tokenId);
    }

    function balanceOf(address _account) external view returns (uint256) {
        require(_account != address(0), "INVALID ADDRESS");
        return balances[_account];
    }

    function ownerOf(uint256 _tokenId) external view returns (address) {
        address _owner = tokenOwners[_tokenId];
        require(_owner != address(0), "INVALID TOKEN ID");
        return _owner;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external payable {
        require(_from != address(0), "INVALID FROM ADDRESS");
        require(_to != address(0), "INVALID TO ADDRESS");
        require(_isApprovedOrOwner(msg.sender, _tokenId), "NOT APPROVED");

        tokenOwners[_tokenId] = _to;
        balances[_from] -= 1;
        balances[_to] += 1;
        emit Transfer(_from, _to, _tokenId);
    }

    function approve(
        address _approved,
        uint256 _tokenId
    ) external payable returns (bool) {
        address _owner = tokenOwners[_tokenId];
        require(
            _owner == msg.sender || operatorApprovals[_owner][msg.sender],
            "NOT AUTHORIZED"
        );
        require(_approved != address(0), "INVALID ADDRESS");

        tokenApprovals[_tokenId] = _approved;
        emit Approval(_owner, _approved, _tokenId);

        return true;
    }

    function setApprovalForAll(
        address _operator,
        bool _approved
    ) external returns (bool) {
        require(_operator != address(0), "INVALID ADDRESS");
        require(_operator != msg.sender, "Owner cannot approve themselves");

        operatorApprovals[msg.sender][_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);

        return _approved;
    }

    function getApproved(uint256 _tokenId) external view returns (address) {
        return tokenApprovals[_tokenId];
    }

    function isApprovedForAll(
        address _owner,
        address _operator
    ) external view returns (bool) {
        return operatorApprovals[_owner][_operator];
    }

    function tokenURI() public view returns (string memory) {
        if (bytes(imageSVG).length == 0) {
            string memory json = Base64.encode(
                bytes(
                    string(
                        abi.encodePacked(
                            '{"name": "Wass NFT", "description": "An NFT with on-chain SVG", "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgMTI0IDEyNCIgZmlsbD0ibm9uZSI+CjxyZWN0IHdpZHRoPSIxMjQiIGhlaWdodD0iMTI0IiByeD0iMjQiIGZpbGw9IiNGOTczMTYiLz4KPHBhdGggZD0iTTE5LjM3NSAzNi43ODE4VjEwMC42MjVDMTkuMzc1IDEwMi44MzQgMjEuMTY1OSAxMDQuNjI1IDIzLjM3NSAxMDQuNjI1SDg3LjIxODFDOTAuNzgxOCAxMDQuNjI1IDkyLjU2NjQgMTAwLjMxNiA5MC4wNDY2IDk3Ljc5NjZMMjYuMjAzNCAzMy45NTM0QzIzLjY4MzYgMzEuNDMzNiAxOS4zNzUgMzMuMjE4MiAxOS4zNzUgMzYuNzgxOFoiIGZpbGw9IndoaXRlIi8+CjxjaXJjbGUgY3g9IjYzLjIxMDkiIGN5PSIzNy41MzkxIiByPSIxOC4xNjQxIiBmaWxsPSJibGFjayIvPgo8cmVjdCBvcGFjaXR5PSIwLjQiIHg9IjgxLjEzMjgiIHk9IjgwLjcxOTgiIHdpZHRoPSIxNy41Njg3IiBoZWlnaHQ9IjE3LjM4NzYiIHJ4PSI0IiB0cmFuc2Zvcm09InJvdGF0ZSgtNDUgODEuMTMyOCA4MC43MTk4KSIgZmlsbD0iI0ZEQkE3NCIvPgo8L3N2Zz4=""}'
                        )
                    )
                )
            );

            return
                string(abi.encodePacked("data:application/json;base64,", json));
        } else {
            return
                string(
                    abi.encodePacked(
                        "data:image/svg+xml;base64,",
                        Base64.encode(bytes(imageSVG))
                    )
                );
        }
    }
}
