// import React, { useState, useEffect } from 'react';
// import { ethers } from 'ethers';
// import detectEthereumProvider from '@metamask/detect-provider';
// import { BrowserProvider, Contract, formatEther } from 'ethers';

// const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
// const CONTRACT_ABI = [
//   "function balanceOf(address account) view returns (uint256)",
//   "function transfer(address to, uint256 amount) returns (bool)",
//   "function symbol() view returns (string)",
//   "function name() view returns (string)"
// ];

// function App() {
//   const [account, setAccount] = useState(null);
//   const [balance, setBalance] = useState(null);
//   const [contract, setContract] = useState(null);
//   const [tokenName, setTokenName] = useState('');
//   const [tokenSymbol, setTokenSymbol] = useState('');

//   useEffect(() => {
//     const init = async () => {
//       const provider = await detectEthereumProvider();
//       if (provider) {
//         const ethersProvider = new BrowserProvider(window.ethereum);
//         const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//         setAccount(accounts[0]);

//         const signer = await ethersProvider.getSigner(accounts[0]);
//         const vyomanContract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
//         setContract(vyomanContract);

//         const name = await vyomanContract.name();
//         const symbol = await vyomanContract.symbol();
//         setTokenName(name);
//         setTokenSymbol(symbol);

//         const bal = await vyomanContract.balanceOf(accounts[0]);
//         setBalance(formatEther(bal));
//       } else {
//         console.log('Please install MetaMask!');
//       }
//     };

//     init();
//   }, []);

//   const handleTransfer = async (event) => {
//     event.preventDefault();
    
//     const to = event.target.to.value;
//     const amountValue = event.target.amount.value;

//     if (!to || !amountValue) {
//       console.error("Please fill in both the recipient address and amount.");
//       return;
//     }

//     try {
//       const amount = ethers.parseEther(amountValue);
//       const tx = await contract.transfer(to, amount);
//       await tx.wait(); // Wait for the transaction to be mined
//       const newBalance = await contract.balanceOf(account);
//       setBalance(formatEther(newBalance)); // Update balance
//       event.target.reset(); // Reset the form fields
//       alert(`Successfully transferred ${amountValue} tokens to ${to}`);
//     } catch (err) {
//       console.error('Error:', err);
//     }
//   };

//   return (
//     <div className="App">
//       <h1>{tokenName} ({tokenSymbol}) Interface</h1>
//       <p>Your account: {account}</p>
//       <p>Your balance: {balance} {tokenSymbol}</p>
//       <form onSubmit={handleTransfer}>
//         <input type="text" name="to" placeholder="Recipient address" required />
//         <input type="text" name="amount" placeholder="Amount" required />
//         <button type="submit">Transfer</button>
//       </form>
//     </div>
//   );
// }

// export default App;

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { BrowserProvider, Contract, formatEther } from 'ethers';
import './App.css';

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [contract, setContract] = useState(null);
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [contractAddress, setContractAddress] = useState('');

  useEffect(() => {
    const init = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } else {
        console.log('Please install MetaMask!');
      }
    };

    init();
  }, []);

  const handleContractAddressChange = async (event) => {
    const address = event.target.value;
    setContractAddress(address);
    setError('');
    setLoading(true);
    setContract(null);

    if (ethers.isAddress(address)) {
      try {
        const ethersProvider = new BrowserProvider(window.ethereum);
        const signer = await ethersProvider.getSigner(account);
        const vyomanContract = new Contract(address, [
          "function balanceOf(address account) view returns (uint256)",
          "function transfer(address to, uint256 amount) returns (bool)",
          "function symbol() view returns (string)",
          "function name() view returns (string)"
        ], signer);

        setContract(vyomanContract);

        const name = await vyomanContract.name();
        const symbol = await vyomanContract.symbol();
        setTokenName(name);
        setTokenSymbol(symbol);

        const bal = await vyomanContract.balanceOf(account);
        setBalance(formatEther(bal));
      } catch (err) {
        setError('Failed to load contract. Please check the address.');
        console.error('Error:', err);
      }
    } else {
      setError('Invalid contract address.');
    }

    setLoading(false);
  };

  const handleTransfer = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const to = event.target.to.value;
    const amountValue = event.target.amount.value;

    if (!ethers.isAddress(to)) {
      setError('Invalid recipient address.');
      setLoading(false);
      return;
    }
    if (parseFloat(amountValue) <= 0) {
      setError('Amount must be greater than 0.');
      setLoading(false);
      return;
    }

    try {
      const amount = ethers.parseEther(amountValue);
      const tx = await contract.transfer(to, amount);
      await tx.wait();
      const newBalance = await contract.balanceOf(account);
      setBalance(formatEther(newBalance));

      setTransactions([...transactions, { to, amount: amountValue }]);

      event.target.reset();
      setError(`Successfully transferred ${amountValue} tokens to ${to}`);
    } catch (err) {
      setError('Error processing transaction.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>{tokenName || 'Token'} ({tokenSymbol || 'Symbol'}) Interface</h1>
      </header>
      <main className="App-content">
        <div className="input-container">
          <input
            type="text"
            placeholder="Enter contract address"
            value={contractAddress}
            onChange={handleContractAddressChange}
            className="contract-input"
          />
        </div>
        <p>Your account: <span className="highlight">{account || 'Not connected'}</span></p>
        <p>Your balance: <span className="highlight">{balance || '0'} {tokenSymbol}</span></p>
        {error && <div className="error">{error}</div>}
        {loading && <div className="loading">Processing...</div>}
        <form onSubmit={handleTransfer} className="transfer-form">
          <input
            type="text"
            name="to"
            placeholder="Recipient address"
            required
            className="transfer-input"
          />
          <input
            type="text"
            name="amount"
            placeholder="Amount"
            required
            className="transfer-input"
          />
          <button type="submit" disabled={loading || !contract} className="transfer-button">
            Transfer
          </button>
        </form>
        <div className="transaction-history">
          <h2>Transaction History</h2>
          <ul>
            {transactions.map((tx, index) => (
              <li key={index} className="transaction-item">
                Transferred <span className="highlight">{tx.amount}</span> tokens to <span className="highlight">{tx.to.slice(0, 6)}...{tx.to.slice(-4)}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

export default App;