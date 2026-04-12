'use client'
import { useState } from 'react'
import { useWalletStore } from '@/store/useWalletStore'

export default function AccountManager() {
  const { accounts, setCurrentAccountIndex } = useWalletStore()
  const [activeMenu, setActiveMenu] = useState<number | null>(null)

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 搜索栏 */}
      <div className="p-4">
        <input 
          className="w-full p-3 bg-gray-50 rounded-2xl text-xs outline-none border border-transparent focus:border-blue-500"
          placeholder="搜索您的账户"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {/* 钱包分组示例 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Wallet 1</span>
            <button className="text-gray-400 rotate-90">...</button>
          </div>

          <div className="space-y-2">
            {accounts.map((acc, index) => (
              <div 
                key={index}
                onClick={() => setCurrentAccountIndex(index)}
                className="group relative flex items-center justify-between p-4 rounded-2xl hover:bg-blue-50/50 cursor-pointer transition-all border border-transparent hover:border-blue-100"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm`}>
                    {acc.address.slice(2, 4).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Account {index}</p>
                    <p className="text-[10px] text-gray-400 font-mono italic">{acc.address.slice(0, 6)}...{acc.address.slice(-4)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-gray-600">US$0.00</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveMenu(index === activeMenu ? null : index) }}
                    className="p-1 hover:bg-white rounded-lg transition-colors"
                  >
                    ⋮
                  </button>
                </div>

                {/* 操作菜单 (弹出层) */}
                {activeMenu === index && (
                  <div className="absolute right-10 top-10 z-50 w-40 bg-white shadow-2xl rounded-2xl border border-gray-100 py-2 animate-in fade-in zoom-in duration-200">
                    <button className="w-full text-left px-4 py-2 text-[11px] font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                      📋 账户详情
                    </button>
                    <button className="w-full text-left px-4 py-2 text-[11px] font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                      ✏️ 重命名
                    </button>
                    <button className="w-full text-left px-4 py-2 text-[11px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50 mt-1">
                      👁️‍🗨️ 隐藏账户
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {/* 添加账户按钮 */}
            <button className="w-full p-4 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] font-black text-blue-500 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2">
              <span>+</span> 添加账户
            </button>
          </div>
        </div>
      </div>

      {/* 底部固定操作 */}
      <div className="p-4 border-t border-gray-50">
        <button className="w-full py-4 bg-gray-50 text-gray-800 rounded-2xl font-black text-xs hover:bg-gray-100 transition-all uppercase tracking-widest border border-gray-100">
          添加钱包
        </button>
      </div>
    </div>
  )
}