// server.js (ES 모듈)
import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { create } from 'ipfs-http-client';
import { fileURLToPath } from 'url';

import Web3 from 'web3';
import { MainCoinABI } from './abi/MainCoin.js';
import { MainCoinAddress } from './backaddress/MainCoinAddress.js';
import { CityBaseNFTABI } from './abi/CityBaseNFT.js';
import { CityBaseNFTAddress } from './backaddress/CityBaseNFTAddress.js';
import { CityBaseRewardPoolABI } from './abi/CityBaseRewardPool.js';
import { CityBaseRewardPoolAddress } from './backaddress/CityBaseRewardPoolAddress.js';


const web3 = new Web3("http://127.0.0.1:7545"); // 또는 실제 provider 주소
const maincoin = new web3.eth.Contract(MainCoinABI, MainCoinAddress);
const rewardPool = new web3.eth.Contract(CityBaseRewardPoolABI, CityBaseRewardPoolAddress);
const nftContract = new web3.eth.Contract(CityBaseNFTABI, CityBaseNFTAddress);
const serverOwner = '0x3F444E2a9Cd80824ac55b3A1638ACd2ec62140Bc'; // ganache나 owner 계정

// __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// JSON 파싱 및 CORS 허용
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// IPFS 클라이언트 연결 (IPFS 노드가 localhost:5001에 띄워져 있어야 함)
const ipfs = create({ url: 'http://127.0.0.1:5001' });

// mintinfo 폴더 경로
const mintInfoDir = path.join(__dirname, 'mintinfo');
// contributeinfo 폴더 경로
const contributeInfoDir = path.join(__dirname, 'contributeinfo');
// mintedNFT 폴더 경로
const mintedNFTDir = path.join(__dirname, '..', 'frontend', 'mintedNFT');

// 폴더 없으면 생성
if (!fs.existsSync(mintInfoDir)) {
  fs.mkdirSync(mintInfoDir);
}
if (!fs.existsSync(contributeInfoDir)) {
  fs.mkdirSync(contributeInfoDir);
}

// POST /save-mintinfo
app.post('/save-mintinfo', (req, res) => {
  const mintData = req.body;

  if (!mintData.name || !mintData.image) {
    return res.status(400).send('Missing fields in mint info');
  }

  mintData.mintStartTime = Date.now();
  const fileName = `${mintData.name.replace(/\s+/g)}.json`;
  const filePath = path.join(mintInfoDir, fileName);

  fs.writeFile(filePath, JSON.stringify(mintData, null, 2), (err) => {
    if (err) {
      console.error('Failed to save mint info:', err);
      return res.status(500).send('Failed to save mint info');
    }
    console.log('Mint info saved:', fileName);
    res.status(200).send({ message: 'Mint info saved successfully', fileName });
  });
});

// GET /mintinfo-list
app.get('/mintinfo-list', (req, res) => {
  fs.readdir(mintInfoDir, (err, files) => {
    if (err) return res.status(500).send('Failed to read mintinfo directory');
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    res.json(jsonFiles);
  });
});

// GET /mintinfo/:filename
app.get('/mintinfo/:filename', (req, res) => {
  const filePath = path.join(mintInfoDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Mint info not found');
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Failed to read mint info');
    res.json(JSON.parse(data));
  });
});

// DELETE /mintinfo/:filename
app.delete('/mintinfo/:filename', (req, res) => {
  const filePath = path.join(mintInfoDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Mint info not found');
  }

  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).send('Failed to delete mint info');
    res.send({ message: 'Mint info deleted successfully' });
  });
});

// POST /save-contributeinfo
app.post('/save-contributeinfo', (req, res) => {
  const { nftName, contributor } = req.body;

  if (!nftName || !contributor) {
    return res.status(400).send('Missing nftName or contributor');
  }

  const fileName = `${nftName.replace(/\s+/g, '_')}.json`;
  const filePath = path.join(contributeInfoDir, fileName);

  // 파일이 존재하면 읽고 업데이트, 아니면 새로 생성
  if (fs.existsSync(filePath)) {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) return res.status(500).send('Failed to read contribute info');

      let json;
      try {
        json = JSON.parse(data);
      } catch (e) {
        return res.status(500).send('Invalid JSON format');
      }

      if (!Array.isArray(json.contributors)) {
        json.contributors = [];
      }

      if (!json.contributors.includes(contributor)) {
        json.contributors.push(contributor);
      }

      fs.writeFile(filePath, JSON.stringify({ contributors: json.contributors }, null, 2), (err) => {
        if (err) return res.status(500).send('Failed to update contribute info');
        res.status(200).json({ message: 'Contributor added', contributors: json.contributors });
      });
    });
  } else {
    // 새 파일 생성
    const newData = {
      contributors: [contributor],
    };

    fs.writeFile(filePath, JSON.stringify(newData, null, 2), (err) => {
      if (err) return res.status(500).send('Failed to create contribute info');
      res.status(200).json({ message: 'Contribute info created', contributors: newData.contributors });
    });
  }
});

// GET /contributeinfo/:filename
app.get('/contributeinfo/:filename', (req, res) => {
  const filePath = path.join(contributeInfoDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Contribute info not found');
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Failed to read contribute info');
    res.json(JSON.parse(data));
  });
});

// DELETE /contributeinfo/:filename
app.delete('/contributeinfo/:filename', (req, res) => {
  const filePath = path.join(contributeInfoDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Contribute info not found');
  }

  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).send('Failed to delete contribute info');
    res.send({ message: 'Contribute info deleted successfully' });
  });
});

// POST /upload-ipfs
// body.data 에 base64 인코딩된 파일 데이터가 들어온다고 가정
app.post('/upload-ipfs', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).send('No data provided for IPFS upload');

    // base64 문자열에서 header 제거 후 Buffer 변환
    const base64Data = data.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    const result = await ipfs.add(buffer);

    res.status(200).json({ cid: result.cid.toString() });
  } catch (error) {
    console.error('IPFS upload error:', error);
    res.status(500).send('IPFS upload failed');
  }
});

//발행된 NFT 기록 저장
function saveMintedNFT(nftName, creator, imageURL, contributors) {
  if (!fs.existsSync(mintedNFTDir)) {
    fs.mkdirSync(mintedNFTDir, { recursive: true });
  }

  const data = {
    name: nftName,
    image: imageURL,
    creator: creator,
    contributors: contributors
  };

  const filePath = path.join(mintedNFTDir, `${nftName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}


// 자동 민팅/보상 체크 함수
setInterval(async () => {
  const now = Date.now();

  fs.readdir(mintInfoDir, async (err, files) => {
    if (err) return console.error('⛔ Failed to read mintinfo directory:', err);

    for (const file of files.filter(f => f.endsWith('.json'))) {
      const filePath = path.join(mintInfoDir, file);
      const mintData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      const mintStartTime = mintData.mintStartTime;
      const mintDeadline = mintStartTime + 60 * 1000;

      if (now < mintDeadline) continue; // 아직 제한시간 안 됨

      console.log(`🕒 민팅 시간 초과 감지: ${file}`);

      const creator = mintData.creator;
      const nftName = mintData.name;
      const imageURL = mintData.image;

      const contribPath = path.join(contributeInfoDir, `${nftName}.json`);
      if (!fs.existsSync(contribPath)) {
        cleanUpFiles(nftName);
        continue;
      }

      const contribdata = JSON.parse(fs.readFileSync(contribPath, 'utf8'));
      const contributors = contribdata.contributors;
      const nftNameHash = web3.utils.keccak256(nftName);

      let totalScore = 0;

      // 1. 민팅 가능한지 확인
      try {
        for (let i = 0; i < contributors.length; i++) {
          const score = await rewardPool.methods.getUserContributionScore(contributors[i], nftNameHash).call();
          totalScore += Number(score);
        }
        const readableScore = Number(totalScore) / 1e18;
        console.log(`총 기여 점수: ${readableScore}`);

        if (readableScore < 200) {
          console.log("❌ 민팅 불가: 총 기여 점수가 200 미만입니다");
          // 조건 불만족 시 contribute 환불
          await handleRefund(nftName);
          cleanUpFiles(nftName);
          continue;
        }
        console.log("✅ 민팅 조건 충족: 민팅을 실행합니다");
        // 2. 민팅 실행
        await nftContract.methods.mint(imageURL, contributors).send({ from: creator, gas: 5000000 });
        console.log(`✅ NFT 민팅 완료: ${nftName} → ${creator}`);
        await saveMintedNFT(nftName, creator, imageURL, contributors);
        //console.log(`✅ Minted NFT 정보가 저장되었습니다: ${filePath}`);

        // 3. 보상 지급
        await maincoin.methods.mint(creator, web3.utils.toWei("10", "ether")).send({ from: serverOwner, gas: 5000000 });
        await handleReward(nftName);
        cleanUpFiles(nftName);
      } catch (err) {
        console.error(`❌ 자동 민팅 중 오류 발생 (${nftName}):`, err.message);
      }
    }
  });
}, 1000); // 1초마다 실행

// 보상 지급 함수
async function handleReward(nftName) {
  const contribPath = path.join(contributeInfoDir, `${nftName}.json`);
  if (!fs.existsSync(contribPath)) {
        cleanUpFiles(nftName);
        return;
  }

  const data = JSON.parse(fs.readFileSync(contribPath, 'utf8'));
  const contributors = data.contributors;
  const nftNameHash = web3.utils.keccak256(nftName);
  for (let i = 0; i < contributors.length; i++) {
    try {
      await rewardPool.methods.claimReward(contributors[i], nftNameHash).send({ from: serverOwner, gas: 10000000 });
      console.log(`🎁 보상 지급 완료 ${contributors[i]}`);
    } catch (e) {
      console.error(`❌ 보상 지급 실패`, e.message);
    }
  }
}

// 환불 함수 (민팅 실패 시)
async function handleRefund(nftName) {
  const contribPath = path.join(contributeInfoDir, `${nftName}.json`);
  if (!fs.existsSync(contribPath)) return;

  const data = JSON.parse(fs.readFileSync(contribPath, 'utf8'));
  const contributors = data.contributors;
  const nftNameHash = web3.utils.keccak256(nftName);

  
  try {
    await rewardPool.methods.refundAll(contributors, nftNameHash).send({ from: serverOwner, gas: 10000000 });
    console.log(`↩️ 환불 완료`);
  } catch (e) {
    console.error(`❌ 환불 실패`, e.message);
  }
}


// 파일 정리 함수
function cleanUpFiles(nftName) {
  const mintPath = path.join(mintInfoDir, `${nftName}.json`);
  const contribPath = path.join(contributeInfoDir, `${nftName}.json`);

  if (fs.existsSync(mintPath)) fs.unlinkSync(mintPath);
  if (fs.existsSync(contribPath)) fs.unlinkSync(contribPath);

  console.log(`🧹 정리 완료: ${nftName}.json`);
}

// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ Backend server running at http://localhost:${PORT}`);
});