const hre = require("hardhat");

async function main() {
  // Deploy the contract
  const Vyoman = await hre.ethers.getContractFactory("Vyoman");
  const initialSupply = hre.ethers.parseEther("1000000"); // 1 million tokens
  const vyoman = await Vyoman.deploy(initialSupply);
  await vyoman.waitForDeployment();
  console.log("Vyoman deployed to:", await vyoman.getAddress());

  // Get the first account (deployer)
  const [deployer] = await hre.ethers.getSigners();

  // Check initial balance
  const initialBalance = await vyoman.balanceOf(deployer.address);
  console.log("Initial deployer balance:", hre.ethers.formatEther(initialBalance));

  // Transfer some tokens
  const transferAmount = hre.ethers.parseEther("100");
  const recipient = "0x7d0C0840c506AAB8ec23129b93aeE77C06267D6D"; // Example recipient address
  await vyoman.transfer(recipient, transferAmount);
  console.log("Transferred 100 tokens to:", recipient);

  // Check balances again
  const deployerBalance = await vyoman.balanceOf(deployer.address);
  const recipientBalance = await vyoman.balanceOf(recipient);
  console.log("Deployer new balance:", hre.ethers.formatEther(deployerBalance));
  console.log("Recipient balance:", hre.ethers.formatEther(recipientBalance));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });