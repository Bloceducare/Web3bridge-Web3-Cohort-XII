// SPDX-License-Identifier:UNLICENSE
pragma solidity ^0.8.28;

import "./errors.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract salesAgreement {
    uint256 agreement_count;
    mapping(uint256 => AgreementDetails) public agreements;
    mapping(uint256 => uint256) public escrowBalances;

    event AgreementCreated(uint256 _id, address _seller, address _buyer);
    event AgreementConfirmed(uint256 _id, address _seller, address _buyer);
    event AgreementCompleted(uint256 _id, address _seller, address _buyer);

    constructor() {
        agreement_count = 0;
    }

    enum DisputeResolution {
        COURT,
        SMART_CONTRACT_REGULATION
    }

    struct AgreementDetails {
        string itemName;
        string itemDescription;
        uint256 price;
        address buyer;
        address seller;
        address paymentToken; // address(0) for ETH, token address for ERC20
        uint256 deliveryDate;
        bool isEscrowUsed;
        address escrowAgent;
        bool isDelivered;
        bool isRefundable;
        DisputeResolution resolution;
    }

    function createAgreement(
        string memory _item,
        string memory _description,
        uint256 _price,
        address _buyer,
        address _paymentToken, // New parameter
        uint256 _deliveryDate,
        bool _isEscrowUsed,
        address _escrowAgent,
        bool _isRefundable,
        DisputeResolution _resolution
    ) external {
        uint256 _id = agreement_count++;
        if (msg.sender == address(0)) {
            revert Errors.InvalidAddress();
        }

        if (_deliveryDate < block.timestamp) {
            revert Errors.InvalidDate();
        }

        if (bytes(_item).length == 0 || bytes(_description).length == 0) {
            revert Errors.EmptyString();
        }

        if (_price == 0) {
            revert Errors.InvalidPrice();
        }

        agreements[_id] = AgreementDetails({
            itemName: _item,
            itemDescription: _description,
            price: _price,
            buyer: _buyer,
            seller: msg.sender,
            paymentToken: _paymentToken,
            deliveryDate: _deliveryDate,
            escrowAgent: _escrowAgent,
            isEscrowUsed: _isEscrowUsed,
            isDelivered: false,
            isRefundable: _isRefundable,
            resolution: _resolution
        });

        emit AgreementCreated(_id, msg.sender, _buyer);
    }

    function confirmAgreement(uint256 _id) external payable {
        AgreementDetails storage agreement = agreements[_id];
        if (msg.sender != agreement.buyer && msg.sender != agreement.seller) {
            revert Errors.Unauthorized();
        }

        if (agreement.paymentToken == address(0)) {
            // ETH payment
            if (msg.value == 0) {
                revert Errors.InsufficientFunds();
            }
            if (agreement.price != msg.value) {
                revert Errors.InsufficientFunds();
            }

            if (agreement.isEscrowUsed) {
                if (msg.sender != agreement.buyer) {
                    revert Errors.NotBuyer();
                }
                if (agreement.escrowAgent == address(0)) {
                    revert Errors.InvalidAddress();
                }
                if (
                    agreement.resolution ==
                    DisputeResolution.SMART_CONTRACT_REGULATION
                ) {
                    revert Errors.DisputeResolutionNotAllowed();
                }

                escrowBalances[_id] = msg.value;
            } else {
                payable(agreement.seller).transfer(msg.value);
            }
        } else {
            // ERC20 payment
            if (msg.value > 0) {
                revert Errors.ETHNotAccepted();
            }

            IERC20 token = IERC20(agreement.paymentToken);

            if (agreement.isEscrowUsed) {
                if (msg.sender != agreement.buyer) {
                    revert Errors.NotBuyer();
                }
                if (agreement.escrowAgent == address(0)) {
                    revert Errors.InvalidAddress();
                }
                if (
                    agreement.resolution ==
                    DisputeResolution.SMART_CONTRACT_REGULATION
                ) {
                    revert Errors.DisputeResolutionNotAllowed();
                }

                bool success = token.transferFrom(
                    msg.sender,
                    address(this),
                    agreement.price
                );
                if (!success) revert Errors.TokenTransferFailed();

                escrowBalances[_id] = agreement.price;
            } else {
                bool success = token.transferFrom(
                    msg.sender,
                    agreement.seller,
                    agreement.price
                );
                if (!success) revert Errors.TokenTransferFailed();
            }
        }

        emit AgreementConfirmed(_id, agreement.seller, agreement.buyer);
    }

    function markAsDelivered(uint256 _id) public {
        AgreementDetails storage agreement = agreements[_id];
        if (msg.sender != agreement.buyer) {
            revert Errors.NotBuyer();
        }
        agreement.isDelivered = true;
    }

    function releaseEscrow(uint256 _id) external {
        AgreementDetails storage agreement = agreements[_id];

        if (msg.sender != agreement.escrowAgent) {
            revert Errors.NotEscrowAgent();
        }

        if (!agreement.isDelivered) {
            // Ensure delivery is confirmed
            revert Errors.DeliveryNotConfirmed();
        }

        if (agreement.deliveryDate > block.timestamp) {
            revert Errors.DeliveryDateNotReached();
        }

        if (escrowBalances[_id] == 0) {
            revert Errors.NoFundsInEscrow();
        }

        uint256 amount = escrowBalances[_id];
        escrowBalances[_id] = 0;

        if (agreement.paymentToken == address(0)) {
            payable(agreement.seller).transfer(amount);
        } else {
            IERC20 token = IERC20(agreement.paymentToken);
            bool success = token.transfer(agreement.seller, amount);
            if (!success) revert Errors.TokenTransferFailed();
        }

        emit AgreementCompleted(_id, agreement.seller, agreement.buyer);
    }
}
