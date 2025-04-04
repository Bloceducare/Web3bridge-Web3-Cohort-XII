// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error INVALID_ADDRESS();
error INVALID_AGREEMENT_ID();
error INSUFFICIENT_BALANCE();
error AGREEMENT_NOT_YET_SIGNED();
error PAY_EXACT_AGREEMENT_PRICE();
error ONLY_BUYER_HAS_ACCESS();
error ONLY_SELLER_HAS_ACCESS();
error TRANSFER_FAILED();
error AGREEMENT_LOCKED();
error DEADLINE_ELAPSE();
error AGREEMENT_DOES_NOT_EXIST();

contract AgreementSigning {
  IERC20 public token;

  uint256 public agreementId;
  mapping(address => mapping(uint256 => Agreement)) public agreements;
  mapping(address => mapping(uint256 => bool)) public signedAgreement;

  event agreementCreated(address indexed seller, uint256 agreementId);
  event agreementSigned(address indexed seller, uint256 agreementId);
  event agreementCompleted(address indexed buyer, uint256 agreementId);

  struct Agreement {
    uint256 agreementId;
    uint256 price;
    string name;
    string description;
    bool locked;
    bool signed;
    uint256 deadline;
    address seller;
    address buyer;
  }

  constructor(address _tokenAddr) {
    token = IERC20(_tokenAddr);
  }

  modifier onlyBuyer(uint256 _agreementId) {
      if(msg.sender != agreements[msg.sender][_agreementId].buyer) revert ONLY_BUYER_HAS_ACCESS();
      _;
  }

  modifier onlySeller(address _buyer, uint256 _agreementId) {
      if(msg.sender != agreements[_buyer][_agreementId].seller) revert ONLY_SELLER_HAS_ACCESS();
      _;
  }

  function createAgreement(address _seller, string memory _name, string memory _desc, uint256 _price, uint256 _deadline) external {
    if (msg.sender == address(0)) revert INVALID_ADDRESS();
    uint256 newAgreementId = agreementId + 1;
    Agreement memory agreement;

    agreement.name = _name;
    agreement.description = _desc;
    agreement.price = _price;
    agreement.agreementId = newAgreementId;
    agreement.deadline = _deadline;
    agreement.seller = _seller;
    agreement.buyer = msg.sender;

    agreements[msg.sender][newAgreementId] = agreement;
    agreementId = newAgreementId;

    emit agreementCreated(msg.sender, newAgreementId);
  }

  function signAgreement(address buyerAddr, uint256 _agreementId) external onlySeller(buyerAddr, _agreementId) {
    if(msg.sender == address(0)) revert INVALID_ADDRESS();
    if(_agreementId == 0) revert INVALID_AGREEMENT_ID();
    if(agreements[buyerAddr][_agreementId].agreementId == 0) revert AGREEMENT_DOES_NOT_EXIST();
    if(agreements[buyerAddr][_agreementId].deadline < block.timestamp) revert DEADLINE_ELAPSE();
    if(agreements[buyerAddr][_agreementId].locked) revert AGREEMENT_LOCKED();
    
    agreements[buyerAddr][_agreementId].signed = true;
    signedAgreement[msg.sender][_agreementId] = true;
    // lockedAgreements[msg.sender][_agreementId] = agreements[buyerAddr][_agreementId];
    emit agreementSigned(msg.sender, _agreementId);
  }

  function completeAgreement(address sellerAddr, uint256 _agreementId, uint256 amount) external onlyBuyer(_agreementId) {
    if(msg.sender == address(0)) revert INVALID_ADDRESS();
    if(_agreementId == 0) revert INVALID_AGREEMENT_ID();
    
    if(!agreements[msg.sender][_agreementId].signed) revert AGREEMENT_NOT_YET_SIGNED();
    if(token.balanceOf(msg.sender) < agreements[sellerAddr][_agreementId].price) revert INSUFFICIENT_BALANCE();
    if(amount != agreements[sellerAddr][_agreementId].price) revert PAY_EXACT_AGREEMENT_PRICE();
    if(amount != agreements[sellerAddr][_agreementId].price) revert PAY_EXACT_AGREEMENT_PRICE();

    if(!token.transferFrom(msg.sender, sellerAddr, amount)) revert TRANSFER_FAILED();

    // agreements[msg.sender][_agreementId].locked = false;
    // agreements[msg.sender][_agreementId].buyer = msg.sender;

    emit agreementCompleted(msg.sender, _agreementId);
  }

}