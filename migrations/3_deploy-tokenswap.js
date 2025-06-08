const fs =require('fs');
const path = require('path');

const TokenSwap = artifacts.require("TokenSwap");

const MainCoinAddress = require('../rootaddress/MainCoinAddress.js');// 배포된 MainCoin 주소
const SubCoinAddress = require('../rootaddress/SubCoinAddress.js');  // 배포된 SubCoin 주소
const CBCoinAddress = require('../rootaddress/CityBaseCoinAddress.js');  // 배포된 CBCoin 주소

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
  const backendContent = `module.exports = ${JSON.stringify(abi, null, 2)};\n`;

  fs.writeFileSync(backendFilepath, backendContent);
  console.log(`✅ Saved ABI for ${contractName} to ${backendFilepath}`);
}

// 배포 함수
module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(TokenSwap, MainCoinAddress, SubCoinAddress, CBCoinAddress);

  const swapInstance = await TokenSwap.deployed();
  saveAddressFile('TokenSwap', swapInstance.address);
  saveAbiFile('TokenSwap', TokenSwap.abi);
 
  // swap 컨트랙트에 미리 충분한 토큰을 전송해서 유동성 확보 (owner 계정으로)
  //const mainCoin = await artifacts.require("MainCoin").at(MainCoinAddress);
  const subCoin = await artifacts.require("SubCoin").at(SubCoinAddress);

  // 예: 각각 10000 토큰씩 전송
  //await mainCoin.mint(swapInstance.address, web3.utils.toWei("10000", "ether"));
  await subCoin.mint(swapInstance.address, web3.utils.toWei("10000", "ether"));
};