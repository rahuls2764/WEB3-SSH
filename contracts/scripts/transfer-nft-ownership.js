// scripts/transfer-nft-ownership.js
const { ethers } = require("hardhat");

async function main() {
  const nftAddress = "0x7A1F0F2273365674677C379F48952A683Fa84446";
  const mainAddress = "0xF6a77300Ac72069b64EF8aFD825245167b07149A";

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
