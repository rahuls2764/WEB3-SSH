// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SkillBridgeNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;

  constructor(string memory name, string memory symbol, address initialOwner)
    ERC721(name, symbol)
    Ownable(initialOwner)
    {}

    function mintCertificate(address to, string memory resultCID) external onlyOwner returns (uint256) {
        uint256 tokenId = nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, resultCID); // resultCID is the IPFS link
        return tokenId;
    }
}
