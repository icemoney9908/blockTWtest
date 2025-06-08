// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Staking {
    // 토큰별로 IERC20 인터페이스 저장
    mapping(address => IERC20) public tokens;

    // 토큰별, 사용자별 잔액과 스테이킹 시작시간
    mapping(address => mapping(address => uint256)) public balances;
    mapping(address => mapping(address => uint256)) public stakingTimestamps;

    // 토큰별 보상률 (초당 보상)
    mapping(address => uint256) public rewardRatePerSecond;

    constructor(address _subCoin) {
        tokens[_subCoin] = IERC20(_subCoin);

        // 토큰별 보상률 설정 (원하는 값으로 조절)

        rewardRatePerSecond[_subCoin] = 1e17;   // 예: 0.1 SubCoin 초당 보상
    }

    // 스테이킹 함수: 토큰 주소와 금액 입력
    function stake(address token, uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(tokens[token] != IERC20(address(0)), "Unsupported token");

        // 기존 보상 정산
        if (balances[token][msg.sender] > 0) {
            uint256 reward = calculateReward(token, msg.sender);
            balances[token][msg.sender] += reward;
        }

        // 토큰 전송
        tokens[token].transferFrom(msg.sender, address(this), amount);

        // 잔액, 타임스탬프 업데이트
        balances[token][msg.sender] += amount;
        stakingTimestamps[token][msg.sender] = block.timestamp;
    }

    // 스테이킹 잔액조회
    function getStakedBalance(address token, address user) public view returns (uint256) {
    return balances[token][user];
    }

    // 보상 계산(block time 기준)
    function calculateReward(address token, address user) public view returns (uint256) {
        uint256 timeStaked = block.timestamp - stakingTimestamps[token][user];
        return timeStaked * rewardRatePerSecond[token];
    }

    // 인출 함수
    function withdraw(address token, uint256 amount) external {
        uint256 reward = calculateReward(token, msg.sender);

        require(amount > 0, "Amount must be > 0");
        require(balances[token][msg.sender] + reward >= amount, "Insufficient staked balance");

        balances[token][msg.sender] = balances[token][msg.sender] + reward - amount;
        stakingTimestamps[token][msg.sender] = block.timestamp;

        tokens[token].transfer(msg.sender, amount);
    }

    // 전체 보상 + 원금 인출
    function exit(address token) external {
        uint256 staked = balances[token][msg.sender];
        require(staked > 0, "Nothing to withdraw");

        uint256 reward = calculateReward(token, msg.sender);
        balances[token][msg.sender] = 0;
        stakingTimestamps[token][msg.sender] = 0;

        tokens[token].transfer(msg.sender, staked + reward);
    }
}
