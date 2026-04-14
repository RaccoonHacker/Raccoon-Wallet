# Raccoon Wallet
A secure, multi-chain, user-friendly cryptocurrency wallet built for modern Web3.
![](/picture/home.png)
## ✨ 核心功能
1. **多账号管理**
   - 支持 助记词 / 私钥 创建/导入钱包
   - 一个钱包生成无限多链账号
   - 查看助记词/私钥必须验证钱包密码
   - 多账号地址展示与切换

2. **多链支持**
   - 内置Ethereum、sepolia
   - 支持**自定义链导入**（链名称、RPC 节点、代币符号、链 ID）
   - 内置 Hardhat 本地测试链快捷接入

3. **转账功能**
   - 选择链 → 选择账号 → 输入接收地址 + 金额 → 签名发送
   - 本地签名，私钥不上传

4. **收款功能**
   - 一键展示当前账号对应链的收款地址
   - 支持复制地址 

5. **Swap 功能**
   - 一键跳转 Uniswap 官网进行代币兑换

6. **购买功能**
   - 一键跳转 MetaMask 法币购买页面

7. **本地测试链支持**
   - 内置 Hardhat Node 快捷连接
   - 一键切换测试环境，支持本地测试币转账

---

## 🛠️ 技术栈
### 前端
- **Next.js 15+** – React 
- **Tailwind CSS v4**
- **TypeScript**

### Web3 核心
- **Viem 2.21** 
- **Hardhat 2.28.0**

### 状态管理
- **Zustand** – 轻量级全局状态管理

### 密码学与钱包核心
- **bip39** – 助记词生成/验证（BIP-39）
- **bip32 / ed25519** – HD 钱包分层密钥派生（BIP-32）
- **ethereum-cryptography** – 加密、哈希、签名工具
- **secp256k1** – 椭圆曲线签名算法

## 🔐 技术原理
### 1. 钱包账户体系（HD 钱包）
- 随机生成 12/24 个助记词（BIP-39）
- 助记词 → 种子（512bit）
- 种子 → 主私钥 → 分层派生多账号（BIP-32 / BIP-44）
- 路径：`m/44'/60'/0'/0/index`
- 私钥 → secp256k1 → 公钥 → Keccak256 → 以太坊地址

### 2. 安全机制
- 钱包密码通过 **PBKDF2** 推导加密密钥
- 助记词/私钥使用 **AES-256-GCM** 加密存储
- 查看敏感信息必须二次密码验证
- 交易本地签名，私钥永不触网

### 3. 多链实现原理
- 每条链 = 链 ID + RPC + 符号 + 图标
- 同一 HD 钱包，不同链使用相同私钥派生地址
- 自定义链通过配置项动态注册到 Viem

### 4. 转账交易流程
1. 获取当前链 RPC 节点
2. 获取账号余额
3. 获取交易 Nonce
4. 构建交易对象
5. 私钥签名（离线）
6. 广播交易到区块链节点
7. 监听交易回执

### 5. Hardhat 本地测试链
- 本地运行 `hardhat node` 提供 RPC：`http://127.0.0.1:8545`
- 链 ID：31337
- 内置 20 个测试账号 + 测试 ETH
- 钱包一键连接本地节点进行测试

### 6. Swap / 购买
- 直接跳转官方链接：
  - Uniswap：`https://app.uniswap.org`
  - 购买：`https://metamask.io/buy`

---

## 🚀 快速开始
### 1. 安装依赖
```bash
npm install
```
### 2. 启动 Hardhat 本地节点
```bash
npx hardhat node
```
### 3. 启动钱包前端
```bash
npm run dev
```
### 4. 访问
```bash
http://localhost:3000
```

![](/picture/send.png)
![](/picture/receive.png)
![](/picture/network.png)