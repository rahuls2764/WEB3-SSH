// contracts/scripts/deploy-nft.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners(); // Get deployer address
  const NFT = await ethers.getContractFactory("SkillBridgeNFT");

  const nft = await NFT.deploy("SkillBridge Certificate", "SBCERT", deployer.address); // Pass owner address
  await nft.waitForDeployment();

  console.log("✅ SkillBridgeNFT deployed to:", await nft.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
