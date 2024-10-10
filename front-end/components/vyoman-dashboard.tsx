'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ethers } from 'ethers'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Wallet, Send, CreditCard, Activity, RefreshCcw, LogIn, UserPlus, AlertTriangle } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'

// ABI for Vyoman token
const VYOMAN_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function decimals() view returns (uint8)"
]

interface User {
  address: string
  password: string
}

interface Transaction {
  hash: string
  amount: string
  to: string
  timestamp: number
}

export function VyomanDashboardComponent() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showLogin, setShowLogin] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [balance, setBalance] = useState<string | null>(null)
  const [contractAddress, setContractAddress] = useState('')
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Add Orbitron font
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    // Apply the font to the body
    document.body.style.fontFamily = "'Orbitron', sans-serif"

    return () => {
      document.head.removeChild(link)
      document.body.style.fontFamily = ''
    }
  }, [])

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        toast.success('Wallet connected successfully!')
        return address
      } catch (err) {
        console.error('Failed to connect wallet:', err)
        toast.error('Failed to connect wallet. Please try again.')
        return null
      }
    } else {
      toast.error('MetaMask is not installed. Please install it to use this dApp.')
      return null
    }
  }, [])

  const fetchBalanceAndInfo = useCallback(async () => {
    if (!currentUser || !contractAddress) return
    setLoading(true)
    setError('')
    try {
      const address = await connectWallet()
      if (!address) throw new Error('Failed to connect wallet')

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const vyomanContract = new ethers.Contract(contractAddress, VYOMAN_ABI, signer)
      setContract(vyomanContract)

      const name = await vyomanContract.name()
      const symbol = await vyomanContract.symbol()
      setTokenName(name)
      setTokenSymbol(symbol)

      const balance = await vyomanContract.balanceOf(address)
      const decimals = await vyomanContract.decimals()
      setBalance(ethers.formatUnits(balance, decimals))
      toast.success('Contract loaded successfully!')
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to fetch balance and token info: ' + (err instanceof Error ? err.message : String(err)))
      toast.error('Failed to load contract. Please check the address and try again.')
    }
    setLoading(false)
  }, [currentUser, contractAddress, connectWallet])

  useEffect(() => {
    if (currentUser && contractAddress) {
      fetchBalanceAndInfo()
    }
  }, [currentUser, contractAddress, fetchBalanceAndInfo])

  const handleLogin = async (address: string, password: string) => {
    if (!address || !password) {
      toast.error('Please fill in all fields')
      return
    }
    const user = users.find(u => u.address.toLowerCase() === address.toLowerCase() && u.password === password)
    if (user) {
      const connectedAddress = await connectWallet()
      if (connectedAddress && connectedAddress.toLowerCase() === address.toLowerCase()) {
        setCurrentUser(user)
        setError('')
        toast.success('Logged in successfully!')
      } else {
        toast.error('Connected wallet address does not match the provided address')
      }
    } else {
      toast.error('Invalid credentials')
    }
  }

  const handleSignup = async (address: string, password: string) => {
    if (!address || !password) {
      toast.error('Please fill in all fields')
      return
    }
    if (!ethers.isAddress(address)) {
      toast.error('Invalid Ethereum address')
      return
    }
    if (users.some(u => u.address.toLowerCase() === address.toLowerCase())) {
      toast.error('Address already exists')
    } else {
      const connectedAddress = await connectWallet()
      if (connectedAddress && connectedAddress.toLowerCase() === address.toLowerCase()) {
        const newUser = { address, password }
        setUsers(prevUsers => [...prevUsers, newUser])
        setCurrentUser(newUser)
        setError('')
        toast.success('Signed up successfully!')
      } else {
        toast.error('Connected wallet address does not match the provided address')
      }
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setContractAddress('')
    setContract(null)
    setBalance(null)
    setTokenName('')
    setTokenSymbol('')
    setError('')
    toast.success('Logged out successfully!')
  }

  const handleTransfer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const form = event.target as HTMLFormElement
    const to = (form.elements.namedItem('to') as HTMLInputElement).value
    const amount = (form.elements.namedItem('amount') as HTMLInputElement).value

    if (!to || !amount) {
      toast.error('Please fill in all fields')
      setLoading(false)
      return
    }

    if (!ethers.isAddress(to)) {
      toast.error('Invalid recipient address')
      setLoading(false)
      return
    }

    try {
      if (!contract) throw new Error('Contract not initialized')
      const decimals = await contract.decimals()
      const tx = await contract.transfer(to, ethers.parseUnits(amount, decimals))
      await tx.wait()
      await fetchBalanceAndInfo()
      setTransactions(prevTransactions => [...prevTransactions, { hash: tx.hash, amount, to, timestamp: Date.now() }])
      form.reset()
      toast.success('Transfer successful!')
    } catch (err) {
      console.error('Error sending transaction:', err)
      toast.error('Failed to send transaction: ' + (err instanceof Error ? err.message : String(err)))
    }
    setLoading(false)
  }

  const LoginSignupForm = () => (
    <div className="flex items-center justify-center space-x-8">
      <Card className="w-[350px] bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-purple-400">
            {showLogin ? 'Login' : 'Sign Up'}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {showLogin ? 'Access your Vyoman account' : 'Create a new Vyoman account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault()
            const form = e.target as HTMLFormElement
            const address = (form.elements.namedItem('address') as HTMLInputElement).value
            const password = (form.elements.namedItem('password') as HTMLInputElement).value
            showLogin ? handleLogin(address, password) : handleSignup(address, password)
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-200">Wallet Address</Label>
              <Input id="address" name="address" required className="bg-gray-800 text-white border-gray-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">Password</Label>
              <Input id="password" name="password" type="password" required className="bg-gray-800 text-white border-gray-700" />
            </div>
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              {showLogin ? <LogIn className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
              {showLogin ? 'Login' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button variant="link" onClick={() => setShowLogin(!showLogin)} className="w-full text-purple-400 hover:text-purple-300">
            {showLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </Button>
        </CardFooter>
      </Card>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img src="/vyoman-logo.gif" alt="Vyoman Logo" className="w-64 h-64 object-cover rounded-full" />
      </motion.div>
    </div>
  )

  const Dashboard = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-purple-400">Vyoman Token Dashboard</h1>
        <Button onClick={handleLogout} variant="destructive">Logout</Button>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl text-purple-400">Contract Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contractAddress" className="text-gray-200">Vyoman Contract Address</Label>
              <Input
                id="contractAddress"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="Enter Vyoman contract address"
                className="bg-gray-800 text-white border-gray-700"
              />
            </div>
            <Button onClick={fetchBalanceAndInfo} className="bg-purple-600 hover:bg-purple-700 text-white">
              Load Contract
            </Button>
          </div>
        </CardContent>
      </Card>

      {contract && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-200">Token Balance</CardTitle>
                <Wallet className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400">{balance ? `${parseFloat(balance).toFixed(4)} ${tokenSymbol}` : 'Loading...'}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-200">Token Name</CardTitle>
                <CreditCard className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400">{tokenName || 'Loading...'}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-200">Token Symbol</CardTitle>
                <Activity className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400">{tokenSymbol || 'Loading...'}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-900 border-gray-800 mt-6">
            <CardHeader>
              <CardTitle className="text-xl text-purple-400">Transfer Vyoman Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransfer} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="to" className="text-gray-200">Recipient Address</Label>
                  <Input id="to" name="to" required className="bg-gray-800 text-white border-gray-700" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-gray-200">Amount</Label>
                  <Input id="amount" name="amount" type="number" step="0.000000000000000001" required  className="bg-gray-800 text-white border-gray-700" />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  {loading ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Transfer Tokens
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800 mt-6">
            <CardHeader>
              <CardTitle className="text-xl text-purple-400">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <motion.div
                    key={tx.hash}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between p-2 bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-purple-400">To: {tx.to.slice(0, 6)}...{tx.to.slice(-4)}</p>
                      <p className="text-xs text-gray-400">{new Date(tx.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-purple-400">{tx.amount} {tokenSymbol}</p>
                      <p className="text-xs text-gray-400">{tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center p-4 bg-red-500 text-white rounded-lg"
        >
          <AlertTriangle className="mr-2 h-5 w-5" />
          <p>{error}</p>
        </motion.div>
      )}
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {currentUser ? <Dashboard key="dashboard" /> : <LoginSignupForm key="login" />}
        </AnimatePresence>
      </motion.div>
      <Toaster position="bottom-right" />
    </div>
  )
}