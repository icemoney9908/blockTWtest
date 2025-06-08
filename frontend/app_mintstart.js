// app_mintstart.js
let accounts;

async function connectMetaMask() {
  if (window.ethereum) {
    const web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      accounts = await web3.eth.getAccounts();
      document.getElementById("accountDisplay").textContent = accounts[0];
    } catch (error) {
      console.error("MetaMask 연결 실패", error);
    }
  } else {
    alert("MetaMask가 설치되어 있지 않습니다.");
  }
}

// 이미지 파일을 base64로 변환하는 함수
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

async function startMint() {
  const imageInput = document.getElementById("imageInput").files[0];
  const title = document.getElementById("titleInput").value;

  if (!imageInput || !title) {
    alert("NFT 이름과 이미지를 모두 입력하세요");
    return;
  }

  try {
    // 1. 이미지 파일을 base64로 변환
    const base64Image = await fileToBase64(imageInput);

    // 2. backend 서버 /upload-ipfs 에 POST 요청으로 이미지 업로드
    const ipfsRes = await fetch('http://localhost:3000/upload-ipfs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: base64Image })
    });

    if (!ipfsRes.ok) throw new Error('IPFS 업로드 실패');

    const { cid } = await ipfsRes.json();
    const imageUrl = `https://ipfs.io/ipfs/${cid}`;
    
    // 3. 민팅 메타데이터 생성
    const metadata = {
      name: title,
      image: imageUrl,
      creator: accounts[0],
      createdAt: Date.now()
    };

    // 4. mintinfo 저장 API에 JSON 직접 POST
    const saveRes = await fetch('http://localhost:3000/save-mintinfo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata)
    });

    if (saveRes.ok) {
      alert("민팅 시작 성공! 다른 사용자들이 기여할 수 있습니다.");
    } else {
      alert("민팅 정보 저장 실패");
    }
  } catch (err) {
    console.error("민팅 중 오류", err);
    alert("민팅 실패: " + err.message);
  }
}

// 버튼 이벤트 리스너 묶음
document.getElementById("connectBtn").addEventListener("click", connectMetaMask);
document.getElementById("startMintBtn").addEventListener("click", startMint);