// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


// Author: @Richiey1
contract CertificateIssuer {
    address public admin;

    struct Certificate {
        string recipientName;
        string courseTitle;
        uint issueDate;
        bool isValid;
    }

    mapping(address => Certificate) public certificates;

    event CertificateIssued(address indexed recipient, string courseTitle, uint issueDate);
    event CertificateRevoked(address indexed recipient);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier certificateExists(address recipient) {
        require(bytes(certificates[recipient].recipientName).length > 0, "Certificate does not exist");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function issueCertificate(address recipient, string memory _recipientName, string memory _courseTitle) public onlyAdmin {
        require(bytes(_recipientName).length > 0, "Recipient name cannot be empty");
        require(bytes(_courseTitle).length > 0, "Course title cannot be empty");
        require(certificates[recipient].issueDate == 0, "Certificate already issued");

        certificates[recipient] = Certificate(_recipientName, _courseTitle, block.timestamp, true);
        emit CertificateIssued(recipient, _courseTitle, block.timestamp);
    }

    function verifyCertificate(address recipient) public view returns (string memory, string memory, uint, bool) {
        require(certificates[recipient].issueDate != 0, "Certificate does not exist");
        Certificate memory cert = certificates[recipient];
        return (cert.recipientName, cert.courseTitle, cert.issueDate, cert.isValid);
    }

    function revokeCertificate(address recipient) public onlyAdmin certificateExists(recipient) {
        certificates[recipient].isValid = false;
        emit CertificateRevoked(recipient);
    }
}
