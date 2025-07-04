// scripts/deploy-main.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const tokenAddress = "0xc214a458456003FAAd6d06749E8609b066EB3495"; // ✅ Your deployed SkillBridgeToken
  const nftAddress = "0xD8c55679f0fB9b7f36cB48e8b0AA24AeFD7354b2";   // ✅ Your deployed SkillBridgeNFT

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
