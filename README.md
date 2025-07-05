# 🧠 SkillBridge – Learn, Earn & Certify on Web3

![SkillBridge Logo](https://raw.githubusercontent.com/ketandayke/skillbridgedapp/main/public/skillbridgedapp-logo.jpg)

> SkillBridge is a decentralized learning platform that enables students to earn tokens, enroll in Web3-powered courses, get instant AI-powered help, and mint verifiable NFT certificates upon completion. Built on blockchain and IPFS, SkillBridge redefines ownership, trust, and motivation in online education.

---

## 🔎 Real Problem We Solve (Personal Story)

*"I once bought a course on a Web2 platform like Udemy, completed it, and downloaded the certificate. Later, while applying for a blockchain internship, I submitted this certificate. But the recruiter asked me, 'Can you prove this is real?' That hit me. Anyone can fake a PDF. There's no public proof or ownership."*

**Web2 Certificate Issues:**

* Can be easily edited/faked (e.g., in Photoshop)
* No public verification mechanism
* No ownership or on-chain record

**We built SkillBridge to fix this.**

**Web3 NFT Certificates:**

* Minted on-chain to your wallet
* Publicly verifiable
* Tamper-proof and immutable

We also solved another pain point:

> "During online courses, whenever I had doubts, I commented under the video. Often, no one responded or it took days. It felt disconnected."

**So we added:**

* 🧠 **AI-powered chatbots per course** trained on that course's content
* ⏱ Instant doubt solving
* 📊 No waiting for instructors

---

## ✨ Key Features / USPs

* 🚀 Token-based motivation: Earn tokens by passing entry tests
* 📅 Token-gated course access: Use tokens to unlock premium content
* 🧠 AI tutors per course: Powered by OpenAI + ChromaDB
* 🎓 NFT certificates: Public, tamper-proof, and truly owned by learners
* 📊 IPFS-based storage: Decentralized course data and metadata
* 🔐 Smart contract-based access control

---

## 🌐 Live Demo

* 🌍 Frontend: [https://skillbridgedapp-iucb.vercel.app](https://web-3-ssh.vercel.app/)
* 🛠️ Backend API: [https://skillbridgedapp.onrender.com](https://skillbridgedapp.onrender.com)

---

## ⚙️ Tech Stack

| Layer          | Technologies Used                              |
| -------------- | ---------------------------------------------- |
| **Frontend**   | React, Vite, TailwindCSS, React Router         |
| **Backend**    | Node.js, Express, Multer, Pinata SDK, OpenAI   |
| **AI Layer**   | OpenAI API, ChromaDB vector database           |
| **Blockchain** | Solidity (Hardhat), Ethers.js                  |
| **Storage**    | IPFS via Pinata                                |
| **Contracts**  | ERC-20 (SKL Token), ERC-721 (Certificate NFTs) |
| **Wallet**     | MetaMask                                       |
| **Deploy**     | Vercel (Frontend), Render (Backend)            |

---

## 🚀 Getting Started (Local Setup)

### 📁 Clone the Repository

```bash
git clone https://github.com/ketandayke/skillbridgedapp.git
cd skillbridgedapp
```

### 🏠 Frontend Setup

```bash
cd skillbridge-frontend
npm install
npm run dev
```

Runs at: [http://localhost:5173](http://localhost:5173)

### 🖥️ Backend Setup

```bash
cd backend
npm install
npm run dev
```

Runs at: [http://localhost:5000](http://localhost:5000)

### 📂 Create a `.env` in /backend:

```env
PINATA_API_KEY=your-pinata-key
PINATA_SECRET_KEY=your-pinata-secret
OPENAI_API_KEY=your-openai-key
CHROMA_DB_URL=http://localhost:8000
```

---

## 👉 Smart Contracts

Located in `/contracts`:

* `SkillBridgeToken.sol` — ERC-20 token for platform (SKL)
* `SkillBridgeNFT.sol` — ERC-721 NFT for certificates
* `SkillBridgeMain.sol` — Controls user state, course access, test scores

### 🔧 Compile & Deploy

```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

Update frontend contract addresses in `Web3Context.jsx`

---

## 🧠 AI-Powered Course Chatbot

* Instructor clicks **Ingest Vector** to upload course content
* Learner can instantly chat via **CourseAIChat**
* Uses OpenAI + ChromaDB vector DB for semantic understanding

---

## 📅 NFT Certificate Flow

1. Learner finishes course and passes quiz
2. Result sent to backend
3. Backend:

   * Generates certificate image via `node-html-to-image`
   * Uploads image + metadata to IPFS
   * Mints NFT via ERC-721 smart contract

---

## 🔹 Environment Variables

**Frontend:** No secrets required

**Backend .env:**

```env
PINATA_API_KEY=...
PINATA_SECRET_KEY=...
OPENAI_API_KEY=...
CHROMA_DB_URL=http://localhost:8000
```

---

## 📷 Screenshots

![Home](https://raw.githubusercontent.com/ketandayke/skillbridgedapp/main/public/frontend_home.png)

More coming soon: Course UI, Quiz UI, Certificate Viewer, AI Chat

---

## ✨ Unique Selling Points

* 💼 Learn & Earn: token-based incentives
* 🎓 Verifiable NFT credentials
* 🧠 AI chatbots per course
* 📊 IPFS-powered content
* ⚡ Gas-optimized, modular contracts
* ⚖️ Transparent access logic with Solidity

---

## 💍 Acknowledgements

* [OpenAI](https://openai.com)
* [Pinata IPFS](https://pinata.cloud)
* [ChromaDB](https://www.trychroma.com)
* [Hardhat](https://hardhat.org)
* [Render](https://render.com)
* [Vercel](https://vercel.com)

---

## 📞 Contact Us

| Name        | LinkedIn                                                      | GitHub                                       | Email                                                     |
| ----------- | ------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------- |
| Ketan Dayke | [LinkedIn](https://www.linkedin.com/in/ketan-dayke-kd050703/) | [@ketandayke](https://github.com/ketandayke) | [ketdayke@gmail.com](mailto:ketdayke@gmail.com)           |
| Rahul Soni  | [LinkedIn](https://www.linkedin.com/in/rahul-soni-56b165280/) | [@rahuls2764](https://github.com/rahuls2764) | [sonirahul2764@gmail.com](mailto:sonirahul2764@gmail.com) |

---

## 👏 Thank You!

We believe SkillBridge brings ownership, transparency, and real-world value to online learning. Let's redefine education with Web3!
