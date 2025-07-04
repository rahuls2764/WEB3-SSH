// contracts/scripts/deploy-token.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("SkillBridgeToken");
  const token = await Token.deploy(deployer.address); // 👈 Pass owner address!
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("✅ SkillBridgeToken deployed to:", address);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
