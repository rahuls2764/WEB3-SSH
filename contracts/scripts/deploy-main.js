// scripts/deploy-main.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const tokenAddress = "0xd0468487E22A2f10E84cec0dB23711801cfbEA0b"; // ✅ Your deployed SkillBridgeToken
  const nftAddress = "0x7A1F0F2273365674677C379F48952A683Fa84446";   // ✅ Your deployed SkillBridgeNFT

  const Main = await ethers.getContractFactory("SkillBridgeMain");
  const mainContract = await Main.deploy(tokenAddress, nftAddress, deployer.address);
  await mainContract.waitForDeployment();

  const mainAddress = await mainContract.getAddress();
  console.log("✅ SkillBridgeMain deployed to:", mainAddress);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
