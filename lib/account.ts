// lib/account.ts
import { generateMnemonic, mnemonicToAccount, privateKeyToAccount } from 'viem/accounts'
// 注意这里：导出成员是 wordlist (单数)
import { wordlist } from 'ethereum-cryptography/bip39/wordlists/english'

/**
 * 生成 12 位标准英文助记词
 */
export const createMnemonic = () => {
  // 传入正确的 wordlist 变量
  return generateMnemonic(wordlist)
}

/**
 * 从助记词导入默认账户
 * 路径默认为: m/44'/60'/0'/0/0
 */
export const importFromMnemonic = (mnemonic: string) => {
  return mnemonicToAccount(mnemonic)
}

/**
 * 从私钥导入账户
 */
export const importFromPrivateKey = (privKey: string) => {
  const formattedKey = privKey.startsWith('0x') ? privKey : `0x${privKey}`
  return privateKeyToAccount(formattedKey as `0x${string}`)
}

/**
 * 从私钥获取 Account 对象的别名方法
 */
export const getAccountFromPrivKey = (privKey: string) => {
  return importFromPrivateKey(privKey)
}

/**
 * 根据助记词和索引派生账户 (核心新增)
 */
export const deriveAccount = (mnemonic: string, index: number = 0) => {
  return mnemonicToAccount(mnemonic, {
    addressIndex: index, // Viem 内部会处理具体的路径计算
  })
}