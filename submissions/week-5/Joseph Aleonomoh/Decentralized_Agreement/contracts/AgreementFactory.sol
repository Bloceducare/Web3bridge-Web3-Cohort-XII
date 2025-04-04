// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./interfaces/IToken.sol";
import "./Agreement.sol";
import "./AgreementNft.sol";

contract AgreementFactory {
    mapping(address => address) public nftAddresses;
    mapping(address => address) public agreementAddresses;
    address public tokenAddress;

    event AgreementCreated(address agreementAddress, address nftAddress);
    event AgreementSigned(address agreementAddress, address signer);

    constructor(address _tokenAddress) {
        tokenAddress = _tokenAddress;
    }


    function createAgreement(string memory _name, uint256 _amount) public returns(bool) {
        bytes memory _symbol = bytes(_name);
        string memory symbol = string(abi.encodePacked(_symbol[0], _symbol[1], "NFT"));
        if(_amount <= 0) revert InvalidAmount();
        AgreementNft nft = new AgreementNft(_name, symbol);
        Agreement agreement = new Agreement(address(nft), _amount, tokenAddress);
        nftAddresses[msg.sender] = address(nft);
        agreementAddresses[msg.sender] = address(agreement);

        nft.mint(address(agreement), 1);

        emit AgreementCreated(address(agreement), address(nft));

        return true;

    }

    function signAgreement(address _agreementOwner) public returns(bool) {
        address _signer = msg.sender;
        if(agreementAddresses[_agreementOwner] == address(0)) revert Unauthorized();
        Agreement agreement = Agreement(agreementAddresses[_agreementOwner]);
        if(IToken(tokenAddress).allowance(_signer, address(this)) < agreement.amount()) revert InvalidAmount();
        if(IToken(tokenAddress).balanceOf(_signer) < agreement.amount()) revert InvalidAmount();
        IToken(tokenAddress).transferFrom(_signer, agreementAddresses[_agreementOwner], agreement.amount());
        agreement.Agree(_signer);

        emit AgreementSigned(agreementAddresses[_agreementOwner], _signer);

        return true;
    }

    function getNftContract() public view returns(IAgreementNft) {
        if(nftAddresses[msg.sender] == address(0)) revert Unauthorized();
        return IAgreementNft(nftAddresses[msg.sender]);
    }

    function getAgreementContract() public view returns (Agreement) {
        if(agreementAddresses[msg.sender] == address(0)) revert Unauthorized();
        return Agreement(agreementAddresses[msg.sender]);
    }


} 