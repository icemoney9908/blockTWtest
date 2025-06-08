// app_minting.js
let web3
let account
let mainCoin
let subCoin
let rewardPool

// CDN으로 로드된 라이브러리는 import하지 않고 전역 변수로 사용
// import Web3 from "web3" - 제거
// import axios from "axios" - 제거

import { MainCoinAddress } from "./contaddress/MainCoinAddress.js"
import { MainCoinABI } from "./abi/MainCoin.js"

import { SubCoinAddress } from "./contaddress/SubCoinAddress.js"
import { SubCoinABI } from "./abi/SubCoin.js"

import { CityBaseRewardPoolAddress } from "./contaddress/CityBaseRewardPoolAddress.js"
import { CityBaseRewardPoolABI } from "./abi/CityBaseRewardPool.js"

window.addEventListener("load", async () => {
  if (window.ethereum) {
    // CDN으로 로드된 Web3 사용
    web3 = new window.Web3(window.ethereum)

    mainCoin = new web3.eth.Contract(MainCoinABI, MainCoinAddress)
    subCoin = new web3.eth.Contract(SubCoinABI, SubCoinAddress)
    rewardPool = new web3.eth.Contract(CityBaseRewardPoolABI, CityBaseRewardPoolAddress)

    // 전역 변수로 설정하여 HTML에서 접근 가능하게 함
    window.web3 = web3
    window.account = account
    window.mainCoin = mainCoin
    window.subCoin = subCoin
    window.rewardPool = rewardPool

    document.getElementById("connectBtn").addEventListener("click", connectWallet)
    document.getElementById("approveMainBtn").addEventListener("click", approveMain)
    document.getElementById("approveSubBtn").addEventListener("click", approveSub)

    loadMintList()
  } else {
    alert("MetaMask is not installed")
  }
})

async function updateBalances() {
  if (!account) return

  try {
    const mainBal = await mainCoin.methods.balanceOf(account).call()
    const subBal = await subCoin.methods.balanceOf(account).call()

    // wei 단위 → ETH 단위로 변환
    document.getElementById("mainBalance").textContent = web3.utils.fromWei(mainBal)
    document.getElementById("subBalance").textContent = web3.utils.fromWei(subBal)
  } catch (error) {
    console.error("Failed to fetch balances", error)
  }
}

async function connectWallet() {
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
    account = accounts[0]
    window.account = account // 전역 변수 업데이트
    document.getElementById("account").textContent = `Account: ${account.slice(0, 6)}...${account.slice(-4)}`

    // 연결 후 잔액 조회 실행
    await updateBalances()
  } catch (error) {
    console.error("Wallet connection failed:", error)
    alert("Failed to connect wallet: " + error.message)
  }
}

// approve 함수들을 전역으로 노출
window.handleApproveMain = async (amount) => {
  try {
    if (!amount || !account) return alert("Enter amount and connect wallet")
    await mainCoin.methods.approve(CityBaseRewardPoolAddress, web3.utils.toWei(amount)).send({ from: account })
    alert("MainCoin approved")
  } catch (error) {
    console.error("Approve failed:", error)
    alert("Approve failed: " + error.message)
  }
}

window.handleApproveSub = async (amount) => {
  try {
    if (!amount || !account) return alert("Enter amount and connect wallet")
    await subCoin.methods.approve(CityBaseRewardPoolAddress, web3.utils.toWei(amount)).send({ from: account })
    alert("SubCoin approved")
  } catch (error) {
    console.error("Approve failed:", error)
    alert("Approve failed: " + error.message)
  }
}

// 기존 approveMain, approveSub 함수 수정
async function approveMain() {
  const amount = document.getElementById("approveMainAmount").value
  await window.handleApproveMain(amount)
}

async function approveSub() {
  const amount = document.getElementById("approveSubAmount").value
  await window.handleApproveSub(amount)
}

// contribute 함수를 handleContribute로 변경하고 전역으로 노출
window.handleContribute = async (index, mainAmountValue, subAmountValue, nftNameValue) => {
  try {
    if (!account) return alert("Connect wallet first")

    const mainAmt = mainAmountValue.trim() === "" ? "0" : mainAmountValue.trim()
    const subAmt = subAmountValue.trim() === "" ? "0" : subAmountValue.trim()

    // 1. 스마트 컨트랙트에 기여 전송
    await rewardPool.methods.contribute(web3.utils.toWei(mainAmt), web3.utils.toWei(subAmt)).send({ from: account })

    // 2. 서버에 기여 정보 전송 (CDN axios 사용)
    await window.axios.post("http://localhost:3000/save-contributeinfo", {
      nftName: nftNameValue,
      contributor: account,
    })

    alert("기여 및 정보 저장 완료")

    // 잔액 업데이트
    await updateBalances()
  } catch (error) {
    console.error("Contribution error:", error)
    throw error // HTML에서 에러 처리할 수 있도록 다시 throw
  }
}

async function loadMintList() {
  try {
    // CDN axios 사용
    const res = await window.axios.get("http://localhost:3000/mintinfo-list")
    const list = res.data

    // 기존 HTML 구조와 통합
    const mintingGrid = document.getElementById("mintingList")
    if (!mintingGrid) return

    // Clear existing content
    mintingGrid.innerHTML = ""

    for (let i = 0; i < list.length; i++) {
      const file = list[i]
      const { data } = await window.axios.get(`http://localhost:3000/mintinfo/${file}`)

      // HTML의 createMintingCard 함수 사용
      if (window.createMintingCard) {
        const cardHTML = window.createMintingCard(data, i)
        mintingGrid.innerHTML += cardHTML
      }

      // Start countdown for this card
      if (window.startCountdown) {
        window.startCountdown(data.mintStartTime, `countdown-${i}`)
      }
    }
  } catch (err) {
    console.error("Failed to load mint info:", err)
    // 서버 연결 실패 시 샘플 데이터 표시
    if (window.showSampleData) {
      window.showSampleData()
    }
  }
}

function startCountdown(startTimestamp, elementId) {
  const interval = setInterval(() => {
    const now = Date.now() / 1000
    const end = startTimestamp / 1000 + 60
    const remaining = Math.max(0, end - now)

    const el = document.getElementById(elementId)
    if (!el) {
      clearInterval(interval)
      return
    }

    if (remaining > 0) {
      el.textContent = `남은 시간: ${Math.floor(remaining)}초`
    } else {
      el.textContent = `민팅 조건 검사 중...`
      clearInterval(interval)
    }
  }, 1000)
}

// 전역 함수로 노출
window.startCountdown = startCountdown
window.updateBalances = updateBalances
window.loadMintList = loadMintList