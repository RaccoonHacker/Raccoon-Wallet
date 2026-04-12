// store/useWalletStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { decryptData, encryptData } from '@/lib/crypto'
import { deriveAccount } from '@/lib/account'

// 1. 定义网络链配置接口
export interface ChainConfig {
  id: number
  name: string
  rpcUrl: string
  symbol: string
  isCustom?: boolean
}

// 2. 定义交易记录接口
export interface TransactionRecord {
  hash: string
  from: string
  to: string
  amount: string 
  timestamp: number
  status: 'pending' | 'success' | 'failed'
  chainId: number
}

// 3. 定义代币接口
export interface TokenConfig {
  address: string
  symbol: string
  decimals: number
  chainId: number
  name?: string
}

// 4. 定义账户接口
export interface WalletAccount {
  address: string
  index: number
  encryptedPrivateKey: string 
}

// 默认网络列表
const DEFAULT_CHAINS: ChainConfig[] = [
  { id: 31337, name: 'Hardhat Local', rpcUrl: 'http://127.0.0.1:8545', symbol: 'ETH' },
  { id: 1, name: 'Ethereum Mainnet', rpcUrl: 'https://rpc.ankr.com/eth', symbol: 'ETH' },
  { id: 11155111, name: 'Sepolia Testnet', rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com', symbol: 'SEP' },
]

interface WalletState {
  encryptedMnemonic: string
  accounts: WalletAccount[] 
  currentAccountIndex: number 
  isLocked: boolean
  
  // 多链支持
  networks: ChainConfig[]
  activeNetworkId: number
  
  // 交易账本
  transactions: TransactionRecord[]

  // 代币资产状态
  tokens: TokenConfig[]
  
  // --- Actions ---
  setEncryptedWallet: (mnemonic: string, firstAccount: WalletAccount) => void
  addAccount: (account: WalletAccount) => void
  setCurrentAccountIndex: (index: number) => void
  setLocked: (locked: boolean) => void
  
  // 【核心功能】派生新账号 (Account 1, 2, 3...)
  addAccountFromMnemonic: (password: string) => Promise<boolean>
  
  // 网络管理
  switchNetwork: (chainId: number) => void
  addCustomNetwork: (chain: ChainConfig) => void
  removeCustomNetwork: (chainId: number) => void
  
  // 账本管理
  addTransaction: (tx: TransactionRecord) => void
  updateTransactionStatus: (hash: string, status: 'success' | 'failed') => void

  // 代币管理
  addToken: (token: TokenConfig) => void
  removeToken: (address: string, chainId: number) => void
  
  // 【重置功能】添加新钱包
  purge: () => void
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      encryptedMnemonic: '',
      accounts: [],
      currentAccountIndex: 0,
      isLocked: true,
      networks: DEFAULT_CHAINS,
      activeNetworkId: 31337,
      transactions: [],
      tokens: [], 

      setEncryptedWallet: (mnemonic, firstAccount) => set({ 
        encryptedMnemonic: mnemonic, 
        accounts: [firstAccount],
        isLocked: false 
      }),
      
      addAccount: (account) => set((state) => ({ 
        accounts: [...state.accounts, account] 
      })),

      setCurrentAccountIndex: (index) => set({ currentAccountIndex: index }),

      setLocked: (locked) => set({ isLocked: locked }),

      /**
       * 核心逻辑：添加新账号 (派生)
       * 1. 解密助记词
       * 2. 根据当前账号数组长度确定新索引
       * 3. 派生新私钥并使用原密码加密后存储
       */
      addAccountFromMnemonic: async (password: string) => {
        const state = get()
        try {
          const mnemonic = decryptData(state.encryptedMnemonic, password)
          if (!mnemonic) return false

          // 派生下一个索引的账户
          const nextIndex = state.accounts.length
          const viemAccount = deriveAccount(mnemonic, nextIndex)
          
          // 获取私钥并转换为 0x 十六进制
          const hdKey = viemAccount.getHdKey()
          const privateKey = hdKey.privateKey
          if (!privateKey) return false
          const hexPrivKey = `0x${Buffer.from(privateKey).toString('hex')}`

          const newAccount: WalletAccount = {
            address: viemAccount.address,
            index: nextIndex,
            encryptedPrivateKey: encryptData(hexPrivKey, password)
          }

          set((s) => ({
            accounts: [...s.accounts, newAccount],
            currentAccountIndex: nextIndex // 自动切到新账号
          }))
          return true
        } catch (e) {
          console.error("Failed to derive account:", e)
          return false
        }
      },

      // --- 网络管理 ---
      switchNetwork: (chainId) => set({ activeNetworkId: chainId }),
      addCustomNetwork: (chain) => set((state) => ({ 
        networks: [...state.networks, { ...chain, isCustom: true }] 
      })),
      removeCustomNetwork: (chainId) => set((state) => ({
        networks: state.networks.filter(n => n.id !== chainId),
        activeNetworkId: state.activeNetworkId === chainId ? 31337 : state.activeNetworkId
      })),

      // --- 账本管理 ---
      addTransaction: (tx) => set((state) => ({
        transactions: [tx, ...state.transactions].slice(0, 50)
      })),

      updateTransactionStatus: (hash, status) => set((state) => ({
        transactions: state.transactions.map((tx) => 
          tx.hash === hash ? { ...tx, status } : tx
        )
      })),

      // --- 代币管理 ---
      addToken: (token) => set((state) => {
        const exists = state.tokens.some(
          t => t.address.toLowerCase() === token.address.toLowerCase() && t.chainId === token.chainId
        )
        if (exists) return state
        return { tokens: [...state.tokens, token] }
      }),

      removeToken: (address, chainId) => set((state) => ({
        tokens: state.tokens.filter(
          t => !(t.address.toLowerCase() === address.toLowerCase() && t.chainId === chainId)
        )
      })),

      /**
       * 清空状态：用于“添加钱包”功能重新导入
       */
      purge: () => set({ 
        encryptedMnemonic: '', 
        accounts: [], 
        currentAccountIndex: 0,
        isLocked: true,
        networks: DEFAULT_CHAINS,
        activeNetworkId: 31337,
        transactions: [],
        tokens: [] 
      }),
    }),
    {
      name: 'raccoon-wallet-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        encryptedMnemonic: state.encryptedMnemonic,
        accounts: state.accounts,
        currentAccountIndex: state.currentAccountIndex,
        networks: state.networks,
        activeNetworkId: state.activeNetworkId,
        transactions: state.transactions,
        tokens: state.tokens,
      }),
    }
  )
)