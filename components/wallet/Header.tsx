'use client'
import { useState } from 'react'
import { useWalletStore } from '@/store/useWalletStore'

interface HeaderProps {
  onOpenNet: () => void
  onOpenAcc: () => void
}

export default function Header({ onOpenNet, onOpenAcc }: HeaderProps) {
  const { accounts, currentAccountIndex, networks, activeNetworkId } = useWalletStore()
  const [copied, setCopied] = useState(false)

  const currentAccount = accounts[currentAccountIndex]
  const currentNetwork = networks.find(n => n.id === activeNetworkId) || networks[0]

  // 复制地址逻辑
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation() // 防止触发父级的 onOpenAcc
    if (!currentAccount?.address) return

    navigator.clipboard.writeText(currentAccount.address)
    setCopied(true)
    
    // 1.5秒后恢复图标
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b border-gray-100 relative z-30">
      {/* 左侧：账户信息与复制 */}
      <div className="flex items-center gap-2">
        {/* 点击头像/名称打开切换菜单 */}
        <div 
          onClick={onOpenAcc}
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-xl transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-yellow-200 border-2 border-white shadow-sm flex-shrink-0" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xs font-black text-gray-800 italic uppercase tracking-tighter">
                Account {currentAccount?.index}
              </span>
              <span className="text-[10px] text-gray-300">▼</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono italic leading-none">
              {currentAccount?.address.slice(0, 6)}...{currentAccount?.address.slice(-4)}
            </span>
          </div>
        </div>

        {/* 复制按钮 */}
        <button 
          onClick={handleCopy}
          className={`ml-1 p-1.5 rounded-lg transition-all active:scale-90 ${
            copied ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-500'
          }`}
          title="复制地址"
        >
          {copied ? (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2" />
            </svg>
          )}
        </button>
      </div>

      {/* 右侧：网络选择 */}
      <button 
        onClick={onOpenNet}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200 hover:border-blue-400 hover:bg-white transition-all group"
      >
        <div className={`w-2 h-2 rounded-full ${currentNetwork.id === 1 ? 'bg-blue-500' : 'bg-green-500'} shadow-sm`} />
        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">
          {currentNetwork.name}
        </span>
      </button>
    </header>
  )
}