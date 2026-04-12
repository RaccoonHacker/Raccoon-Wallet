// components/Transfer.tsx
'use client'
import { useState, useMemo, useEffect } from 'react'
import { useWalletStore } from '@/store/useWalletStore'
import { getPublicClient, getWalletClient, hardhatChain } from '@/lib/client'
import { parseEther, formatEther, isAddress, formatUnits } from 'viem'
import { getAccountFromPrivKey } from '@/lib/account'
import { mainnet, sepolia } from 'viem/chains'
import { decryptData } from '@/lib/crypto'
import { erc20Abi } from '@/lib/erc20'

export default function Transfer() {
  const { 
    accounts, currentAccountIndex, networks, activeNetworkId,
    addTransaction, updateTransactionStatus, tokens, addToken 
  } = useWalletStore()
  
  const currentNetwork = useMemo(() => {
    return networks.find(n => n.id === activeNetworkId) || networks[0]
  }, [networks, activeNetworkId])

  const currentAccount = accounts[currentAccountIndex]

  // --- 基础状态 ---
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [tokenAddress, setTokenAddress] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [tokenDecimals, setTokenDecimals] = useState(18)
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [estimateFee, setEstimateFee] = useState<string>('0')
  const [currentBalance, setCurrentBalance] = useState<string>('0')

  // --- 新增：密码验证状态 ---
  const [isVerifying, setIsVerifying] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // --- 自动识别代币逻辑 (保持原功能) ---
  useEffect(() => {
    const updateStats = async () => {
      if (!currentAccount?.address) return
      try {
        const client = getPublicClient(currentNetwork.rpcUrl)
        if (tokenAddress && isAddress(tokenAddress)) {
          const [bal, symbol, decimals, name] = await Promise.all([
            client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: 'balanceOf', args: [currentAccount.address as `0x${string}`] }),
            client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: 'symbol' }),
            client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: 'decimals' }),
            client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: 'name' }).catch(() => 'Unknown Token')
          ])
          setCurrentBalance(formatUnits(bal as bigint, decimals as number))
          setTokenSymbol(symbol as string)
          setTokenDecimals(decimals as number)
          
          const isAlreadySaved = tokens.some(t => t.address.toLowerCase() === tokenAddress.toLowerCase() && t.chainId === activeNetworkId)
          if (!isAlreadySaved) {
            setTimeout(() => {
              if (confirm(`Raccoon 检测到新代币: ${name} (${symbol})\n是否添加到您的资产列表？`)) {
                addToken({ address: tokenAddress, symbol: symbol as string, decimals: decimals as number, chainId: activeNetworkId, name: name as string })
              }
            }, 500)
          }
        } else {
          const b = await client.getBalance({ address: currentAccount.address as `0x${string}` })
          setCurrentBalance(formatEther(b))
          setTokenSymbol(currentNetwork.symbol)
          setTokenDecimals(18)
        }
        const gasPrice = await client.getGasPrice()
        const fee = gasPrice * (tokenAddress ? BigInt(65000) : BigInt(21000))
        setEstimateFee(formatEther(fee))
      } catch (e) { console.error(e) }
    }
    updateStats()
    const timer = setInterval(updateStats, 3000)
    return () => clearInterval(timer)
  }, [currentAccount?.address, currentNetwork.rpcUrl, tokenAddress, activeNetworkId])

  const handleMax = () => {
    const balanceNum = parseFloat(currentBalance)
    const feeNum = parseFloat(estimateFee)
    if (tokenAddress) setAmount(currentBalance)
    else setAmount((balanceNum > feeNum) ? (balanceNum - feeNum * 1.1).toFixed(6) : '0')
  }

  // 第一阶段：点击发送，检查输入并要求输入密码
  const handlePreSend = () => {
    if (!to || !isAddress(to)) return alert("请输入合法的接收地址")
    if (!amount || parseFloat(amount) <= 0) return alert("请输入合法金额")
    setIsVerifying(true)
  }

  // 第二阶段：确认密码后正式发送
  const handleFinalSend = async () => {
    const privateKey = decryptData(currentAccount.encryptedPrivateKey, password)
    if (!privateKey) return alert("密码错误")
    
    setIsVerifying(false)
    setLoading(true)
    let currentHash = '' 

    try {
      const account = getAccountFromPrivKey(privateKey as `0x${string}`)
      const client = getPublicClient(currentNetwork.rpcUrl)
      const walletClient = getWalletClient(account, currentNetwork.rpcUrl)
      let currentChain: any = (currentNetwork.id === 31337) ? hardhatChain : 
                           (currentNetwork.id === 11155111) ? sepolia : mainnet

      let hash: `0x${string}`
      if (tokenAddress && isAddress(tokenAddress)) {
        hash = await walletClient.writeContract({
          address: tokenAddress, abi: erc20Abi, functionName: 'transfer',
          args: [to.trim() as `0x${string}`, parseEther(amount)],
          account, chain: currentChain,
        })
      } else {
        hash = await walletClient.sendTransaction({
          account, to: to.trim() as `0x${string}`,
          value: parseEther(amount), chain: currentChain,
        })
      }

      currentHash = hash
      setTxHash(hash)
      addTransaction({
        hash, from: currentAccount.address.toLowerCase(), to: to.trim().toLowerCase(),
        amount: `${amount} ${tokenSymbol}`, timestamp: Date.now(), status: 'pending', chainId: currentNetwork.id
      })

      await client.waitForTransactionReceipt({ hash })
      updateTransactionStatus(hash, 'success')
      alert(`🎉 交易成功！`)
      setTo(''); setAmount(''); setPassword('')
    } catch (error: any) {
      if (currentHash) updateTransactionStatus(currentHash, 'failed')
      alert('Failed: ' + (error.shortMessage || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      {/* 1. 主表单：验证时增加模糊效果 */}
      <div className={`p-6 border-2 border-gray-100 rounded-[2rem] bg-white shadow-xl shadow-gray-100/50 transition-all duration-300 ${isVerifying ? 'blur-md scale-[0.98] pointer-events-none' : ''}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-black text-gray-800 flex items-center gap-2 italic text-sm">
            <span className="p-2 bg-orange-100 rounded-lg text-lg">🚀</span> SEND
          </h2>
          <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full tracking-tighter">
            {currentNetwork.name.toUpperCase()}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">Token Address (Optional)</label>
            <input className="w-full mt-1 p-3 border-2 border-gray-50 rounded-xl text-[10px] font-mono bg-gray-50/50 outline-none focus:border-orange-300" placeholder="留空则转原生代币" value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} />
          </div>

          <div>
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">Recipient</label>
            <input className="w-full mt-1 p-3 border-2 border-gray-50 rounded-xl text-[10px] font-mono bg-gray-50/50 outline-none focus:border-blue-500" placeholder="0x..." value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          
          <div className="relative">
            <label className="text-[9px] font-bold text-blue-500 uppercase tracking-[0.2em] ml-2">Available: {Number(currentBalance).toFixed(4)} {tokenSymbol}</label>
            <div className="relative mt-1">
              <input className="w-full p-4 border-2 border-gray-50 rounded-2xl text-sm font-black bg-gray-50/50 outline-none focus:border-blue-500 pr-16" placeholder="0.00" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <button onClick={handleMax} className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-[9px] font-black rounded-xl">MAX</button>
            </div>
          </div>

          <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-gray-400 uppercase">Est. Gas Fee</span>
              <span className="text-[10px] font-mono font-bold text-gray-500">{tokenAddress ? 'ERC20' : 'Standard'}</span>
            </div>
            <span className="text-[11px] font-mono font-black text-slate-700">{parseFloat(estimateFee).toFixed(8)} {currentNetwork.symbol}</span>
          </div>
          
          <button onClick={handlePreSend} disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs hover:bg-black disabled:bg-gray-100 transition-all shadow-lg uppercase tracking-widest">
            {loading ? 'Processing...' : `Send ${tokenSymbol}`}
          </button>
        </div>

        {txHash && (
          <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
            <p className="text-[8px] font-bold text-blue-600 uppercase mb-1">Tx Hash</p>
            <p className="text-[9px] font-mono text-blue-800 break-all">{txHash}</p>
          </div>
        )}
      </div>

      {/* 2. 覆盖式密码确认面板 */}
      {isVerifying && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-white/40 backdrop-blur-sm rounded-[2rem] animate-in fade-in zoom-in">
          <div className="w-full bg-white border-2 border-gray-100 shadow-2xl rounded-[2.5rem] p-8 space-y-5">
            <div className="text-center">
              <h3 className="font-black text-gray-800 italic">确认交易</h3>
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">正在向 {to.slice(0, 8)}... 发送</p>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入确认密码"
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-sm transition-all"
                autoFocus
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setIsVerifying(false)} className="flex-1 py-4 font-bold text-gray-400 text-xs uppercase tracking-widest hover:text-gray-600">取消</button>
              <button onClick={handleFinalSend} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100">确认发送</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}