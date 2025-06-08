// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenSwap is Ownable {
    IERC20 public mainCoin;
    IERC20 public subCoin;
    IERC20 public citybaseCoin;

    // swapRate Coin (예: 1:1이면 swapRate = 1)
    uint256 public swapRate_MtS = 3;
    uint256 public swapRate_CtS = 1;

    constructor(address _mainCoin, address _subCoin, address _citybasecoin) {
        mainCoin = IERC20(_mainCoin);
        subCoin = IERC20(_subCoin);
        citybaseCoin = IERC20(_citybasecoin);
    }

    // MainCoin → SubCoin 스왑
    function swapMainToSub(uint256 amountMainCoin) external {
        require(amountMainCoin > 0, "Amount must be > 0");
        uint256 amountSubCoin = amountMainCoin * swapRate_MtS;

        // 사용자로부터 MainCoin 받기
        require(mainCoin.transferFrom(msg.sender, address(this), amountMainCoin), "MainCoin transfer failed");
        // 사용자에게 SubCoin 주기
        require(subCoin.transfer(msg.sender, amountSubCoin), "SubCoin transfer failed");
    }

    // CBCoin → SubCoin 스왑
    function swapCBToSub(uint256 amountCBCoin) external {
        require(amountCBCoin > 0, "Amount must be > 0");
        uint256 amountSubCoin = amountCBCoin * swapRate_CtS;

        // 사용자로부터 CBCoin 받기
        require(subCoin.transferFrom(msg.sender, address(this), amountCBCoin), "CBCoin transfer failed");
        // 사용자에게 SubCoin 주기
        require(mainCoin.transfer(msg.sender, amountSubCoin), "SubCoin transfer failed");
    }

    /* owner가 컨트랙트에 토큰 입금 (스왑용)
    function depositTokens(uint256 mainAmount, uint256 subAmount) external onlyOwner {
        require(mainCoin.transferFrom(msg.sender, address(this), mainAmount), "MainCoin deposit failed");
        require(subCoin.transferFrom(msg.sender, address(this), subAmount), "SubCoin deposit failed");
    }

    // owner가 토큰 인출 가능
    function withdrawTokens(uint256 mainAmount, uint256 subAmount) external onlyOwner {
        require(mainCoin.transfer(msg.sender, mainAmount), "MainCoin withdraw failed");
        require(subCoin.transfer(msg.sender, subAmount), "SubCoin withdraw failed");
    }*/
}