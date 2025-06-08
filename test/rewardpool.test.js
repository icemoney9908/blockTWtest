const CBC = artifacts.require("CityBaseCoin");
const MainCoin = artifacts.require("MainCoin");
const SubCoin = artifacts.require("SubCoin");
const CBCRewardPool = artifacts.require("CBCRewardPool");

const { expect } = require("chai");

contract("CBCRewardPool", (accounts) => {
  const owner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];

  let cbc, mainCoin, subCoin, rewardPool;

  beforeEach(async () => {
    cbc = await CBC.new();
    mainCoin = await MainCoin.new("Main", "MC", web3.utils.toWei("1000000"), { from: owner });
    subCoin = await SubCoin.new("Sub", "SC", web3.utils.toWei("1000000"), { from: owner });
    
    rewardPool = await CBCRewardPool.new(mainCoin.address, subCoin.address, cbc.address, { from: owner });

    // CBC 권한 넘기기
    await cbc.transferOwnership(rewardPool.address);

    // 유저에게 Main/Sub 전송
    await mainCoin.transfer(user1, web3.utils.toWei("1000"), { from: owner });
    await subCoin.transfer(user2, web3.utils.toWei("1000"), { from: owner });

    // 승인
    await mainCoin.approve(rewardPool.address, web3.utils.toWei("1000"), { from: user1 });
    await subCoin.approve(rewardPool.address, web3.utils.toWei("1000"), { from: user2 });

    // 태그 풀 생성
    await rewardPool.createTagPool("nature", 300, { from: owner }); // 5분짜리 기여 기간
  });

  it("유저가 MainCoin으로 기여하면 비율 반영된다", async () => {
    await rewardPool.contribute("nature", web3.utils.toWei("100"), true, { from: user1 });
    const [main, sub, contributed] = await rewardPool.getUserContribution("nature", user1);
    expect(web3.utils.fromWei(main)).to.equal("100");
    expect(sub.toString()).to.equal("0");
    expect(contributed).to.equal(true);
  });

  it("유저가 SubCoin으로 기여하면 비율 반영된다", async () => {
    await rewardPool.contribute("nature", web3.utils.toWei("50"), false, { from: user2 });
    const [main, sub, contributed] = await rewardPool.getUserContribution("nature", user2);
    expect(web3.utils.fromWei(sub)).to.equal("50");
    expect(main.toString()).to.equal("0");
    expect(contributed).to.equal(true);
  });

  it("기여 후 민팅 보상이 비율대로 잘 분배된다", async () => {
    // user1: 100 Main (weight: 500), user2: 100 Sub (weight: 100)
    await rewardPool.contribute("nature", web3.utils.toWei("100"), true, { from: user1 });
    await rewardPool.contribute("nature", web3.utils.toWei("100"), false, { from: user2 });

    // 시간 경과 처리 (Ganache에선 필요할 수 있음)
    await new Promise(resolve => setTimeout(resolve, 1000));

    await rewardPool.finalizeAndDistribute("nature", web3.utils.toWei("1"), web3.utils.toWei("600"), { from: owner });

    const balance1 = await cbc.balanceOf(user1);
    const balance2 = await cbc.balanceOf(user2);

    expect(Math.floor(web3.utils.fromWei(balance1))).to.equal(500);
    expect(Math.floor(web3.utils.fromWei(balance2))).to.equal(100);
  });

  it("기여 없이 finalize하면 revert된다", async () => {
    await expect(
      rewardPool.finalizeAndDistribute("nature", web3.utils.toWei("100"), web3.utils.toWei("500"), { from: owner })
    ).to.be.rejectedWith("Minimum threshold not met");
  });

  it("동일 유저가 두 번 참여하려 하면 막힌다", async () => {
    await rewardPool.contribute("nature", web3.utils.toWei("100"), true, { from: user1 });
    await expect(
      rewardPool.contribute("nature", web3.utils.toWei("50"), true, { from: user1 })
    ).to.be.rejectedWith("Already participated");
  });
});