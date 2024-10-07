const { ethers } = require("hardhat");

async function main() {
    const [sender] = await ethers.getSigners(); 

    const tx = await sender.sendTransaction({
        to: "0x7d0C0840c506AAB8ec23129b93aeE77C06267D6D",  // Replace with MetaMask address
        value: ethers.parseEther("9900")  // Transfer 9900 ETH
    });

    await tx.wait();
    console.log("ETH transferred:", tx.hash);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
