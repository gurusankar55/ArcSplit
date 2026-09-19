// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ArcSplit is ReentrancyGuard {
    uint256 public constant BASIS_POINTS = 10_000;

    struct Recipient {
        address wallet;
        uint256 share;
    }

    Recipient[] private _recipients;

    event PaymentSplit(
        address indexed payer,
        address indexed token,
        uint256 amount
    );

    error InvalidRecipient();
    error InvalidShare();
    error SharesMustEqual100Percent();
    error InvalidAmount();
    error TransferFailed();

    constructor(
        address[] memory wallets,
        uint256[] memory shares
    ) {
        if (wallets.length == 0 || wallets.length != shares.length) {
            revert InvalidRecipient();
        }

        uint256 totalShares;

        for (uint256 i = 0; i < wallets.length; i++) {
            if (wallets[i] == address(0)) {
                revert InvalidRecipient();
            }

            if (shares[i] == 0) {
                revert InvalidShare();
            }

            _recipients.push(
                Recipient({
                    wallet: wallets[i],
                    share: shares[i]
                })
            );

            totalShares += shares[i];
        }

        if (totalShares != BASIS_POINTS) {
            revert SharesMustEqual100Percent();
        }
    }

    function splitPayment(
        address token,
        uint256 amount
    ) external nonReentrant {
        if (token == address(0)) {
            revert InvalidRecipient();
        }

        if (amount == 0) {
            revert InvalidAmount();
        }

        IERC20 paymentToken = IERC20(token);
        uint256 remaining = amount;

        for (uint256 i = 0; i < _recipients.length; i++) {
            uint256 recipientAmount;

            if (i == _recipients.length - 1) {
                recipientAmount = remaining;
            } else {
                recipientAmount =
                    (amount * _recipients[i].share) /
                    BASIS_POINTS;

                remaining -= recipientAmount;
            }

            bool success = paymentToken.transferFrom(
                msg.sender,
                _recipients[i].wallet,
                recipientAmount
            );

            if (!success) {
                revert TransferFailed();
            }
        }

        emit PaymentSplit(msg.sender, token, amount);
    }

    function getRecipients()
        external
        view
        returns (Recipient[] memory)
    {
        return _recipients;
    }

    function recipientCount()
        external
        view
        returns (uint256)
    {
        return _recipients.length;
    }
}
