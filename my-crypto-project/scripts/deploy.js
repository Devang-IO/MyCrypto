const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Change this to "Vyoman" if your contract is named Vyoman in the Solidity file
  const Vyoman = await hre.ethers.getContractFactory("Vyoman");
  const vyoman = await Vyoman.deploy("1000000000000000000000000"); // 1 million tokens

  await vyoman.waitForDeployment();

  console.log("Vyoman deployed to:", await vyoman.getAddress());
  console.log("Tokens minted to:", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
