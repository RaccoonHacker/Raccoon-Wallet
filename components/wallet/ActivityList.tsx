// components/wallet/ActivityList.tsx
'use client'
import { useWalletStore } from '@/store/useWalletStore'

export default function ActivityList() {
  const { transactions, activeNetworkId } = useWalletStore()
  
  const filteredTxs = transactions.filter(tx => tx.chainId === activeNetworkId)

  if (filteredTxs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-300">
        <span className="text-4xl mb-4">📭</span>
        <p className="text-xs font-bold uppercase tracking-widest">暂无活动记录</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {filteredTxs.map((tx) => (
        <div key={tx.hash} className="flex items-center justify-between p-5 hover:bg-gray-50 border-b border-gray-50">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
              tx.status === 'success' ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'
            }`}>
              {tx.status === 'success' ? '↗' : '⏳'}
            </div>
            <div>
              <p className="font-black text-sm text-gray-800">发送</p>
              <p className="text-[10px] font-bold text-gray-400">
                {new Date(tx.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-black text-sm text-gray-900">-{tx.amount}</p>
            <p className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-block ${
              tx.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
            }`}>
              {tx.status}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}