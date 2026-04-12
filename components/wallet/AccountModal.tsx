// components/wallet/AccountModal.tsx
'use client'
import { useState } from 'react'
import { useWalletStore } from '@/store/useWalletStore'
import { decryptData } from '@/lib/crypto'

export default function AccountModal({ onClose }: { onClose: () => void }) {
  const { 
    accounts, 
    currentAccountIndex, 
    setCurrentAccountIndex, 
    encryptedMnemonic,
    addAccountFromMnemonic,
    purge 
  } = useWalletStore()
  
  // 状态管理：'list' 为账户列表，'detail' 为查看敏感信息
  const [view, setView] = useState<'list' | 'detail'>('list')
  const [showSensitive, setShowSensitive] = useState<'none' | 'privKey' | 'mnemonic'>('none')
  const [decryptedText, setDecryptedText] = useState('')
  
  // 密码验证相关状态
  const [isVerifying, setIsVerifying] = useState(false)
  const [pendingType, setPendingType] = useState<'privKey' | 'mnemonic' | 'addAccount' | null>(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const currentAccount = accounts[currentAccountIndex]

  // 处理所有需要密码的逻辑
  const handleAuthAction = async () => {
    if (!password) return

    try {
      // 逻辑 A：添加新账户
      if (pendingType === 'addAccount') {
        const success = await addAccountFromMnemonic(password)
        if (success) {
          setIsVerifying(false)
          setPassword('')
          setPendingType(null)
          // 逻辑内已处理切换到新账号，这里直接关闭或保持列表
        } else {
          alert('密码错误，无法派生账户')
        }
        return
      }

      // 逻辑 B：解密查看私钥/助记词
      let result = null
      if (pendingType === 'privKey') {
        result = decryptData(currentAccount.encryptedPrivateKey, password)
      } else if (pendingType === 'mnemonic') {
        result = decryptData(encryptedMnemonic, password)
      }

      if (result) {
        setDecryptedText(result)
        setShowSensitive(pendingType as 'privKey' | 'mnemonic')
        setIsVerifying(false)
        setPassword('')
      } else {
        alert('密码错误')
      }
    } catch (e) {
      alert('验证失败')
    }
  }

  // 重置钱包逻辑
  const handlePurgeWallet = () => {
    if (confirm("确定要添加新钱包吗？这会清空当前所有账户数据，请确保已备份助记词！")) {
      purge()
      window.location.reload()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* 头部 */}
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
          <h3 className="font-black text-gray-800 italic uppercase tracking-widest text-sm">
            {isVerifying ? '安全验证' : (view === 'list' ? '选择账户' : '账户详情')}
          </h3>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {isVerifying ? (
            /* --- 统一验证界面 --- */
            <div className="p-8 space-y-6 animate-in fade-in">
              <div className="text-center space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">需要解锁密码</p>
                <p className="text-xs text-gray-500">
                  {pendingType === 'addAccount' ? '验证密码以派生新账户地址' : '验证密码以查看敏感信息'}
                </p>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-center"
                  placeholder="输入您的密码"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAuthAction()}
                />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setIsVerifying(false); setPendingType(null); }} className="flex-1 py-4 font-bold text-gray-400 text-xs">取消</button>
                <button onClick={handleAuthAction} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-blue-100">确认验证</button>
              </div>
            </div>
          ) : view === 'list' ? (
            /* --- 视图 1：账户列表 --- */
            <div className="p-4 space-y-6">
              <div className="relative">
                <input 
                  className="w-full p-3 bg-gray-50 rounded-2xl text-[11px] font-bold outline-none border border-transparent focus:border-blue-500 pl-10"
                  placeholder="搜索您的账户"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3 px-2">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">My Accounts</span>
                </div>

                <div className="space-y-2">
                  {accounts.map((acc, index) => (
                    <div 
                      key={index}
                      onClick={() => {
                        setCurrentAccountIndex(index)
                        onClose()
                      }}
                      className={`group relative flex items-center justify-between p-4 rounded-3xl cursor-pointer transition-all border-2 
                        ${currentAccountIndex === index ? 'border-blue-500 bg-blue-50/30' : 'border-transparent bg-gray-50/50 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-600 flex items-center justify-center text-white font-black text-[10px] shadow-sm uppercase">
                          {acc.address.slice(2, 4)}
                        </div>
                        <div>
                          <p className="font-black text-gray-800 text-xs">Account {acc.index}</p>
                          <p className="text-[10px] text-gray-400 font-mono italic">{acc.address.slice(0, 6)}...{acc.address.slice(-4)}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentAccountIndex(index) // 先切换到该账户
                          setView('detail')
                        }}
                        className="p-2 hover:bg-white rounded-xl text-gray-400 transition-colors"
                      >
                        <span className="text-xs">⚙️</span>
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => { setPendingType('addAccount'); setIsVerifying(true); }}
                    className="w-full p-4 border-2 border-dashed border-gray-100 rounded-3xl text-[10px] font-black text-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
                  >
                    + 添加新账户 (Derive)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* --- 视图 2：账户详情 --- */
            <div className="p-8 space-y-6">
              <button onClick={() => { setView('list'); setShowSensitive('none'); }} className="text-[10px] font-bold text-blue-500 flex items-center gap-1">
                ← 返回账户列表
              </button>
              
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-400 to-yellow-200 border-4 border-white shadow-lg" />
                <div className="text-center">
                   <p className="font-black text-gray-800">Account {currentAccount?.index}</p>
                   <p className="text-[9px] font-mono text-gray-400 break-all px-4">{currentAccount?.address}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {showSensitive === 'none' ? (
                  <>
                    <button onClick={() => { setPendingType('privKey'); setIsVerifying(true); }} className="w-full py-4 border-2 border-gray-100 rounded-2xl text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-all">🔑 导出私钥</button>
                    <button onClick={() => { setPendingType('mnemonic'); setIsVerifying(true); }} className="w-full py-4 border-2 border-gray-100 rounded-2xl text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-all">📜 查看助记词</button>
                  </>
                ) : (
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-100 animate-in slide-in-from-top-2">
                    <p className="text-[10px] font-black text-red-500 uppercase mb-2 tracking-tighter">⚠️ 请勿泄露此信息</p>
                    <p className="text-xs font-mono font-bold text-red-800 break-all bg-white/80 p-3 rounded-xl border border-red-100 select-all">
                      {decryptedText}
                    </p>
                    <button onClick={() => { setShowSensitive('none'); setDecryptedText(''); }} className="mt-4 w-full py-2 bg-red-100 text-red-700 rounded-xl text-[10px] font-bold hover:bg-red-200">收起敏感信息</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 底部固定：添加新钱包 */}
        {view === 'list' && !isVerifying && (
          <div className="p-6 border-t border-gray-50 bg-gray-50/30">
            <button 
              onClick={handlePurgeWallet}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all"
            >
              添加/导入新钱包
            </button>
          </div>
        )}
      </div>
    </div>
  )
}