'use client'
import { useState } from 'react'
import { useWalletStore } from '@/store/useWalletStore'

export default function ReceiveModal({ onClose }: { onClose: () => void }) {
  const { accounts, currentAccountIndex, networks } = useWalletStore()
  const [search, setSearch] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const currentAccount = accounts[currentAccountIndex]

  // 过滤搜索结果
  const filteredNetworks = networks.filter(n => 
    n.name.toLowerCase().includes(search.toLowerCase()) || 
    n.symbol.toLowerCase().includes(search.toLowerCase())
  )

  const handleCopy = (address: string, index: number) => {
    navigator.clipboard.writeText(address)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-end md:items-center justify-center">
      <div className="bg-white w-full max-w-md h-[90vh] md:h-[700px] md:rounded-[3rem] rounded-t-[3rem] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* 头部 */}
        <div className="p-6 flex items-center justify-between border-b border-gray-50">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="font-black text-gray-800 italic uppercase tracking-widest text-sm">接收地址</h2>
          <div className="w-10" /> {/* 占位平衡 */}
        </div>

        {/* 搜索栏 */}
        <div className="p-4">
          <div className="relative">
            <input 
              type="text"
              placeholder="搜索网络"
              className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-blue-500 pl-12 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
          </div>
        </div>

        {/* 列表区域 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {filteredNetworks.map((network, index) => (
            <div 
              key={network.id}
              className="group flex items-center justify-between p-4 hover:bg-gray-50 rounded-3xl transition-all border border-transparent hover:border-gray-100"
            >
              <div className="flex items-center gap-4">
                {/* 模拟图标 */}
                <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-[10px] shadow-lg">
                  {network.symbol.slice(0, 2)}
                </div>
                <div>
                  <p className="font-black text-gray-800 text-sm tracking-tight">{network.name}</p>
                  <p className="text-[10px] text-gray-400 font-mono italic">
                    {currentAccount.address.slice(0, 8)}...{currentAccount.address.slice(-6)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleCopy(currentAccount.address, index)}
                  className={`p-2 rounded-xl transition-all ${copiedIndex === index ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:text-blue-500'}`}
                >
                  {copiedIndex === index ? '✓' : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2" />
                    </svg>
                  )}
                </button>
                <button className="p-2 bg-gray-100 rounded-xl text-gray-400 hover:text-slate-800 transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m0 11v1m4-12h1m-1 12h1M4 8h1m11 0h1M4 12h1m11 0h1M4 16h1m11 0h1m-11 4h1m11 0h1M4 6h1m11 0h1" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}