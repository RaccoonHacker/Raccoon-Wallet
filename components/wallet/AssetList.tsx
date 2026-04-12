// components/wallet/AssetList.tsx
'use client'
import { useWalletStore } from '@/store/useWalletStore'
import { useTokenBalances } from '@/hooks/useTokenBalances' // 假设你已经创建了这个 hook
import { useEffect, useState } from 'react'
import { getPublicClient } from '@/lib/client'
import { formatEther } from 'viem'

export default function AssetList() {
  const { tokens, activeNetworkId, accounts, currentAccountIndex, networks } = useWalletStore()
  const { balances: tokenBalances } = useTokenBalances()
  const [nativeBalance, setNativeBalance] = useState('0.00')

  const currentAccount = accounts[currentAccountIndex]
  const currentNetwork = networks.find(n => n.id === activeNetworkId) || networks[0]

  useEffect(() => {
    const fetchNative = async () => {
      if (!currentAccount) return
      const client = getPublicClient(currentNetwork.rpcUrl)
      const b = await client.getBalance({ address: currentAccount.address as `0x${string}` })
      setNativeBalance(formatEther(b))
    }
    fetchNative()
  }, [currentAccount, activeNetworkId])

  const currentChainTokens = tokens.filter(t => t.chainId === activeNetworkId)

  return (
    <div className="flex flex-col">
      {/* 1. 原生代币 */}
      <div className="flex items-center justify-between p-6 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black">
            {currentNetwork.symbol[0]}
          </div>
          <div>
            <p className="font-black text-gray-800">{currentNetwork.name}</p>
            <p className="text-[10px] font-bold text-green-500">+2.27% (模拟)</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-black text-gray-900">{Number(nativeBalance).toFixed(4)} {currentNetwork.symbol}</p>
          <p className="text-[10px] font-bold text-gray-400">≈ $0.00</p>
        </div>
      </div>

      {/* 2. ERC20 代币列表 */}
      {currentChainTokens.map(token => (
        <div key={token.address} className="flex items-center justify-between p-6 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-black text-xs">
              {token.symbol[0]}
            </div>
            <div>
              <p className="font-black text-gray-800">{token.symbol}</p>
              <p className="text-[10px] font-bold text-gray-400">{token.name || 'Token'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-black text-gray-900">
              {Number(tokenBalances[token.address] || 0).toFixed(2)} {token.symbol}
            </p>
          </div>
        </div>
      ))}

      <button className="py-8 text-blue-600 font-black text-xs uppercase tracking-widest hover:text-blue-800">
        + 导入代币
      </button>
    </div>
  )
}