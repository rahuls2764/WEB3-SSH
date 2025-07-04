// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SkillBridgeToken is ERC20, Ownable {
    constructor(address initialOwner) ERC20("SkillBridge Token", "SBT") Ownable(initialOwner) {
        _mint(initialOwner, 1_000_000 * 1e18); // Initial supply
    }
    // Admin function to mint tokens (e.g. for test rewards)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Optional: burn tokens if needed
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
