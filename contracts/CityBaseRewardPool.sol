// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./CityBaseCoin.sol";

contract CityBaseRewardPool is Ownable {
    IERC20 public mainCoin;
    IERC20 public subCoin;
    CityBaseCoin public cityBaseCoin;

    uint256 public mintStartTime;

    mapping(address => uint256) public contributedMain;
    mapping(address => uint256) public contributedSub;
    mapping(address => bool) public hasMinted;

    uint256 public totalMainContributed;
    uint256 public totalSubContributed;

    event Contributed(address indexed user, uint256 mainAmount, uint256 subAmount);
    event RewardClaimed(address indexed user, uint256 rewardAmount);
    event Refunded(address indexed user, uint256 mainAmount, uint256 subAmount);

    constructor(
        address _mainCoin,
        address _subCoin,
        address _cityBaseCoin
    ) {
        mainCoin = IERC20(_mainCoin);
        subCoin = IERC20(_subCoin);
        cityBaseCoin = CityBaseCoin(_cityBaseCoin);
        mintStartTime = block.timestamp;
    }

    function contribute(uint256 mainAmount, uint256 subAmount) external {
        require(mainAmount > 0 || subAmount > 0, "Must contribute something");

        if (mainAmount > 0) {
            require(mainCoin.transferFrom(msg.sender, address(this), mainAmount), "MainCoin transfer failed");
            contributedMain[msg.sender] += mainAmount;
            totalMainContributed += mainAmount;
        }

        if (subAmount > 0) {
            require(subCoin.transferFrom(msg.sender, address(this), subAmount), "SubCoin transfer failed");
            contributedSub[msg.sender] += subAmount;
            totalSubContributed += subAmount;
        }

        emit Contributed(msg.sender, mainAmount, subAmount);
    }

    function getUserContributionScore(address user) public view returns (uint256) {
        return contributedMain[user] * 5 + contributedSub[user];
    }

    function claimReward(address user, uint256 userScore) public onlyOwner {
        require(userScore > 0, "No contribution");
        contributedMain[user] = 0;
        contributedSub[user] = 0;

        cityBaseCoin.mint(user, userScore);

        emit RewardClaimed(user, userScore);
    }

    function refund(address user) public onlyOwner {
        uint256 mainAmount = contributedMain[user];
        uint256 subAmount = contributedSub[user];

        if (mainAmount > 0) {
            contributedMain[user] = 0;
            require(mainCoin.transfer(user, mainAmount), "MainCoin refund failed");
        }

        if (subAmount > 0) {
            contributedSub[user] = 0;
            require(subCoin.transfer(user, subAmount), "SubCoin refund failed");
        }

        emit Refunded(user, mainAmount, subAmount);
    }

    function refundAll(address [] calldata contributors) external onlyOwner {
        for (uint256 i = 0; i < contributors.length; i++) {
            refund(contributors[i]);
        }
    }
}