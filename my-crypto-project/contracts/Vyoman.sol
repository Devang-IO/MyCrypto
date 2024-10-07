// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; // Import Ownable for access control

contract Vyoman is ERC20, Ownable {
    constructor(
        uint256 initialSupply
    ) ERC20("Vyoman", "V") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply); // Mint initial supply to the deployer
    }

    // Minting function
    function mint(uint256 amount) external onlyOwner {
        _mint(msg.sender, amount); // Mint additional tokens to the owner
    }
}
