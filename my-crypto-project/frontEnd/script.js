// Replace with your contract address
const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; 
// Replace with your token ABI (Application Binary Interface)
const tokenABI = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)"
];

async function getProvider() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []); // Request wallet connection
    return provider;
}

async function checkBalance() {
    const provider = await getProvider();
    const signer = provider.getSigner();
    const vyoman = new ethers.Contract(contractAddress, tokenABI, signer);
    
    const address = document.getElementById("balanceAddress").value;
    const balance = await vyoman.balanceOf(address);
    const formattedBalance = ethers.utils.formatEther(balance);
    document.getElementById("balanceResult").innerText = `Balance: ${formattedBalance} V`;
}

async function transferTokens() {
    const provider = await getProvider();
    const signer = provider.getSigner();
    const vyoman = new ethers.Contract(contractAddress, tokenABI, signer);
    
    const recipient = document.getElementById("recipient").value;
    const amount = document.getElementById("amount").value;
    
    const tx = await vyoman.transfer(recipient, ethers.utils.parseEther(amount));
    await tx.wait(); // Wait for the transaction to be mined
    document.getElementById("transferResult").innerText = `Transfer successful: ${tx.hash}`;
}

document.getElementById("checkBalanceBtn").onclick = checkBalance;
document.getElementById("transferBtn").onclick = transferTokens;
