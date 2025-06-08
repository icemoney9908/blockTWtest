// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CityBaseNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    // NFT별 기여자 주소 목록
    mapping(uint256 => address[]) public nftContributors;

    // NFT별 총 기여 점수
    //mapping(uint256 => uint256) public totalContributionScore;

    constructor() ERC721("CityBaseNFT", "CBNFT") {}

    /// NFT를 민팅하고 해당 NFT에 기여자 정보 및 총합 점수를 기록
    /// tokenURI IPFS URI
    /// contributors 기여자 주소 배열
    function mint(
        string memory tokenURI, 
        address[] calldata contributors
        //uint256 totalScore
    ) external {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        nftContributors[newTokenId] = contributors;
        //totalContributionScore[newTokenId] = totalScore;
    }
}