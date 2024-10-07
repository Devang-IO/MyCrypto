// scripts/transferTokens.js

const { ethers } = require("hardhat");

async function main() {
    // Create readline interface to take input from the user
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Function to ask questions and return a promise
    const askQuestion = (question) => {
        return new Promise((resolve) => {
            readline.question(question, (answer) => {
                resolve(answer);
            });
        });
    };

    // Prompt the user for the deployed contract address, recipient address, and amount
    const contractAddress = await askQuestion('Enter deployed contract address: ');
    const recipientAddress = await askQuestion('Enter recipient address: ');
    const amount = await askQuestion('Enter amount to transfer: ');

    // Close the readline interface after input
    readline.close();

    try {
        // Get the contract instance using the provided deployed contract address
        const vyoman = await ethers.getContractAt("Vyoman", contractAddress);

        // Convert amount to wei
        const parsedAmount = ethers.parseEther(amount);

        // Transfer tokens
        const tx = await vyoman.transfer(recipientAddress, parsedAmount);
        console.log("Transaction Hash:", tx.hash);

        // Wait for transaction confirmation
        await tx.wait();
        console.log("Transfer complete!");
    } catch (error) {
        console.error("Error:", error);
    }
}

// Execute the script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
