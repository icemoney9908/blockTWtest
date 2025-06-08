const fs = require('fs');
const path = require('path');

const SubCoin = artifacts.require("SubCoin");
const Staking = artifacts.require("Staking");

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

  // 루트용 (common JS)
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

module.exports = async function (deployer, network, accounts) {
  const subCoinInstance = await SubCoin.deployed();

  await deployer.deploy(Staking, subCoinInstance.address);
  const stakingInstance = await Staking.deployed();

  await subCoinInstance.mint(stakingInstance.address, web3.utils.toWei('10000', 'ether'), { from: accounts[0] });

  saveAddressFile('Staking', stakingInstance.address);
  saveAbiFile('Staking', Staking.abi);
};