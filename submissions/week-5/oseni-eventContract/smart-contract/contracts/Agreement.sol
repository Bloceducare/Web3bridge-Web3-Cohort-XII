// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AgreementSigningEscrow {
    struct Agreement {
        string title;
        string description;
        address payable initiator;
        address payable recipient;
        uint256 amount;
        bool signedByInitiator;
        bool signedByRecipient;
        bool executed;
    }

    mapping(uint256 => Agreement) public agreements;
    uint256 public agreementCount;

    event AgreementCreated(uint256 agreementId, string title, address initiator, address recipient, uint256 amount);
    event AgreementSigned(uint256 agreementId, address signer);
    event AgreementExecuted(uint256 agreementId);

    modifier onlyParties(uint256 agreementId) {
        require(
            msg.sender == agreements[agreementId].initiator || msg.sender == agreements[agreementId].recipient,
            "Not a party to this agreement"
        );
        _;
    }

    function createAgreement(
        string memory _title,
        string memory _description,
        address payable _recipient
    ) public payable {
        require(msg.value > 0, "Must send funds to lock in escrow");

        agreements[agreementCount] = Agreement({
            title: _title,
            description: _description,
            initiator: payable(msg.sender),
            recipient: _recipient,
            amount: msg.value,
            signedByInitiator: false,
            signedByRecipient: false,
            executed: false
        });

        emit AgreementCreated(agreementCount, _title, msg.sender, _recipient, msg.value);
        agreementCount++;
    }

    function signAgreement(uint256 agreementId) public onlyParties(agreementId) {
        Agreement storage agreement = agreements[agreementId];

        require(!agreement.executed, "Agreement already executed");

        if (msg.sender == agreement.initiator) {
            agreement.signedByInitiator = true;
        } else if (msg.sender == agreement.recipient) {
            agreement.signedByRecipient = true;
        }

        emit AgreementSigned(agreementId, msg.sender);
    }

    function executeAgreement(uint256 agreementId) public {
        Agreement storage agreement = agreements[agreementId];

        require(agreement.signedByInitiator && agreement.signedByRecipient, "All parties must sign");
        require(!agreement.executed, "Agreement already executed");

        agreement.executed = true;
        agreement.recipient.transfer(agreement.amount);

        emit AgreementExecuted(agreementId);
    }

    function getAgreement(uint256 agreementId)
        public
        view
        returns (string memory, string memory, address, address, uint256, bool, bool, bool)
    {
        Agreement memory agreement = agreements[agreementId];
        return (
            agreement.title,
            agreement.description,
            agreement.initiator,
            agreement.recipient,
            agreement.amount,
            agreement.signedByInitiator,
            agreement.signedByRecipient,
            agreement.executed
        );
    }
}
