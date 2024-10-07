// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Vyoman is ERC20 {
    constructor(uint256 initialSupply) ERC20("Vyoman", "V") {
        _mint(msg.sender, initialSupply);
    }
}
