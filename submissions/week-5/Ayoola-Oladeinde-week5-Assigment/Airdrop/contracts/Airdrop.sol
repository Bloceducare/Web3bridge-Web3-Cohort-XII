// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Airdrop is Ownable {
    IERC20 public token;

    // Custom errors
    error NotWhitelisted(address account);
    error InvalidRecipient();
    error InvalidAmount();
    error TransferFailed();

    mapping(address => bool) public whitelisted;

    event AirdropSent(address indexed recipient, uint256 amount);
    event Whitelisted(address indexed account, bool status);

    constructor(address _token) Ownable(msg.sender) {
        token = IERC20(_token);
    }

    /**
     * @dev Whitelist an address for airdrop eligibility
     */
    function setWhitelist(address _account, bool _status) external onlyOwner {
        require(_account != address(0), "Invalid address");
        whitelisted[_account] = _status;
        emit Whitelisted(_account, _status);
    }

    /**
     * @dev Airdrop tokens to a single whitelisted recipient
     */
    function airdrop(address _recipient, uint256 _amount) external onlyOwner {
        if (!whitelisted[_recipient]) revert NotWhitelisted(_recipient);
        if (_recipient == address(0)) revert InvalidRecipient();
        if (_amount == 0) revert InvalidAmount();

        bool success = token.transfer(_recipient, _amount);
        if (!success) revert TransferFailed();

        emit AirdropSent(_recipient, _amount);
    }

    /**
     * @dev Batch airdrop tokens to multiple whitelisted recipients
     */
    function batchAirdrop(
        address[] calldata _recipients,
        uint256[] calldata _amounts
    ) external onlyOwner {
        if (_recipients.length != _amounts.length) revert("Mismatched arrays");

        for (uint256 i = 0; i < _recipients.length; i++) {
            address recipient = _recipients[i];
            uint256 amount = _amounts[i];

            if (!whitelisted[recipient]) revert NotWhitelisted(recipient);
            if (recipient == address(0)) revert InvalidRecipient();
            if (amount == 0) revert InvalidAmount();

            bool success = token.transfer(recipient, amount);
            if (!success) revert TransferFailed();

            emit AirdropSent(recipient, amount);
        }
    }
}
