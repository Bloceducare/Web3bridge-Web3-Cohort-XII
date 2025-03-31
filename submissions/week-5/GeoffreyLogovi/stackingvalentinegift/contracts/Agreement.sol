// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Agreement {
    address public partyA;
    address public partyB;
    uint256 public amount;
    bool public agreementSigned;
    bool public fundsReleased;

    event AgreementSigned(address indexed signer);
    event FundsReleased(address indexed receiver, uint256 amount);

    constructor(address _partyB, uint256 _amount) payable {
        require(msg.value == _amount, "Incorrect amount sent");
        partyA = msg.sender;
        partyB = _partyB;
        amount = _amount;
    }

    function signAgreement() public {
        require(
            msg.sender == partyA || msg.sender == partyB,
            "Not a party to the agreement"
        );
        agreementSigned = true;
        emit AgreementSigned(msg.sender);
    }

    function releaseFunds() public {
        require(agreementSigned, "Agreement not signed yet");
        require(!fundsReleased, "Funds already released");
        require(msg.sender == partyA, "Only partyA can release funds");

        fundsReleased = true;
        payable(partyB).transfer(amount);
        emit FundsReleased(partyB, amount);
    }

    function cancelAgreement() public {
        require(msg.sender == partyA, "Only partyA can cancel the agreement");
        require(!fundsReleased, "Funds already released");

        uint256 contractBalance = address(this).balance;

        if (contractBalance > 0) {
            (bool success, ) = payable(partyA).call{value: contractBalance}("");
            require(success, "Refund failed");
        }

        // Disable contract functions by resetting critical variables
        agreementSigned = false;
        amount = 0;
        partyB = address(0);

        // Emit event for better debugging
        emit AgreementSigned(address(0));
    }
}
