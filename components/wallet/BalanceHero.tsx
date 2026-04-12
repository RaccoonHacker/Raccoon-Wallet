// components/wallet/BalanceHero.tsx
'use client'
import { useState, useEffect } from 'react'
import { useWalletStore } from '@/store/useWalletStore'
import { getPublicClient } from '@/lib/client'
import { formatEther } from 'viem'

// 定义 Props 接口
interface BalanceHeroProps {
  onSendClick: () => void
  onReceiveClick: () => void
}

export default function BalanceHero({ onSendClick, onReceiveClick }: BalanceHeroProps) {
  const { accounts, currentAccountIndex, networks, activeNetworkId } = useWalletStore()
  const [balance, setBalance] = useState('0.0000')
  
  const currentAccount = accounts[currentAccountIndex]
  const currentNetwork = networks.find(n => n.id === activeNetworkId) || networks[0]

  useEffect(() => {
    const fetchBalance = async () => {
      if (!currentAccount) return
      try {
        const client = getPublicClient(currentNetwork.rpcUrl)
        const b = await client.getBalance({ address: currentAccount.address as `0x${string}` })
        setBalance(formatEther(b))
      } catch (e) {
        console.error("Failed to fetch balance:", e)
      }
    }
    fetchBalance()
    const timer = setInterval(fetchBalance, 10000)
    return () => clearInterval(timer)
  }, [currentAccount, currentNetwork])

  // 处理 Swap 跳转逻辑
  const handleSwapClick = () => {
    const networkMap: Record<number, string> = {
      1: 'ethereum',
      8453: 'base',
      137: 'polygon',
      10: 'optimism',
      42161: 'arbitrum'
    }
    const chain = networkMap[currentNetwork.id] || 'ethereum'
    window.open(`https://app.uniswap.org/swap?chain=${chain}`, '_blank')
  }

  // 处理 Buy 跳转逻辑
  const handleBuyClick = () => {
    // 跳转到 MetaMask 的法币买入聚合页面
    window.open('https://app.metamask.io/buy/build-quote', '_blank')
  }

  return (
    <div className="flex flex-col items-center py-10 bg-white">
      <span className="text-gray-500 text-sm mb-1 uppercase tracking-widest font-bold">Total Balance</span>
      <div className="flex items-baseline gap-2 mb-8">
        <span className="text-5xl font-black text-gray-900 tracking-tighter">
          {Number(balance).toFixed(4)}
        </span>
        <span className="text-xl font-bold text-gray-400">{currentNetwork.symbol}</span>
      </div>

      {/* 操作按钮组 - 严格保持原有风格 */}
      <div className="flex gap-8">
        <ActionButton 
          icon="+" 
          label="Buy" 
          onClick={handleBuyClick} 
        />
        <ActionButton 
          icon="↗" 
          label="Send" 
          onClick={onSendClick} 
          primary 
        />
        <ActionButton 
          icon="↙" 
          label="Receive" 
          onClick={onReceiveClick} 
        />
        <ActionButton 
          icon="⇄" 
          label="Swap" 
          onClick={handleSwapClick} 
        />
      </div>
    </div>
  )
}

function ActionButton({ icon, label, onClick, primary, disabled }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-2 group ${disabled ? 'opacity-30 cursor-not-allowed' : 'active:scale-95'}`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
        primary ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 group-hover:bg-blue-700' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
      }`}>
        {icon}
      </div>
      <span className="text-xs font-bold text-blue-600">{label}</span>
    </button>
  )
}