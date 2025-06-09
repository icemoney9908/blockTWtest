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

    // 2차원 매핑: 유저 주소 + NFT 이름 해시(bytes32)
    mapping(address => mapping(bytes32 => uint256)) public contributedMain;
    mapping(address => mapping(bytes32 => uint256)) public contributedSub;
    mapping(address => mapping(bytes32 => bool)) public hasMinted;

    mapping(bytes32 => uint256) public totalMainContributed;
    mapping(bytes32 => uint256) public totalSubContributed;

    event Contributed(address indexed user, string nftName, uint256 mainAmount, uint256 subAmount);
    event RewardClaimed(address indexed user, string nftName, uint256 rewardAmount);
    event Refunded(address indexed user, string nftName, uint256 mainAmount, uint256 subAmount);

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

    function contribute(string memory nftName, uint256 mainAmount, uint256 subAmount) external {
        require(mainAmount > 0 || subAmount > 0, "Must contribute something");

        bytes32 nameHash = keccak256(abi.encodePacked(nftName));

        if (mainAmount > 0) {
            require(mainCoin.transferFrom(msg.sender, address(this), mainAmount), "MainCoin transfer failed");
            contributedMain[msg.sender][nameHash] += mainAmount;
            totalMainContributed[nameHash] += mainAmount;
        }

        if (subAmount > 0) {
            require(subCoin.transferFrom(msg.sender, address(this), subAmount), "SubCoin transfer failed");
            contributedSub[msg.sender][nameHash] += subAmount;
            totalSubContributed[nameHash] += subAmount;
        }

        emit Contributed(msg.sender, nftName, mainAmount, subAmount);
    }

    function getUserContributionScore(address user, string memory nftName) public view returns (uint256) {
        bytes32 nameHash = keccak256(abi.encodePacked(nftName));
        return contributedMain[user][nameHash] * 5 + contributedSub[user][nameHash];
    }

    function claimReward(address user, string memory nftName) public onlyOwner {
        uint256 userScore = getUserContributionScore(user, nftName);
        bytes32 nameHash = keccak256(abi.encodePacked(nftName));
        require(userScore > 0, "No contribution");

        contributedMain[user][nameHash] = 0;
        contributedSub[user][nameHash] = 0;
        hasMinted[user][nameHash] = true;

        cityBaseCoin.mint(user, userScore);

        emit RewardClaimed(user, nftName, userScore);
    }

    function refund(address user, string memory nftName) public onlyOwner {
        bytes32 nameHash = keccak256(abi.encodePacked(nftName));

        uint256 mainAmount = contributedMain[user][nameHash];
        uint256 subAmount = contributedSub[user][nameHash];

        if (mainAmount > 0) {
            contributedMain[user][nameHash] = 0;
            require(mainCoin.transfer(user, mainAmount), "MainCoin refund failed");
        }

        if (subAmount > 0) {
            contributedSub[user][nameHash] = 0;
            require(subCoin.transfer(user, subAmount), "SubCoin refund failed");
        }

        emit Refunded(user, nftName, mainAmount, subAmount);
    }

    function refundAll(address[] calldata contributors, string memory nftName) external onlyOwner {
        for (uint256 i = 0; i < contributors.length; i++) {
            refund(contributors[i], nftName);
        }
    }
}