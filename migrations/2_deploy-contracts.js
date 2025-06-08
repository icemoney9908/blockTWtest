const fs = require('fs');
const path = require('path');

const CityBaseCoin = artifacts.require("CityBaseCoin");
const CityBaseNFT = artifacts.require("CityBaseNFT");
const MainCoin = artifacts.require("MainCoin");
const SubCoin = artifacts.require("SubCoin");
const RewardPool = artifacts.require("CityBaseRewardPool");

// 주소 저장 함수
function saveAddressFile(contractName, address) {
  // 프론트엔드용 (ES Module export)
  const frontendDir = path.join(__dirname, '..', 'frontend', 'contaddress');
  if (!fs.existsSync(frontendDir)) fs.mkdirSync(frontendDir, { recursive: true });

  const frontendFilepath = path.join(frontendDir, `${contractName}Address.js`);
  const frontendContent = `export const ${contractName}Address = "${address}";\n`;

  fs.writeFileSync(frontendFilepath, frontendContent);
  console.log(`Saved frontend address for ${contractName} to ${frontendFilepath}`);

  // 백엔드용 (ES Module export)
  const backendDir = path.join(__dirname, '..', 'backend', 'backaddress');
  if (!fs.existsSync(backendDir)) fs.mkdirSync(backendDir, { recursive: true });

  const backendFilepath = path.join(backendDir, `${contractName}Address.js`);
  const backendContent = `export const ${contractName}Address = "${address}";\n`;

  fs.writeFileSync(backendFilepath, backendContent);
  console.log(`Saved backend address for ${contractName} to ${backendFilepath}`);

  // 루트용
  const rootDir = path.join(__dirname, '..', 'rootaddress');
  if (!fs.existsSync(rootDir)) fs.mkdirSync(rootDir, { recursive: true });

  const rootFilepath = path.join(rootDir, `${contractName}Address.js`);
  const rootContent = `module.exports = "${address}";\n`;

  fs.writeFileSync(rootFilepath, rootContent);
  console.log(`Saved frontend address for ${contractName} to ${rootFilepath}`);
}

// ABI 저장 함수
function saveAbiFile(contractName, abi) {
  const frontendDir = path.join(__dirname, '..', 'frontend', 'abi');
  if (!fs.existsSync(frontendDir)) fs.mkdirSync(frontendDir, { recursive: true });

  const frontendFilepath = path.join(frontendDir, `${contractName}.js`);
  const frontendContent = `export const ${contractName}ABI = ${JSON.stringify(abi, null, 2)};\n`;

  fs.writeFileSync(frontendFilepath, frontendContent);
  console.log(`Saved ABI for ${contractName} to ${frontendFilepath}`);


  const backendDir = path.join(__dirname, '..', 'backend', 'abi');
  if (!fs.existsSync(backendDir)) fs.mkdirSync(backendDir, { recursive: true });

  const backendFilepath = path.join(backendDir, `${contractName}.js`);
  const backendContent = `export const ${contractName}ABI = ${JSON.stringify(abi, null, 2)};\n`;
  
  fs.writeFileSync(backendFilepath, backendContent);
  console.log(`✅ Saved ABI for ${contractName} to ${backendFilepath}`);
}

// 배포 함수
module.exports = async function(deployer, networks) {
  const accounts = await web3.eth.getAccounts();
  // MainCoin 배포
  await deployer.deploy(MainCoin);
  const mainCoinInstance = await MainCoin.deployed();
  saveAddressFile('MainCoin', mainCoinInstance.address);
  saveAbiFile('MainCoin', MainCoin.abi);

  // SubCoin 배포
  await deployer.deploy(SubCoin);
  const subCoinInstance = await SubCoin.deployed();
  saveAddressFile('SubCoin', subCoinInstance.address);
  saveAbiFile('SubCoin', SubCoin.abi);

  // CityBaseCoin 배포
  await deployer.deploy(CityBaseCoin);
  const cityBaseCoinInstance = await CityBaseCoin.deployed();
  saveAddressFile('CityBaseCoin', cityBaseCoinInstance.address);
  saveAbiFile('CityBaseCoin', CityBaseCoin.abi);

  // CityBaseRewardPool 배포 (MainCoin, SubCoin, CityBaseCoin 주소 인자)
  await deployer.deploy(
    RewardPool,
    mainCoinInstance.address,
    subCoinInstance.address,
    cityBaseCoinInstance.address
  );
  const rewardPoolInstance = await RewardPool.deployed();
  saveAddressFile('CityBaseRewardPool', rewardPoolInstance.address);
  saveAbiFile('CityBaseRewardPool', RewardPool.abi);

  // CityBaseNFT 배포 (RewardPool 주소 인자)
  await deployer.deploy(CityBaseNFT);
  const cityBaseNFTInstance = await CityBaseNFT.deployed();
  saveAddressFile('CityBaseNFT', cityBaseNFTInstance.address);
  saveAbiFile('CityBaseNFT', CityBaseNFT.abi);

  // 각 계정에 초기 토큰 발행 (예: 1000 MainCoin, 1000 SubCoin)
  const initialAmount = web3.utils.toWei("1000", "ether");

  for (const account of accounts) {
    await mainCoinInstance.mint(account, initialAmount);
    await subCoinInstance.mint(account, initialAmount);
  }

  // CityBaseCoin에 mint 권한을 CityBaseRewardPool에 위임
  await cityBaseCoinInstance.setMinter(rewardPoolInstance.address);

  // 민팅 보상용 MainCoin, SubCoin 충전 (NFT 컨트랙트에)
  await mainCoinInstance.mint(cityBaseNFTInstance.address, web3.utils.toWei("1000", "ether"));
  await subCoinInstance.mint(cityBaseNFTInstance.address, web3.utils.toWei("1000", "ether"));
  await mainCoinInstance.mint(cityBaseCoinInstance.address, web3.utils.toWei("1000", "ether"));
  await subCoinInstance.mint(cityBaseCoinInstance.address, web3.utils.toWei("1000", "ether"));
  await mainCoinInstance.mint(rewardPoolInstance.address, web3.utils.toWei("1000", "ether"));
  await subCoinInstance.mint(rewardPoolInstance.address, web3.utils.toWei("1000", "ether"));


  console.log("All contracts deployed and addresses/ABI saved.");
};