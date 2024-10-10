const { ethers } = require("hardhat");

async function main() {
  // Get all accounts
  const accounts = await ethers.getSigners();

  // Specify which Hardhat account to use (e.g., the third account, index 2)
  const senderIndex = 1;
  const sender = accounts[senderIndex];

  // MetaMask account address (replace with your actual MetaMask address)
  const receiverAddress = "0x040ad562800bF149a137aEcc82A50Ba60248bD58";

  // Amount to send in ETH
  const amountInEth = "9999";

  console.log(`Sender address: ${sender.address}`);
  console.log(`Receiver address: ${receiverAddress}`);
  console.log(`Amount to send: ${amountInEth} ETH`);

  // Check sender's balance
  const balanceBefore = await ethers.provider.getBalance(sender.address);
  console.log("Sender's balance before:", ethers.formatEther(balanceBefore));

  // Send transaction
  const tx = await sender.sendTransaction({
    to: receiverAddress,
    value: ethers.parseEther(amountInEth)
  });

  // Wait for transaction to be mined
  await tx.wait();

  console.log("Transaction hash:", tx.hash);

  // Check sender's balance after
  const balanceAfter = await ethers.provider.getBalance(sender.address);
  console.log("Sender's balance after:", ethers.formatEther(balanceAfter));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });