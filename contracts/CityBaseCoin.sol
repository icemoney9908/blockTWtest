// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CityBaseCoin is ERC20, Ownable {
    address public minter;  // mint 권한을 가진 주소 (예: CityBaseRewardPool)

    constructor() ERC20("CityBaseCoin", "CBC") {}

    modifier onlyMinter() {
        require(msg.sender == minter, "Not authorized minter");
        _;
    }

    function setMinter(address _minter) external onlyOwner {
        minter = _minter;
    }

    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }
}