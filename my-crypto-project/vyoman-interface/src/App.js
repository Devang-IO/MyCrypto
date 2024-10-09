import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { BrowserProvider, Contract, formatEther } from 'ethers';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const CONTRACT_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [contract, setContract] = useState(null);
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');

  useEffect(() => {
    const init = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        const ethersProvider = new BrowserProvider(window.ethereum);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);

        const signer = await ethersProvider.getSigner(accounts[0]);
        const vyomanContract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        setContract(vyomanContract);

        const name = await vyomanContract.name();
        const symbol = await vyomanContract.symbol();
        setTokenName(name);
        setTokenSymbol(symbol);

        const bal = await vyomanContract.balanceOf(accounts[0]);
        setBalance(formatEther(bal));
      } else {
        console.log('Please install MetaMask!');
      }
    };

    init();
  }, []);

  const handleTransfer = async (event) => {
    event.preventDefault();
    
    const to = event.target.to.value;
    const amountValue = event.target.amount.value;

    if (!to || !amountValue) {
      console.error("Please fill in both the recipient address and amount.");
      return;
    }

    try {
      const amount = ethers.parseEther(amountValue);
      const tx = await contract.transfer(to, amount);
      await tx.wait(); // Wait for the transaction to be mined
      const newBalance = await contract.balanceOf(account);
      setBalance(formatEther(newBalance)); // Update balance
      event.target.reset(); // Reset the form fields
      alert(`Successfully transferred ${amountValue} tokens to ${to}`);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="App">
      <h1>{tokenName} ({tokenSymbol}) Interface</h1>
      <p>Your account: {account}</p>
      <p>Your balance: {balance} {tokenSymbol}</p>
      <form onSubmit={handleTransfer}>
        <input type="text" name="to" placeholder="Recipient address" required />
        <input type="text" name="amount" placeholder="Amount" required />
        <button type="submit">Transfer</button>
      </form>
    </div>
  );
}

export default App;
