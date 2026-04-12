// hooks/useTokenBalances.ts
import { useState, useEffect, useCallback } from 'react'
import { useWalletStore } from '@/store/useWalletStore'
import { getPublicClient } from '@/lib/client'
import { erc20Abi } from '@/lib/erc20'
import { formatUnits } from 'viem'

export function useTokenBalances() {
  const { tokens, activeNetworkId, currentAccountIndex, accounts, networks } = useWalletStore()
  const [balances, setBalances] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const currentAccount = accounts[currentAccountIndex]
  const currentNetwork = networks.find(n => n.id === activeNetworkId)

  const fetchBalances = useCallback(async () => {
    // 基础检查：如果没有账户或网络，清空余额
    if (!currentAccount || !currentNetwork) {
      setBalances({})
      return
    }

    setLoading(true)
    try {
      const client = getPublicClient(currentNetwork.rpcUrl)
      const address = currentAccount.address as `0x${string}`
      
      const newBalances: Record<string, string> = {}

      // 1. 获取原生代币余额 (ETH/BNB/etc.)
      try {
        const nativeBal = await client.getBalance({ address })
        // 绝大多数链的原生币都是 18 位
        newBalances['NATIVE'] = formatUnits(nativeBal, 18)
      } catch (e) {
        console.error("Native balance fetch failed", e)
        newBalances['NATIVE'] = '0'
      }

      // 2. 获取当前链配置的 ERC20 代币余额
      const currentChainTokens = tokens.filter(t => t.chainId === activeNetworkId)
      
      if (currentChainTokens.length > 0) {
        const results = await Promise.all(
          currentChainTokens.map(async (token) => {
            try {
              const bal = await client.readContract({
                address: token.address as `0x${string}`,
                abi: erc20Abi,
                functionName: 'balanceOf',
                args: [address],
              })
              return { 
                address: token.address, 
                balance: formatUnits(bal as bigint, token.decimals) 
              }
            } catch (e) {
              return { address: token.address, balance: '0' }
            }
          })
        )

        results.forEach(curr => {
          newBalances[curr.address] = curr.balance
        })
      }

      setBalances(newBalances)
    } catch (err) {
      console.error("Token balance sync failed:", err)
    } finally {
      setLoading(false)
    }
  }, [currentAccount?.address, currentNetwork?.rpcUrl, tokens, activeNetworkId])

  // 监听状态变化并启动轮询
  useEffect(() => {
    // 立即刷新
    fetchBalances()

    // 设置轮询周期 (6秒，兼顾及时性与节点压力)
    const timer = setInterval(fetchBalances, 6000)
    
    return () => {
      clearInterval(timer)
      setLoading(false)
    }
  }, [fetchBalances])

  return { 
    balances, 
    loading, 
    refresh: fetchBalances,
    // 辅助工具：获取特定代币余额
    getFormattedBalance: (tokenAddress: string) => balances[tokenAddress] || '0',
    getNativeBalance: () => balances['NATIVE'] || '0'
  }
}