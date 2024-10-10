'use client'

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { BrowserProvider, Contract, formatEther } from 'ethers';
import { motion } from 'framer-motion';

export function AppComponent() {
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
        const ethersProvider = new BrowserProvider(window.ethereum);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } else {
        setError('Please install MetaMask!');
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
        const provider = await detectEthereumProvider();
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
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1D1D1D] text-[#e0e0e0] font-['Orbitron',sans-serif] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <header className="bg-gradient-to-r from-[#1a1a1a] to-[#333] p-6 rounded-t-lg shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            {tokenName || 'Token'} ({tokenSymbol || 'Symbol'}) Interface
          </h1>
        </header>
        <main className="bg-[#1a1a1a] p-6 rounded-b-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter contract address"
              value={contractAddress}
              onChange={handleContractAddressChange}
              className="w-full p-3 bg-[#1f1f1f] border border-[#b0bec5] rounded-md text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
            />
            <div 
              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-600 transition-all duration-300"
              style={{ width: `${(contractAddress.length / 42) * 100}%` }}
            />
          </div>
          <p className="text-left">Your account: <span className="font-mono text-purple-400">{account || 'Not connected'}</span></p>
          <p className="text-left">Your balance: <span className="font-mono text-purple-400">{balance || '0'} {tokenSymbol}</span></p>
          {error && <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 p-3 rounded-md">{error}</div>}
          {loading && <div className="animate-pulse text-purple-400">Processing...</div>}
          <form onSubmit={handleTransfer} className="space-y-4">
            <input
              type="text"
              name="to"
              placeholder="Recipient address"
              required
              className="w-full p-3 bg-[#1f1f1f] border border-[#b0bec5] rounded-md text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
            />
            <input
              type="text"
              name="amount"
              placeholder="Amount"
              required
              className="w-full p-3 bg-[#1f1f1f] border border-[#b0bec5] rounded-md text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
            />
            <motion.button
              type="submit"
              disabled={loading || !contract}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 px-6 bg-gradient-to-r from-[#6a11cb] to-[#2575fc] text-white rounded-md cursor-pointer transition-all duration-300 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Transfer
            </motion.button>
          </form>
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Transaction History</h2>
            <ul className="space-y-2">
              {transactions.map((tx, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#2a2a2a] p-3 rounded-md text-sm"
                >
                  Transferred <span className="font-mono text-purple-400">{tx.amount}</span> tokens to <span className="font-mono text-purple-400">{tx.to.slice(0, 6)}...{tx.to.slice(-4)}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </main>
      </motion.div>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap');
        
        body {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --primary-gradient: linear-gradient(45deg, #6a11cb, #2575fc);
          --text-gradient: linear-gradient(45deg, #b721ff, #21d4fd);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}