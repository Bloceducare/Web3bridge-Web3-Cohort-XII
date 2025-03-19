Contract creator:0x35b8B9552F643a9a2647180FdAca49B67bA679BF
# Certificate Issuance Smart Contract
This smart contract allows organizations (like universities, training institutes, or companies) to issue and verify certificates on the blockchain. The contract ensures that only authorized administrators can issue and revoke certificates while anyone can verify issued certificates.

This solution prevents fraud and makes credentials verifiable in a decentralized way.

Features
✔ Admin Control: Only the contract owner (admin) can issue and revoke certificates.
✔ Certificate Storage: Stores certificate details including recipient name, course title, and issue date.
✔ Verification System: Anyone can verify a certificate using the recipient’s address.
✔ Revocation System: The admin can revoke a certificate if necessary.
✔ Security: Prevents duplicate issuance and unauthorized revocations.

Feature	Implementation
Admin Control	Only the contract deployer can issue/revoke certificates
Data Storage	Uses struct Certificate and mapping(address => Certificate)
Verification	Function verifyCertificate(address recipient) retrieves certificate details
Revocation	Function revokeCertificate(address recipient) marks a certificate as invalid
Access Control	Uses onlyAdmin modifier to restrict certain actions

## Deployment
- Contract deployed on Sepolia using Hardhat.
- Verified using Hardhat Etherscan plugin.

## Usage
- Call `issueCertificate(0x35b8B9552F643a9a2647180FdAca49B67bA679BF, string, string)` to issue a certificate.
- Call `verifyCertificate(0x35b8B9552F643a9a2647180FdAca49B67bA679BF)` to check certificate details.
- Call `revokeCertificate(0x35b8B9552F643a9a2647180FdAca49B67bA679BF)` to mark a certificate as invalid.
