require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Load environment variables from .env file

module.exports = {
  solidity: "0.8.20",
  networks: {
    // Sepolia testnet configuration
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`, // Replace with your Alchemy or Infura Sepolia URL
      accounts: [`0x${process.env.PRIVATE_KEY}`], //private key from the .env file
    },
    // Hardhat default network for local testing
    hardhat: {
    },
  },
};
