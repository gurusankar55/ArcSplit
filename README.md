[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Arc Testnet](https://img.shields.io/badge/Network-Arc%20Testnet-5B5BFF)](https://www.arc.network/)
[![Tests](https://img.shields.io/badge/Tests-14%20passing-brightgreen)](https://github.com/gurusankar55/ArcSplit)
# ArcSplit

### Decentralized USDC Payment Splitting on Arc Testnet

ArcSplit is a lightweight Web3 payment-splitting application that distributes ERC-20 payments across multiple predefined recipients directly through a smart contract.

Built for the **Arc Testnet**, ArcSplit provides deterministic on-chain settlement, configurable recipient shares, ERC-20 allowance-based payments, and a simple wallet-connected frontend.

---

## ✨ Overview

ArcSplit removes the need for an intermediary when distributing a single token payment between multiple recipients.

A payer approves the ArcSplit contract to spend a specified ERC-20 amount. The contract then calculates each recipient's allocation and transfers the funds directly to their wallets.

### Example

For a **1 mUSDC** payment configured with a 70/30 split:

```text
Payer
  │
  │ 1,000,000 mUSDC
  ▼
ArcSplit
  │
  ├── 700,000 mUSDC → Recipient 1 (70%)
  │
  └── 300,000 mUSDC → Recipient 2 (30%)
```

The contract does not retain the payment balance after a successful split.

---

## 🚀 Key Features

* ERC-20 payment splitting
* Configurable recipient wallets
* Basis-point share configuration
* Exact 100% share validation
* Automatic remainder handling
* ERC-20 allowance-based payment flow
* Reentrancy protection
* Atomic transaction behavior
* Payment split event emission
* Wallet-connected Web3 frontend
* Arc Testnet deployment
* Automated Solidity test coverage
* On-chain transfer event verification

---

## 🏗️ Architecture

```text
┌──────────────────────────┐
│       Web Frontend       │
│     Next.js + Viem       │
└────────────┬─────────────┘
             │
             │ Wallet transaction
             ▼
┌──────────────────────────┐
│       Arc Testnet        │
│                          │
│       ArcSplit.sol       │
│                          │
│  ┌────────────────────┐  │
│  │ Recipient Config   │  │
│  │ 70% / 30% example  │  │
│  └────────────────────┘  │
│                          │
└────────────┬─────────────┘
             │
             │ ERC-20 transferFrom
             ▼
      ┌───────────────┐
      │   Recipients  │
      ├───────────────┤
      │     70%       │
      │     30%       │
      └───────────────┘
```

---

## 🔐 Smart Contract Design

The core contract is `ArcSplit.sol`.

### Recipient configuration

Recipients are stored as wallet/share pairs:

```solidity
struct Recipient {
    address wallet;
    uint256 share;
}
```

Shares are represented using basis points:

```text
10,000 = 100%
7,000  = 70%
3,000  = 30%
```

The constructor validates:

* Recipient list is not empty
* Recipient arrays have matching lengths
* Recipient addresses are not zero addresses
* Individual shares are greater than zero
* Total shares equal exactly 10,000

---

## 💳 Payment Flow

### 1. Connect Wallet

The user connects a compatible Web3 wallet to Arc Testnet.

### 2. Approve Token

The payer approves the ArcSplit contract to spend the required ERC-20 amount.

### 3. Execute Split

The frontend calls:

```solidity
splitPayment(token, amount)
```

### 4. Direct Settlement

The contract uses:

```solidity
transferFrom()
```

to send each recipient their configured allocation.

### 5. Event

A `PaymentSplit` event is emitted after successful settlement.

---

## 🧮 Remainder Handling

Integer division can create a small remainder when splitting token amounts.

ArcSplit handles this deterministically by assigning the remaining amount to the final recipient.

For example:

```text
Recipient 1 → calculated share
Recipient 2 → calculated share
Final recipient → remaining amount
```

This ensures the complete payment amount is distributed without leaving dust in the contract.

---

## 🛡️ Security Considerations

ArcSplit includes several defensive mechanisms:

### Reentrancy Protection

The payment function uses OpenZeppelin's `ReentrancyGuard`.

```solidity
function splitPayment(
    address token,
    uint256 amount
) external nonReentrant
```

### Input Validation

The contract rejects:

* Zero token addresses
* Zero payment amounts
* Zero recipient addresses
* Zero recipient shares
* Invalid recipient/share array lengths
* Share configurations that do not equal 100%

### Atomic Settlement

If a recipient transfer fails, the transaction reverts instead of leaving a partially completed distribution.

---

## 🧪 Testing

ArcSplit includes an automated Hardhat test suite covering the core contract behavior.

Current test suite:

```text
14 passing
```

Coverage includes:

* Valid 70/30 configuration
* Invalid share totals
* Recipient retrieval
* ERC-20 payment splitting
* Zero payment rejection
* Zero token address rejection
* Missing approval rejection
* Zero recipient rejection
* Zero share rejection
* Single-recipient 100% configuration
* Failed recipient transfer rollback
* `PaymentSplit` event validation
* Three-recipient distribution
* Rounding/remainder handling

---

## ✅ On-Chain Test Result

A live Arc Testnet transaction was used to verify the 70/30 distribution.

For a 1,000,000-unit mUSDC payment:

```text
Recipient 1: 700,000 mUSDC
Recipient 2: 300,000 mUSDC
Total:       1,000,000 mUSDC
```

The transaction receipt returned:

```text
status: success
```

The transaction also produced the expected ERC-20 `Transfer` events.

---

## 🌐 Deployment

### Arc Testnet

**Network**

```text
Arc Testnet
Chain ID: 5042002
```

### ArcSplit

```text
0x3efd9bbe0462a0ecfc6730ea0948ad8ff5d81315
```

### MockUSDC

```text
0xb7d54b444a0601325e6c606c3d6b9897002c25bf
```

The deployed contracts used for testing are verified on the Arc Testnet explorer.

---

## 🖥️ Frontend

The frontend is built with:

* Next.js
* TypeScript
* Viem
* CSS
* Web3 wallet integration

The interface supports:

1. Wallet connection
2. Arc Testnet network switching
3. mUSDC approval
4. Payment amount entry
5. Split payment execution
6. Transaction hash display
7. Transaction confirmation status

---

## 📁 Project Structure

```text
ArcSplit/
├── contracts/
│   ├── ArcSplit.sol
│   ├── MockUSDC.sol
│   └── MockFailToken.sol
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   └── layout.tsx
│   │   ├── abi.ts
│   │   └── config.ts
│   └── package.json
│
├── scripts/
│   ├── create-recipients.ts
│   ├── deploy.ts
│   ├── deploy-mockusdc.ts
│   ├── deploy-test-split.ts
│   └── test-split.ts
│
├── test/
│   └── ArcSplit.ts
│
├── hardhat.config.ts
├── package.json
└── recipients.json
```

---

## ⚙️ Local Development

### Prerequisites

* Node.js
* npm
* Git
* A compatible Web3 wallet
* Arc Testnet access

### Install dependencies

```bash
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

---

## 🧪 Run Tests

From the project root:

```bash
npx hardhat test
```

Expected result:

```text
14 passing
```

---

## 🏗️ Build Frontend

```bash
cd frontend
npm run build
```

Run the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

## 🔗 Testnet Configuration

The frontend is configured for Arc Testnet:

```text
Chain ID: 5042002
```

The deployed ArcSplit and MockUSDC addresses are stored in:

```text
frontend/src/config.ts
```

---

## 🔭 Future Improvements

Potential future iterations include:

* Dynamic recipient management
* Multiple token configurations
* Payment history
* Recipient configuration UI
* Transaction history dashboard
* Production ERC-20 integrations
* Improved wallet compatibility
* Mainnet deployment
* Expanded security testing
* Gas optimization

---

## ⚠️ Testnet Notice

The contracts and tokens documented in this repository are intended for development and testing on Arc Testnet.

`MockUSDC` is a test token and should not be treated as real USDC or real-world funds.

---

## 🧰 Tech Stack

| Layer              | Technology   |
| ------------------ | ------------ |
| Smart Contract     | Solidity     |
| Contract Framework | Hardhat      |
| Contract Library   | OpenZeppelin |
| Blockchain         | Arc Testnet  |
| Frontend           | Next.js      |
| Language           | TypeScript   |
| Web3 Client        | Viem         |
| Testing            | Hardhat      |
| Version Control    | Git / GitHub |

---

## 📄 License

This project is released under the MIT License.

---

## 👤 Author

**Gurusankar**

GitHub:
https://github.com/gurusankar55

---

## ⭐ Project Status

```text
Smart Contract       ✅
Automated Tests      ✅ 14 passing
Testnet Deployment   ✅
Contract Verification ✅
Frontend             ✅
Wallet Integration   ✅
On-chain Split Test  ✅
GitHub Repository    ✅
```

**ArcSplit — simple, transparent, and programmable payment distribution on Arc Testnet.**
