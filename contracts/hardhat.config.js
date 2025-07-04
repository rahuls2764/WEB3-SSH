// contracts/hardhat.config.js
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
require("@nomicfoundation/hardhat-toolbox");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ALCHEMY_URL = process.env.ALCHEMY_URL || "";

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    sepolia: {
      url: ALCHEMY_URL,
      accounts: [PRIVATE_KEY]
    }
  },
  paths: {
    sources: ".",    // Your Solidity files are inside /contracts
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
