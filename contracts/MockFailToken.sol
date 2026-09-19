// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockFailToken is ERC20 {
    address public blockedRecipient;

    constructor() ERC20("Mock Fail Token", "mFAIL") {
        _mint(msg.sender, 1_000_000 * 10 ** 18);
    }

    function setBlockedRecipient(address recipient) external {
        blockedRecipient = recipient;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        if (to == blockedRecipient) {
            return false;
        }

        return super.transferFrom(from, to, amount);
    }
}