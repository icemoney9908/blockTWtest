export const TokenSwapABI = [
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
        "name": "_citybasecoin",
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
    "inputs": [],
    "name": "citybaseCoin",
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
    "signature": "0x9f125d26"
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
    "inputs": [],
    "name": "swapRate_CtS",
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
    "signature": "0x6bb0011a"
  },
  {
    "inputs": [],
    "name": "swapRate_MtS",
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
    "signature": "0x4c180aca"
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
        "internalType": "uint256",
        "name": "amountMainCoin",
        "type": "uint256"
      }
    ],
    "name": "swapMainToSub",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x026dde58"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amountCBCoin",
        "type": "uint256"
      }
    ],
    "name": "swapCBToSub",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x770076e7"
  }
];
