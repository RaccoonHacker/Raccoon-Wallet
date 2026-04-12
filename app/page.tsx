'use client'
import { useState } from 'react'
import { useWalletStore } from '@/store/useWalletStore'
import { createMnemonic, deriveAccount } from '@/lib/account'
import { encryptData } from '@/lib/crypto'

// 导入所有核心组件
import Header from '@/components/wallet/Header'
import BalanceHero from '@/components/wallet/BalanceHero'
import Tabs from '@/components/wallet/Tabs'
import AssetList from '@/components/wallet/AssetList'
import ActivityList from '@/components/wallet/ActivityList'
import Transfer from '@/components/Transfer'
import NetworkModal from '@/components/wallet/NetworkModal'
import AccountModal from '@/components/wallet/AccountModal'
import ReceiveModal from '@/components/wallet/ReceiveModal'

export default function WalletPage() {
  const { accounts, setEncryptedWallet } = useWalletStore()
  
  // 视图控制
  const [view, setView] = useState<'home' | 'send'>('home')
  const [activeTab, setActiveTab] = useState<'assets' | 'activity'>('assets')
  
  // 弹窗控制（增加了 'receive'）
  const [modal, setModal] = useState<'none' | 'network' | 'account' | 'receive'>('none')

  // 初始化（创建钱包）流程相关的状态
  const [setupStep, setSetupStep] = useState<'welcome' | 'set-password'>('welcome')
  const [password, setPassword] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showSetupPwd, setShowSetupPwd] = useState(false)

  // --- 逻辑 1：如果没有账户，渲染初始化界面 ---
  if (accounts.length === 0) {
    const handleCreateWallet = () => {
      if (password.length < 6) return alert("密码至少 6 位")
      if (password !== confirmPwd) return alert("两次密码不一致")

      // 生成助记词并派生第一个账户
      const mnemonic = createMnemonic()
      const firstAccount = deriveAccount(mnemonic, 0)
      
      // 获取私钥并转为 Hex 字符串
      const hdKey = firstAccount.getHdKey()
      const hexPrivKey = `0x${Buffer.from(hdKey.privateKey!).toString('hex')}`

      // 使用用户设置的密码加密数据
      const encryptedMnemonic = encryptData(mnemonic, password)
      const encryptedPrivKey = encryptData(hexPrivKey, password)

      // 存入 Zustand Store
      setEncryptedWallet(encryptedMnemonic, {
        address: firstAccount.address,
        index: 0,
        encryptedPrivateKey: encryptedPrivKey
      })
      
      alert("钱包创建成功！请务必牢记您的密码。")
    }

    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-[3rem] p-10 shadow-2xl text-center space-y-8 animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">🦝</div>
          
          {setupStep === 'welcome' ? (
            <div className="space-y-6">
              <h1 className="text-2xl font-black text-slate-800 italic tracking-tighter">RACCOON</h1>
              <p className="text-gray-400 text-[10px] font-bold leading-relaxed uppercase tracking-[0.2em]">
                欢迎来到你的第一个<br/>去中心化钱包
              </p>
              <button 
                onClick={() => setSetupStep('set-password')}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                创建新钱包
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 text-left">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center mb-6">设置解锁密码</h2>
              
              {/* 密码输入框 - 带明文切换按钮 */}
              <div className="relative">
                <input 
                  type={showSetupPwd ? "text" : "password"}
                  placeholder="输入 6 位以上密码"
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold pr-12 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowSetupPwd(!showSetupPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSetupPwd ? '👁️' : '🙈'}
                </button>
              </div>

              {/* 确认密码输入框 */}
              <div className="relative">
                <input 
                  type={showSetupPwd ? "text" : "password"}
                  placeholder="再次确认密码"
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold pr-12 transition-all"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                />
              </div>

              <p className="text-[9px] text-gray-400 font-medium px-2 py-2 leading-tight italic">
                ⚠️ 此密码用于加密您的本地私钥，RACCOON 无法代为找回，请妥善保管。
              </p>

              <button 
                onClick={handleCreateWallet}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 mt-4 active:scale-95 transition-all"
              >
                完成并生成
              </button>

              <button 
                onClick={() => setSetupStep('welcome')}
                className="w-full py-2 text-gray-300 font-bold text-[10px] uppercase tracking-widest text-center"
              >
                返回
              </button>
            </div>
          )}
        </div>
      </main>
    )
  }

  // --- 逻辑 2：如果有账户，显示主钱包界面 ---
  return (
    <main className="min-h-screen bg-gray-100 flex justify-center py-0 md:py-10">
      <div className="w-full max-w-md bg-white min-h-screen md:min-h-[800px] md:rounded-[3rem] shadow-2xl overflow-hidden relative flex flex-col border-[8px] border-white">
        
        {/* 顶部导航 */}
        <Header 
          onOpenNet={() => setModal('network')} 
          onOpenAcc={() => setModal('account')} 
        />

        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* 首页视图 */}
          {view === 'home' && (
            <div className="flex-1 flex flex-col animate-in fade-in duration-300">
              {/* 核心余额卡片：绑定了发送和接收的点击事件 */}
              <BalanceHero 
                onSendClick={() => setView('send')} 
                onReceiveClick={() => setModal('receive')} 
              />
              
              <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
              
              <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                {activeTab === 'assets' ? <AssetList /> : <ActivityList />}
              </div>
            </div>
          )}

          {/* 发送/转账视图 */}
          {view === 'send' && (
            <div className="flex-1 flex flex-col bg-white animate-in slide-in-from-right duration-300 z-20">
              <div className="p-4 border-b flex items-center gap-4">
                <button onClick={() => setView('home')} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="font-black text-gray-800 tracking-tight italic uppercase text-sm">发送资产</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <Transfer />
              </div>
            </div>
          )}
        </div>

        {/* 底部装饰 */}
        <div className="py-4 text-center">
          <p className="text-[9px] font-black text-gray-200 uppercase tracking-[0.3em] select-none">Raccoon Wallet</p>
        </div>

        {/* --- 全局弹窗层 --- */}
        {modal === 'network' && <NetworkModal onClose={() => setModal('none')} />}
        {modal === 'account' && <AccountModal onClose={() => setModal('none')} />}
        {modal === 'receive' && <ReceiveModal onClose={() => setModal('none')} />}  
      </div>
    </main>
  )
}