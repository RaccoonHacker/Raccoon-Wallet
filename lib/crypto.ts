// lib/crypto.ts
import CryptoJS from 'crypto-js'

/**
 * 加密数据
 * @param data 要加密的字符串（如助记词）
 * @param password 用户设置的解锁密码
 */
export const encryptData = (data: string, password: string): string => {
  return CryptoJS.AES.encrypt(data, password).toString()
}

/**
 * 解密数据
 * @param ciphertext 密文
 * @param password 用户输入的解锁密码
 */
export const decryptData = (ciphertext: string, password: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, password)
    const originalText = bytes.toString(CryptoJS.enc.Utf8)
    if (!originalText) return null // 密码错误会返回空
    return originalText
  } catch (e) {
    return null // 发生异常通常是密码错误
  }
}