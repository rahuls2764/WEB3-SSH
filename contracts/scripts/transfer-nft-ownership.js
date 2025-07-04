// scripts/transfer-nft-ownership.js
const { ethers } = require("hardhat");

async function main() {
  const nftAddress = "0xD8c55679f0fB9b7f36cB48e8b0AA24AeFD7354b2";
  const mainAddress = "0x074615F39D2e8893640456B692609dDcdBB33E8e";

  const [deployer] = await ethers.getSigners();

  const nft = await ethers.getContractAt("SkillBridgeNFT", nftAddress, deployer);

  const tx = await nft.transferOwnership(mainAddress);
  await tx.wait();

  console.log(`✅ Ownership of NFT contract transferred to: ${mainAddress}`);
}

main().catch((err) => {
  console.error("❌ Transfer failed:", err);
  process.exit(1);
});
