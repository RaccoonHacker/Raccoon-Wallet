# 🦝 Raccoon Wallet

Raccoon Wallet 是一款采去中心化加密货币钱包。。



## 🚀 核心特性

- **UI 设计**: 基于 Tailwind CSS v4 构建，

- **去中心化资产管理**: 
  - 支持 **ETH** 及本地测试网资产展示。
  - 核心功能包含：**发送 (Send)**、**接收 (Receive)**、**兑换 (Swap)** 及 **购买 (Buy)**。
- **本地化安全存储**: 使用用户设置的密码对助记词及私钥进行本地加密存储，不上传任何私密数据。
- **开发友好**: 集成 **Hardhat Local** 测试环境支持，方便开发者进行合约交互调试。

## 🛠 技术栈

- **前端框架**: Next.js (App Router)
- **样式处理**: Tailwind CSS v4 
- **状态管理**: Zustand
- **加密库**: Viem 2.21
- **测试环境**: Hardhat 2.28.0


## 🧠 技术原理

### 1. 分层确定性钱包 (HD Wallet) 派生
Raccoon Wallet 遵循 BIP-39 标准生成 12 或 24 位助记词。
- 熵源生成: 通过 crypto.getRandomValues 获取高质量随机熵。
- 数据持久化: 敏感信息（私钥、助记词）在加密后存入 localStorage。即使物理设备丢失，没有正确密码也无法解密私钥。
### 2. 本地存储加密方案 (AES-256)
为了平衡便捷性与安全性，我们采用了 AES-GCM 加密算法：
- 密码哈希: 用户设置的 6 位以上密码通过 PBKDF2 进行加盐哈希，生成加密密钥。
- 数据持久化: 敏感信息（私钥、助记词）在加密后存入 localStorage。即使物理设备丢失，没有正确密码也无法解密私钥。

### 3. Web3 通信与 RPC 交互
项目利用 Viem 2.x 作为底层通信库：
- Provider 封装: 封装了标准 JSON-RPC 调用，实现对以太坊网络状态的实时监听。
- 交易签名: 交易在本地环境使用私钥签名后，再通过 RPC 节点广播至区块链，确保私钥永不离网。
## 📦 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/RaccoonHacker/Raccoon-Wallet.git
cd raccoon-wallet
```
### 2. 安装依赖
```bash
npm install
```
### 3. 启动
```bash
npm run dev
```

![home](/picture/home.png)
![send](/picture/send.png)
![receive](/picture/receive.png)
![network](/picture/network.png)
