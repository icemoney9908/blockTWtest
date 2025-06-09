let userAccount

async function connectWallet() {
  if (window.ethereum) {
    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" })
      userAccount = accounts[0].toLowerCase()

      // Update account display with better formatting
      const shortAddress = `${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`
      document.getElementById("accountDisplay").textContent = `지갑 주소: ${shortAddress}`

      // Update connect button
      const connectBtn = document.getElementById("connectBtn")
      connectBtn.textContent = "✅ Connected"
      connectBtn.style.background = "linear-gradient(45deg, #4CAF50, #8BC34A)"

      loadNFTs()
    } catch (error) {
      console.error("Wallet connection failed:", error)
      alert("지갑 연결에 실패했습니다.")
    }
  } else {
    alert("MetaMask를 설치해주세요.")
  }
}

async function loadNFTs() {
  try {
    // Show loading state
    showLoadingState()

    // mintedNFT 디렉토리에서 JSON 목록 가져오기
    const response = await fetch("/mintedNFT/")

    if (!response.ok) {
      throw new Error(`Failed to fetch directory: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    const links = Array.from(doc.querySelectorAll("a"))
      .map((a) => a.getAttribute("href"))
      .filter((href) => href && href.endsWith(".json"))

    console.log(`Found ${links.length} JSON files:`, links)

    const created = []
    const contributed = []
    const errors = []

    for (const link of links) {
      try {
        console.log(`Loading: ${link}`)
        const nftRes = await fetch(link)

        if (!nftRes.ok) {
          console.warn(`❌ ${link}: ${nftRes.status} ${nftRes.statusText}`)
          errors.push(`${link}: ${nftRes.status} ${nftRes.statusText}`)
          continue
        }

        // Check if response is actually JSON
        const contentType = nftRes.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          // Try to read as text first to see what we got
          const responseText = await nftRes.text()

          if (responseText.trim().startsWith("<!DOCTYPE") || responseText.trim().startsWith("<html")) {
            console.warn(`❌ ${link}: Server returned HTML instead of JSON`)
            errors.push(`${link}: Server returned HTML instead of JSON`)
            continue
          }

          // Try to parse as JSON anyway
          try {
            const nft = JSON.parse(responseText)
            processNFT(nft, created, contributed)
          } catch (parseError) {
            console.warn(`❌ ${link}: Invalid JSON format`, parseError.message)
            errors.push(`${link}: Invalid JSON format`)
            continue
          }
        } else {
          // Content-Type indicates JSON, proceed normally
          const nft = await nftRes.json()
          processNFT(nft, created, contributed)
        }

        console.log(`✅ ${link}: Loaded successfully`)
      } catch (err) {
        console.error(`❌ ${link} 로드 실패`, err)
        errors.push(`${link}: ${err.message}`)
      }
    }

    // Show summary
    console.log(`NFT Loading Summary:`)
    console.log(`- Created NFTs: ${created.length}`)
    console.log(`- Contributed NFTs: ${contributed.length}`)
    console.log(`- Errors: ${errors.length}`)

    if (errors.length > 0) {
      console.warn("Errors encountered:", errors)
    }

    // Update stats
    updateStats(created.length, contributed.length, errors.length)

    // Render NFTs
    renderNFTs("createdNFTs", created, "created")
    renderNFTs("contributedNFTs", contributed, "contributed")

    // Show error summary if there were issues
    if (errors.length > 0) {
      showErrorSummary(errors)
    }
  } catch (error) {
    console.error("NFT loading failed:", error)
    showErrorState(error.message)
  }
}

function processNFT(nft, created, contributed) {
  // Validate NFT structure
  if (!nft || typeof nft !== "object") {
    throw new Error("Invalid NFT data structure")
  }

  if (nft.creator && nft.creator.toLowerCase() === userAccount) {
    created.push(nft)
  } else if (
    nft.contributors &&
    Array.isArray(nft.contributors) &&
    nft.contributors.map((a) => a.toLowerCase()).includes(userAccount)
  ) {
    contributed.push(nft)
  }
}

function showErrorSummary(errors) {
  // Create a small error notification
  const errorDiv = document.createElement("div")
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(255, 0, 0, 0.1);
    border: 1px solid rgba(255, 0, 0, 0.3);
    border-radius: 10px;
    padding: 1rem;
    color: #ff6666;
    backdrop-filter: blur(10px);
    z-index: 1000;
    max-width: 300px;
    font-size: 0.9rem;
  `

  errorDiv.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 0.5rem;">
      ⚠️ ${errors.length} file(s) failed to load
    </div>
    <div style="font-size: 0.8rem; opacity: 0.8;">
      Check console for details
    </div>
    <button onclick="this.parentElement.remove()" style="
      background: none;
      border: none;
      color: #ff6666;
      cursor: pointer;
      float: right;
      margin-top: 0.5rem;
    ">✕</button>
  `

  document.body.appendChild(errorDiv)

  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (errorDiv.parentElement) {
      errorDiv.remove()
    }
  }, 10000)
}

function showErrorState(errorMessage = "Unknown error") {
  const errorHTML = `
    <div class="empty-state">
      <div class="empty-icon">⚠️</div>
      <div class="empty-text">Failed to load NFTs</div>
      <div class="empty-subtext">${errorMessage}</div>
      <button onclick="loadNFTs()" style="
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
        border: none;
        color: white;
        padding: 0.8rem 1.5rem;
        border-radius: 25px;
        cursor: pointer;
        margin-top: 1rem;
      ">🔄 Retry</button>
    </div>
  `
  document.getElementById("createdNFTs").innerHTML = errorHTML
  document.getElementById("contributedNFTs").innerHTML = errorHTML
}

function updateStats(createdCount, contributedCount, errorCount = 0) {
  document.getElementById("createdCount").textContent = createdCount
  document.getElementById("contributedCount").textContent = contributedCount

  // Calculate estimated total value (placeholder calculation)
  const estimatedValue = (createdCount * 0.1 + contributedCount * 0.05).toFixed(2)
  document.getElementById("totalValue").textContent = `${estimatedValue} ETH`

  // Set last activity (current date for demo)
  const today = new Date().toLocaleDateString()
  document.getElementById("lastActivity").textContent = today

  // Add error indicator if there were errors
  if (errorCount > 0) {
    const lastActivityElement = document.getElementById("lastActivity")
    lastActivityElement.innerHTML = `${today} <span style="color: #ff6666; font-size: 0.8rem;">(${errorCount} errors)</span>`
  }
}

function renderNFTs(containerId, nftList, type) {
  const container = document.getElementById(containerId)

  if (nftList.length === 0) {
    const emptyIcon = type === "created" ? "🎨" : "🤝"
    const emptyMessage =
      type === "created" ? "You haven't created any NFTs yet" : "You haven't contributed to any NFTs yet"
    const emptySubtext =
      type === "created" ? "Start creating your first NFT!" : "Join community minting events to contribute!"

    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${emptyIcon}</div>
        <div class="empty-text">${emptyMessage}</div>
        <div class="empty-subtext">${emptySubtext}</div>
      </div>
    `
    return
  }

  container.innerHTML = ""

  nftList.forEach((nft, index) => {
    const div = document.createElement("div")
    div.className = "nft"

    // Handle missing image
    const imageUrl = nft.image || "/placeholder.svg?height=200&width=300"

    // Format contributors list
    const contributorsList = nft.contributors
      ? nft.contributors.map((addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`).join(", ")
      : "No contributors"

    div.innerHTML = `
  <div class="nft-name">${nft.name || "Unnamed NFT"}</div>
  <img src="${imageUrl}" alt="${nft.name || "NFT"}" onerror="this.src='/placeholder.svg?height=250&width=300'" />
`

    // Add animation delay for staggered appearance
    div.style.animationDelay = `${index * 0.1}s`
    div.style.animation = "fadeInUp 0.6s ease forwards"

    container.appendChild(div)
  })
}

// Add CSS animation for NFT cards
const style = document.createElement("style")
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`
document.head.appendChild(style)

// Auto-connect wallet if previously connected
window.addEventListener("load", async () => {
  if (window.ethereum && window.ethereum.selectedAddress) {
    await connectWallet()
  }
})

// Handle account changes
if (window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts) => {
    if (accounts.length === 0) {
      // User disconnected wallet
      userAccount = null
      document.getElementById("accountDisplay").textContent = "지갑 주소: 연결 안 됨"
      const connectBtn = document.getElementById("connectBtn")
      connectBtn.textContent = "🔗 Connect MetaMask"
      connectBtn.style.background = "linear-gradient(45deg, #ff6b6b, #4ecdc4)"

      // Clear NFT displays
      document.getElementById("createdNFTs").innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔗</div>
          <div class="empty-text">Connect your wallet to view NFTs</div>
          <div class="empty-subtext">Click the connect button above</div>
        </div>
      `
      document.getElementById("contributedNFTs").innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔗</div>
          <div class="empty-text">Connect your wallet to view NFTs</div>
          <div class="empty-subtext">Click the connect button above</div>
        </div>
      `

      // Reset stats
      updateStats(0, 0)
    } else {
      // User switched accounts
      connectWallet()
    }
  })
}

// Declare ethereum
const ethereum = window.ethereum

// Declare showLoadingState
function showLoadingState() {
  document.getElementById("createdNFTs").innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⏳</div>
        <div class="empty-text">Loading NFTs...</div>
        <div class="empty-subtext">Please wait</div>
      </div>
    `
  document.getElementById("contributedNFTs").innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⏳</div>
        <div class="empty-text">Loading NFTs...</div>
        <div class="empty-subtext">Please wait</div>
      </div>
    `
}
