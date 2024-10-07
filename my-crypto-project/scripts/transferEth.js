const { ethers } = require("hardhat");

async function main() {
    const [sender] = await ethers.getSigners(); 

    const tx = await sender.sendTransaction({
        to: "0xA60293cee06B95E8AA0020DBC4c62c2177d42494",  // Replace with MetaMask address
        value: ethers.parseEther("10000")  // Transfer 10000 ETH
    });

    await tx.wait();
    console.log("ETH transferred:", tx.hash);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
