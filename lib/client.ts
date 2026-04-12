// lib/client.ts
import { createPublicClient, createWalletClient, http, Account, defineChain } from 'viem'
import { mainnet, localhost } from 'viem/chains'

// 定义 Hardhat 专用的 chain 配置，强制指定 31337
export const hardhatChain = defineChain({
  ...localhost,
  id: 31337,
})

export const getPublicClient = (rpcUrl?: string) => {
  const isLocal = rpcUrl?.includes('127.0.0.1') || rpcUrl?.includes('localhost')
  return createPublicClient({
    chain: isLocal ? hardhatChain : mainnet,
    transport: http(rpcUrl || 'https://cloudflare-eth.com')
  })
}

export const getWalletClient = (account: Account, rpcUrl?: string) => {
  const isLocal = rpcUrl?.includes('127.0.0.1') || rpcUrl?.includes('localhost')
  return createWalletClient({
    account,
    chain: isLocal ? hardhatChain : mainnet,
    transport: http(rpcUrl)
  })
}