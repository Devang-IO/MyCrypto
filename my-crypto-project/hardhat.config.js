require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Load environment variables from .env file

module.exports = {
  solidity: "0.8.20",
  networks: {
    // Sepolia testnet configuration
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`, // Alchemy or Infura Sepolia URL
      accounts: [`0x${process.env.PRIVATE_KEY}`], // Private key from the .env file
    },
    // Hardhat default network for local testing
    hardhat: {
      chainId: 31337, // Explicitly set the chain ID for Hardhat network
      mining: {
        auto: true, // Enable automatic mining of blocks (useful for testing)
        interval: 1000, // Mining interval (1 second)
      },
      accounts: {
        count: 10, // Number of accounts to generate (optional, default is 20)
        // Remove balance setting from here to avoid HH9 error
      },
    },
  },
};
