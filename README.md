# 🌱 AgriTrace

**Farm-to-Table Transparency Platform powered by Cardano Blockchain**

## 🎯 The Problem
Small-scale Ethiopian farmers lose product identity and fair pricing as their goods move through opaque supply chains. Global consumers cannot verify product origins or ethical claims.

## 🛠️ Our Solution
AgriTrace creates **direct, blockchain-verified connections** from farm to consumer. Each product batch gets a unique Cardano Native Asset, with its journey immutably recorded on-chain.

## 🔗 Cardano Integration
- **Native Asset Tokens**: Each product batch has a unique Cardano token representing its digital identity
- **On-Chain Metadata**: Origin, harvest date, and farmer details stored in token metadata
- **Immutable Journey Log**: Every supply chain step recorded as a verifiable Cardano transaction
- **QR Code Verification**: Consumers scan to fetch and verify product history directly from Cardano
- **Anti-Tamper Proof**: Blockchain acts as neutral, third-party witness to prevent record alteration

## ✨ Features
- ✅ Multi-step farm product registration
- ✅ QR code generation & verification
- ✅ Firebase Authentication & Storage
- ✅ Multi-role dashboards (Farmer, Admin, Consumer)
- ✅ Real-time product tracking
- ✅ Image upload & management

## 🚀 Quick Start
```bash
git clone https://github.com/banchiamlakgolla/AgriTrace.git
cd AgriTrace
npm install
npm run dev
```

## 🔧 Environment Setup
Create `.env.local`:
```
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
```

## 📱 Demo Accounts
- **Admin**: admin@agritrace.com | Password123
- **Farmer**: farmer@agritrace.com | Password123
- **Consumer**: consumer@agritrace.com | Password123

## 🏗️ Tech Stack
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Blockchain**: Cardano (Native Assets, Metadata)
- **Deployment**: Vercel/Firebase Hosting

