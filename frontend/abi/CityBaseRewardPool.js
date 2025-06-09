export const CityBaseRewardPoolABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_mainCoin",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_subCoin",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_cityBaseCoin",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor",
    "signature": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "nftName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "mainAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "subAmount",
        "type": "uint256"
      }
    ],
    "name": "Contributed",
    "type": "event",
    "signature": "0xb00552cf2ce0f4499bc88c0bc78fc1bbd5ec160198aa7d45f5c1e2ef16eb3902"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event",
    "signature": "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "nftName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "mainAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "subAmount",
        "type": "uint256"
      }
    ],
    "name": "Refunded",
    "type": "event",
    "signature": "0x0e0502582d0bdaa960aad296ea773e4b7919a8ff7d61871cf7d1fcba18b8ab18"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "nftName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "rewardAmount",
        "type": "uint256"
      }
    ],
    "name": "RewardClaimed",
    "type": "event",
    "signature": "0xa22c130ab9525575739c5b8856b4345b50ef04582844399f49949042eb410f00"
  },
  {
    "inputs": [],
    "name": "cityBaseCoin",
    "outputs": [
      {
        "internalType": "contract CityBaseCoin",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true,
    "signature": "0x2315a169"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "contributedMain",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true,
    "signature": "0x52b1b53f"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "contributedSub",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true,
    "signature": "0xadab3025"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "hasMinted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true,
    "signature": "0x6f83ae5f"
  },
  {
    "inputs": [],
    "name": "mainCoin",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true,
    "signature": "0xec00a82c"
  },
  {
    "inputs": [],
    "name": "mintStartTime",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true,
    "signature": "0x931e2e49"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true,
    "signature": "0x8da5cb5b"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x715018a6"
  },
  {
    "inputs": [],
    "name": "subCoin",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true,
    "signature": "0x6a8dac93"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "totalMainContributed",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true,
    "signature": "0x91b48993"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "totalSubContributed",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true,
    "signature": "0xb96f7ba0"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0xf2fde38b"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "nftName",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "mainAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "subAmount",
        "type": "uint256"
      }
    ],
    "name": "contribute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x64f745a7"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "nftName",
        "type": "string"
      }
    ],
    "name": "getUserContributionScore",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true,
    "signature": "0x8a18c164"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "nftName",
        "type": "string"
      }
    ],
    "name": "claimReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x3e6a569a"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "nftName",
        "type": "string"
      }
    ],
    "name": "refund",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0xe08d722e"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "contributors",
        "type": "address[]"
      },
      {
        "internalType": "string",
        "name": "nftName",
        "type": "string"
      }
    ],
    "name": "refundAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0xb45a092f"
  }
];
