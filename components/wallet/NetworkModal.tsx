// components/wallet/NetworkModal.tsx
'use client'
import { useState } from 'react'
import { useWalletStore, ChainConfig } from '@/store/useWalletStore'

export default function NetworkModal({ onClose }: { onClose: () => void }) {
  const { networks, activeNetworkId, switchNetwork, addCustomNetwork, removeCustomNetwork } = useWalletStore()
  const [view, setView] = useState<'list' | 'add'>('list')
  
  // 自定义网络表单状态
  const [form, setForm] = useState({ name: '', rpc: '', chainId: '', symbol: '' })

  const handleAdd = () => {
    if (!form.name || !form.rpc || !form.chainId) return alert('请填全信息')
    addCustomNetwork({
      id: Number(form.chainId),
      name: form.name,
      rpcUrl: form.rpc,
      symbol: form.symbol || 'ETH',
      isCustom: true
    })
    setView('list')
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-black text-gray-800 tracking-tight">
            {view === 'list' ? '选择网络' : '添加自定义网络'}
          </h3>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {view === 'list' ? (
            <div className="space-y-2">
              {networks.map((net) => (
                <div key={net.id} className="flex items-center gap-2 group">
                  <button 
                    onClick={() => { switchNetwork(net.id); onClose(); }}
                    className={`flex-1 flex items-center gap-3 p-4 rounded-2xl transition-all border-2 ${
                      activeNetworkId === net.id 
                      ? 'border-blue-500 bg-blue-50/50' 
                      : 'border-transparent bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${activeNetworkId === net.id ? 'bg-blue-500 shadow-[0_0_8px_blue]' : 'bg-gray-300'}`} />
                    <span className={`text-sm font-bold ${activeNetworkId === net.id ? 'text-blue-700' : 'text-gray-600'}`}>{net.name}</span>
                  </button>
                  {net.isCustom && (
                    <button onClick={() => removeCustomNetwork(net.id)} className="p-2 text-gray-300 hover:text-red-500 italic text-[10px] font-bold">删除</button>
                  )}
                </div>
              ))}
              <button 
                onClick={() => setView('add')}
                className="w-full p-4 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-bold text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-all"
              >
                + 添加自定义网络
              </button>
            </div>
          ) : (
            <div className="space-y-4 p-2">
              <input placeholder="网络名称" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-blue-100 font-bold text-sm" onChange={e => setForm({...form, name: e.target.value})} />
              <input placeholder="RPC URL" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-blue-100 font-mono text-xs" onChange={e => setForm({...form, rpc: e.target.value})} />
              <input placeholder="链 ID" type="number" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-blue-100 font-bold text-sm" onChange={e => setForm({...form, chainId: e.target.value})} />
              <input placeholder="货币符号 (如 ETH)" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-blue-100 font-bold text-sm" onChange={e => setForm({...form, symbol: e.target.value})} />
              <div className="flex gap-2 pt-4">
                <button onClick={() => setView('list')} className="flex-1 py-4 font-bold text-gray-400">取消</button>
                <button onClick={handleAdd} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200">保存网络</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}