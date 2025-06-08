// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SubCoin is ERC20, Ownable {
    uint256 public tokenCounter;

    constructor() ERC20("SubCoin", "SC") {
        tokenCounter = 0;
    }

    function mint(address user, uint256 amount) public onlyOwner {
        _mint(user, amount);
        tokenCounter += amount;
    }
}