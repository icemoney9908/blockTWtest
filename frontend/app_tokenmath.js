// app.js

// web3, MetaMask 연결 변수
let web3;
let accounts;
let mainCoinContract;
let subCoinContract;
let CBCoinContract;
let tokenSwapContract;
let stakingContract;

// 배포된 컨트랙트 ABI와 주소 (예시, 실제 배포 주소로 교체하세요)
import { MainCoinABI } from './abi/MainCoin.js';
import { MainCoinAddress } from './contaddress/MainCoinAddress.js';

import { SubCoinABI } from './abi/SubCoin.js';
import { SubCoinAddress } from './contaddress/SubCoinAddress.js';

import { CityBaseCoinABI } from './abi/CityBaseCoin.js';
import { CityBaseCoinAddress } from './contaddress/CityBaseCoinAddress.js'

import { TokenSwapABI } from './abi/TokenSwap.js';
import { TokenSwapAddress } from './contaddress/TokenSwapAddress.js';

import { StakingABI } from './abi/Staking.js';
import { StakingAddress } from './contaddress/StakingAddress.js';

// MetaMask 연결 함수
async function connectMetaMask() {
  if(window.ethereum) {
    try {
      accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      web3 = new Web3(window.ethereum);
      document.getElementById("status").innerText = `Connected: ${accounts[0]}`;

      // 컨트랙트 인스턴스 초기화
      mainCoinContract = new web3.eth.Contract(MainCoinABI, MainCoinAddress);
      subCoinContract = new web3.eth.Contract(SubCoinABI, SubCoinAddress);
      CBCoinContract = new web3.eth.Contract(CityBaseCoinABI, CityBaseCoinAddress);
      tokenSwapContract = new web3.eth.Contract(TokenSwapABI, TokenSwapAddress);
      stakingContract = new web3.eth.Contract(StakingABI, StakingAddress);

    } catch (error) {
      console.error("User denied account access");
    }
  } else {
    alert("Please install MetaMask!");
  }
  await updateBalances();
  await checkStakedBalance();
}

// 잔액 조회 함수
async function updateBalances() {
  if (!web3 || !accounts) {
    console.warn("Connect to MetaMask first!");
    return;
  }

  try {
    const mainBalance = await mainCoinContract.methods.balanceOf(accounts[0]).call();
    const subBalance = await subCoinContract.methods.balanceOf(accounts[0]).call();
    const cbBalance = await CBCoinContract.methods.balanceOf(accounts[0]).call();

    const mainBalanceFormatted = web3.utils.fromWei(mainBalance, 'ether');
    const subBalanceFormatted = web3.utils.fromWei(subBalance, 'ether');
    const cbBalanceFormatted = web3.utils.fromWei(cbBalance, 'ether');

    document.getElementById("mainCoinBalance").innerText = mainBalanceFormatted;
    document.getElementById("subCoinBalance").innerText = subBalanceFormatted;
    document.getElementById("cbCoinBalance").innerText = cbBalanceFormatted;
  } catch (error) {
    console.error("Failed to fetch balances:", error);
    alert("Failed to fetch balances.");
  }
}

// 토큰 전송 함수
async function sendToken(tokenName, to, amount) {
  if (!web3 || !accounts) {
    alert("Connect to MetaMask first!");
    return;
  }

  let tokenContract;
  if (tokenName === "MainCoin") {
    tokenContract = mainCoinContract;
  } else if (tokenName === "SubCoin") {
    tokenContract = subCoinContract;
  } else if (tokenName === "CityBaseCoin") {
    tokenContract = CBCoinContract;
  } else {
    alert("Invalid token selection.");
    return;
  }

  try {
    const value = web3.utils.toWei(amount.toString(), 'ether');
    await tokenContract.methods.transfer(to, value).send({ from: accounts[0] });
    updateBalances();
    alert(`${tokenName} transfer successful!`);
  } catch (error) {
    console.error(error);
    alert(`${tokenName} transfer failed: ${error.message}`);
  }
}

async function handleSwap(direction, amountInput) {
  if (!web3 || !accounts) {
    alert("Connect to MetaMask first!");
    return;
  }

  if (!amountInput || isNaN(amountInput)) {
    alert("Please enter a valid amount.");
    return;
  }

  const amountWei = web3.utils.toWei(amountInput.toString(), 'ether');

  try {
    if (direction === "MainToSub") {
      // MainCoin → SubCoin
      await mainCoinContract.methods.approve(TokenSwapAddress, amountWei).send({ from: accounts[0] });
      await tokenSwapContract.methods.swapMainToSub(amountWei).send({ from: accounts[0] });
      alert("Swap from MainCoin to SubCoin successful!");
    } else if (direction === "CBToSub") {
      // CBCoin → SubCoin
      await CBCoinContract.methods.approve(TokenSwapAddress, amountWei).send({ from: accounts[0] });
      await tokenSwapContract.methods.swapCBToSub(amountWei).send({ from: accounts[0] });
      alert("Swap from SubCoin to MainCoin successful!");
    } else {
      alert("Invalid swap direction selected.");
    }
    updateBalances();
  } catch (error) {
    console.error(error);
    alert("Swap failed: " + error.message);
  }
}

// 스테이킹
async function stakeTokens(tokenName, amount) {
  if (!web3 || !accounts) {
    alert("Connect to MetaMask first!");
    return;
  }

  const amountWei = web3.utils.toWei(amount.toString(), 'ether');
  let tokenAddress, tokenContract;

  if (tokenName === "MainCoin") {
    tokenAddress = MainCoinAddress;
    tokenContract = mainCoinContract;
  } else if (tokenName === "SubCoin") {
    tokenAddress = SubCoinAddress;
    tokenContract = subCoinContract;
  } else if (tokenName === "CityBaseCoin") {
    tokenAddress = CityBaseCoinAddress;
    tokenContract = CBCoinContract;
  } else {
    alert("Invalid token selection");
    return;
  }

  try {
    // approve 먼저
    await tokenContract.methods.approve(StakingAddress, amountWei).send({ from: accounts[0] });

    // stake 실행
    await stakingContract.methods.stake(tokenAddress, amountWei).send({ from: accounts[0] });

    checkStakedBalance(tokenName)
    updateBalances();
    alert("Staking successful!");
  } catch (error) {
    console.error(error);
    alert("Staking failed: " + error.message);
  }
}

// 스테이킹 잔액 조회
async function checkStakedBalance() {
  if (!web3 || !accounts) {
    alert("Connect to MetaMask first!");
    return;
  }

  let tokenAddress;
  const tokenName = "SubCoin";

  if (tokenName === "MainCoin") {
    tokenAddress = MainCoinAddress;
  } else if (tokenName === "SubCoin") {
    tokenAddress = SubCoinAddress;
  } else if (tokenName === "CityBaseCoin") {
    tokenAddress = CityBaseCoinAddress;
  } else {
    alert("Invalid token selection");
    return;
  }

  try {
    const balanceWei = await stakingContract.methods.getStakedBalance(tokenAddress, accounts[0]).call();
    const balance = web3.utils.fromWei(balanceWei, 'ether');
    document.getElementById("stakedDisplay").innerText = `${tokenName} Staked Balance: ${balance}`;
  } catch (error) {
    console.error(error);
    alert("Failed to fetch staked balance: " + error.message);
  }
}

// 인출
async function withdrawTokens(tokenName, amount) {
  if (!web3 || !accounts) {
    alert("Connect to MetaMask first!");
    return;
  }

  const amountWei = web3.utils.toWei(amount.toString(), 'ether');
  let tokenAddress;

  if (tokenName === "MainCoin") {
    tokenAddress = MainCoinAddress;
  } else if (tokenName === "SubCoin") {
    tokenAddress = SubCoinAddress;
  } else if (tokenName === "CityBaseCoin") {
    tokenAddress = CityBaseCoinAddress;
  } else {
    alert("Invalid token selection");
    return;
  }

  try {
    await stakingContract.methods.withdraw(tokenAddress, amountWei).send({ from: accounts[0] });
    checkStakedBalance(tokenName)
    updateBalances();
    alert(`${tokenName} withdraw successful!`);
  } catch (error) {
    console.error(error);
    alert("Withdraw failed: " + error.message);
  }
}

// 보상 예상 조회
async function estimateRewardcode(tokenName) {
  if (!web3 || !accounts) {
    alert("Connect to MetaMask first!");
    return;
  }

  let tokenAddress;

  if (tokenName === "MainCoin") {
    tokenAddress = MainCoinAddress;
  } else if (tokenName === "SubCoin") {
    tokenAddress = SubCoinAddress;
  } else if (tokenName === "CityBaseCoin") {
    tokenAddress = CityBaseCoinAddress;
  } else {
    alert("Invalid token selection");
    return;
  }

  try {
    const balanceWei = await stakingContract.methods.getStakedBalance(tokenAddress, accounts[0]).call();
    const balance = web3.utils.fromWei(balanceWei, 'ether');

    if(balance != 0) {
      // 마지막 스테이킹 timestamp 가져오기
      const lastStakeTime = await stakingContract.methods.stakingTimestamps(tokenAddress, accounts[0]).call();

      const currentTime = Math.floor((Date.now()) / 1000); // 밀리초 → 초
      const timeStaked = currentTime - lastStakeTime;

      const rewardRate = await stakingContract.methods.rewardRatePerSecond(tokenAddress).call();

      const rewardBN = web3.utils.toBN(timeStaked).mul(web3.utils.toBN(rewardRate));
      const estimatedReward = web3.utils.fromWei(rewardBN, 'ether');
      document.getElementById("rewardDisplay").innerText = `${tokenName} Estimated Reward: ${estimatedReward}`;
    } else {
      const estimatedReward = 0;
      document.getElementById("rewardDisplay").innerText = `${tokenName} Estimated Reward: ${estimatedReward}`;
    }
  } catch (error) {
    console.error(error);
    alert("Failed to estimate reward: " + error.message);
  }
}

// exit
async function exitStake(tokenName) {
  if (!web3 || !accounts) {
    alert("Connect to MetaMask first!");
    return;
  }

  let tokenAddress;

  if (tokenName === "MainCoin") {
    tokenAddress = MainCoinAddress;
  } else if (tokenName === "SubCoin") {
    tokenAddress = SubCoinAddress;
  } else if (tokenName === "CityBaseCoin") {
    tokenAddress = CityBaseCoinAddress;
  } else {
    alert("Invalid token selection");
    return;
  }

  try {
    await stakingContract.methods.exit(tokenAddress).send({ from: accounts[0] });
    checkStakedBalance(tokenName)
    updateBalances();
    alert(`${tokenName} exit successful! All funds and rewards withdrawn.`);
  } catch (error) {
    console.error(error);
    alert("Exit failed: " + error.message);
  }
}

// 이벤트 리스너 등 필요시 추가...

// HTML 버튼과 연결
// 메타마스크 연결결
document.getElementById("connectBtn").addEventListener("click", connectMetaMask);

// 잔액 확인
document.getElementById("refreshBalancesBtn").addEventListener("click", updateBalances);

// 코인 전송
document.getElementById("sendBtn").addEventListener("click", () => {
  const tokenName = document.getElementById("tokenchoice").value;
  const to = document.getElementById("recipient").value;
  const amount = document.getElementById("sendAmount").value;
  sendToken(tokenName, to, amount);
});

// 스왑
document.getElementById("swapButton").addEventListener("click", () => {
  const direction = document.getElementById("swapDirection").value;
  const amountInput = document.getElementById("swapAmount").value;
  handleSwap(direction, amountInput);
});

// 스테이킹
document.getElementById("stakeButton").addEventListener("click", () => {
  const tokenName = document.getElementById("tokenSelect").value;
  const amount = document.getElementById("stakeAmount").value;
  stakeTokens(tokenName, amount);
});
document.getElementById("withdrawButton").addEventListener("click", () => {
  const tokenName = document.getElementById("tokenSelect").value;
  const amount = document.getElementById("withdrawAmount").value;
  withdrawTokens(tokenName, amount);
});
document.getElementById("estimateRewardButton").addEventListener("click", () => {
  const tokenName = document.getElementById("tokenSelect").value;
  estimateRewardcode(tokenName);
});
document.getElementById("exitButton").addEventListener("click", () => {
  const tokenName = document.getElementById("tokenSelect").value;
  exitStake(tokenName);
});