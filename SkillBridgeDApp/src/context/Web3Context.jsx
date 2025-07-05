// src/context/Web3Context.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import SKILLBRIDGE_ABI from "../abi/SkillBridgeMain.json";
import TOKEN_ABI from "../abi/SkillBridgeToken.json";
import NFT_ABI from "../abi/SkillBridgeNFT.json";
import { uploadProfileDetailsToIPFS } from '../services/IpfsUploadService';
import { fetchTextFromCid } from '../utils/ipfsFetcher'; // adjust path if needed
import axios from 'axios';

// Contract addresses - UPDATE THESE AFTER DEPLOYMENT
const CONTRACT_ADDRESSES = {
  SKILLBRIDGE_TOKEN: "0xd0468487E22A2f10E84cec0dB23711801cfbEA0b", // Replace with deployed token address
  SKILLBRIDGE_NFT: "0x7A1F0F2273365674677C379F48952A683Fa84446",   // Replace with deployed NFT address
  SKILLBRIDGE_MAIN: "0xF6a77300Ac72069b64EF8aFD825245167b07149A"
};
// const CONTRACT_ADDRESSES = {
//   SKILLBRIDGE_TOKEN: "0xa255c9B103A7ad9D69faB4ea6dF6B6A30132fE2e", // Your new addresses
//   SKILLBRIDGE_NFT: "0xdb8fDCD9620FF27E6583c01eA61B6e922A434F73",   
//   SKILLBRIDGE_MAIN: "0xd54173105ff58C0Da717C43191Ef75A2e36f897F"
// };
// const CONTRACT_ADDRESSES = {
//   SKILLBRIDGE_TOKEN: "0xa255c9B103A7ad9D69faB4ea6dF6B6A30132fE2e", // Your new addresses
//   SKILLBRIDGE_NFT: "0xdb8fDCD9620FF27E6583c01eA61B6e922A434F73",   
//   SKILLBRIDGE_MAIN: "0xd54173105ff58C0Da717C43191Ef75A2e36f897F"
// };

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contracts, setContracts] = useState({});
  const [loading, setLoading] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [tokenBalance, setTokenBalance] = useState('0'); // Added token balance state
  const [isConnected, setIsConnected] = useState(false);
  const [contractsLoaded, setContractsLoaded] = useState(false);


  // Initialize Web3
  const initializeWeb3 = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);
        
        const network = await web3Provider.getNetwork();
        setChainId(Number(network.chainId));
        
        return web3Provider;
      } catch (error) {
        console.error('Failed to initialize Web3:', error);
        toast.error('Failed to initialize Web3');
      }
    } else {
      toast.error('Please install MetaMask');
    }
  };

  // Connect wallet
  // Updated sections of Web3Context.jsx

// In connectWallet function - FIXED VERSION
const connectWallet = async () => {
  setLoading(true);
  try {
    if (!provider) {
      await initializeWeb3();
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setIsConnected(true);

      const web3Provider = provider || new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      setSigner(web3Signer);

      // ✅ Wait for contracts to be fully initialized
      try {
        await initializeContracts(web3Signer);
        // ✅ Only set contractsLoaded to true if initialization succeeds
        setContractsLoaded(true);
        console.log("✅ Contracts successfully initialized");
      } catch (contractError) {
        console.error("❌ Contract initialization failed:", contractError);
        setContractsLoaded(false);
        throw new Error("Failed to initialize contracts");
      }

      toast.success('Wallet connected successfully!');
      return accounts[0];
    }
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    setContractsLoaded(false); // ✅ Reset on error
    toast.error('Failed to connect wallet');
  } finally {
    setLoading(false);
  }
};

// Updated initializeContracts function - FIXED VERSION
const initializeContracts = async (web3Signer) => {
  try {
    console.log("🔄 Initializing contracts...");
    
    const skillBridgeContract = new ethers.Contract(
      CONTRACT_ADDRESSES.SKILLBRIDGE_MAIN,
      SKILLBRIDGE_ABI.abi,
      web3Signer
    );

    const tokenContract = new ethers.Contract(
      CONTRACT_ADDRESSES.SKILLBRIDGE_TOKEN,
      TOKEN_ABI.abi,
      web3Signer
    );
    
    const nftContract = new ethers.Contract(
      CONTRACT_ADDRESSES.SKILLBRIDGE_NFT,
      NFT_ABI.abi,
      web3Signer
    );

    // ✅ Test contract connections before setting state
    try {
      await skillBridgeContract.getAddress();
      await tokenContract.getAddress();
      await nftContract.getAddress();
      console.log("✅ All contracts connected successfully");
    } catch (testError) {
      console.error("❌ Contract connection test failed:", testError);
      throw new Error("Contract connection failed");
    }

    setContracts({
      skillBridge: skillBridgeContract,
      token: tokenContract,
      nft: nftContract
    });

    // Fetch initial token balance
    try {
      await refreshTokenBalance(tokenContract, web3Signer.address);
    } catch (balanceError) {
      console.warn("⚠️ Failed to fetch initial balance:", balanceError);
      // Don't throw here, balance can be fetched later
    }

    console.log("✅ Contract initialization completed");
  } catch (error) {
    console.error('❌ Failed to initialize contracts:', error);
    throw error; // Re-throw to be caught by connectWallet
  }
};

// Updated useEffect for auto-connection - FIXED VERSION
useEffect(() => {
  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          console.log("🔄 Auto-connecting wallet...");
          
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(web3Provider);
          setAccount(accounts[0]);
          setIsConnected(true);
          
          const web3Signer = await web3Provider.getSigner();
          setSigner(web3Signer);
          
          const network = await web3Provider.getNetwork();
          setChainId(Number(network.chainId));
          
          // ✅ Initialize contracts and set contractsLoaded appropriately
          try {
            await initializeContracts(web3Signer);
            setContractsLoaded(true);
            console.log("✅ Auto-connection successful");
          } catch (contractError) {
            console.error("❌ Auto-connection contract init failed:", contractError);
            setContractsLoaded(false);
          }
        }
      } catch (error) {
        console.error('Failed to check existing connection:', error);
        setContractsLoaded(false);
      }
    }
  };

  checkConnection();
}, []);

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setContracts({});
    setTokenBalance('0');
    setIsConnected(false);
    toast.success('Wallet disconnected');
  };

  // Switch network (if needed)
  const switchNetwork = async (targetChainId) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error) {
      console.error('Failed to switch network:', error);
      toast.error('Failed to switch network');
    }
  };

  // Refresh token balance and update state
  const refreshTokenBalance = async (tokenContract = null, address = null) => {
    const contract = tokenContract || contracts.token;
    const userAddress = address || account;
    
    if (!contract || !userAddress) {
      setTokenBalance('0');
      return '0';
    }

    try {
      const balance = await contract.balanceOf(userAddress);
      const formattedBalance = ethers.formatEther(balance);
      setTokenBalance(formattedBalance);
      return formattedBalance;
    } catch (error) {
      console.error('Failed to refresh token balance:', error);
      setTokenBalance('0');
      return '0';
    }
  };

  // Get user token balance
  const getTokenBalance = async () => {
    if (!contracts.token || !account) return '0';
    try {
      const balance = await contracts.token.balanceOf(account);
      const formattedBalance = ethers.formatEther(balance);
      setTokenBalance(formattedBalance); // Update state as well
      return formattedBalance;
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return '0';
    }
  };

  // Get user data
  const getUserData = async () => {
    if (!contracts.skillBridge || !account) return null;
    try {
      const userData = await contracts.skillBridge.users(account);
      const enrolledCourses = await contracts.skillBridge.getUserEnrolledCourses(account);
      
      // Since NFTs = completed courses, use coursesCompleted count
      const coursesCompleted = Number(userData[3]);
        // Before retake, add these logs:
        console.log("User balance:", ethers.formatEther(await contracts.token.balanceOf(account)));
        console.log("Contract balance:", ethers.formatEther(await contracts.token.balanceOf(CONTRACT_ADDRESSES.SKILLBRIDGE_MAIN)));
        // console.log("Required fee:", ethers.formatEther(retakeFee));
        // console.log("Expected reward:", ethers.formatEther(reward));

      return {
        userAddress: userData[0],
        testScore: Number(userData[1]),
        tokensEarned: ethers.formatEther(userData[2]),
        coursesCompleted: coursesCompleted,
        hasCompletedTest: userData[4],
        coursesEnrolled: enrolledCourses.map(id => id.toString()),
        nftsEarned: coursesCompleted // Since 1 NFT = 1 completed course
      };
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  };

  // get quiz question for course completed

  const getCourseQuiz = async (courseId) => {
    try {
      const course = await getCourseDetails(courseId);
  
      if (!course || !course.quizCid) {
        throw new Error("Quiz CID not found for this course");
      }
  
      const quizJson = await fetchTextFromCid(course.quizCid);
  
      const parsed = JSON.parse(quizJson);
  
      if (
        !parsed.questions ||
        !Array.isArray(parsed.questions) ||
        parsed.questions.length === 0
      ) {
        throw new Error("Invalid or missing questions in quiz data");
      }
  
      return {
        questions: parsed.questions,
        passingScore: parsed.passingScore || 70,
        timeLimit: parsed.timeLimit || 180, // fallback to 3 mins if not provided
        courseTitle:course.title
      };
    } catch (err) {
      console.error("Error fetching course quiz:", err);
      throw err;
    }
  };

  
  const isContractOwner = async () => {
    if (!contracts.skillBridge || !account) return false;
    try {
      const owner = await contracts.skillBridge.owner();
      console.log("this is owner of skillbrideg",owner);
      return owner.toLowerCase() === account.toLowerCase();
    } catch (error) {
      console.error("Failed to check owner:", error);
      return false;
    }
  }

  // 2. Get contract token balance
const getContractTokenBalance = async () => {
  if (!contracts.token || !CONTRACT_ADDRESSES.SKILLBRIDGE_MAIN) return "0";
  try {
    const balance = await contracts.token.balanceOf(CONTRACT_ADDRESSES.SKILLBRIDGE_MAIN);
    console.log("this is balance",balance);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("Failed to get contract balance:", error);
    return "0";
  }
};
const getEnrolledStudents = async (courseId) => {
  const skillBridgeMainContract=contracts.skillBridge
  if (!skillBridgeMainContract) return [];
  try {
    const students = await skillBridgeMainContract.getEnrolledStudents(courseId);
    return students;
  } catch (err) {
    console.error("Failed to fetch enrolled students", err);
    return [];
  }
};


const buyTokens = async (tokenAmount) => {
  try {
    console.log("🔍 Starting token purchase...");
    console.log("Token Amount:", tokenAmount);
    console.log("Account:", account);
    
    // Check if user has enough ETH
    const balance = await provider.getBalance(account);
    const TOKEN_PRICE = ethers.parseEther("0.0001"); // 0.0001 ETH per token
    const ethValue = TOKEN_PRICE * BigInt(tokenAmount); // Correct calculation
    
    console.log("User ETH Balance:", ethers.formatEther(balance));
    console.log("Required ETH:", ethers.formatEther(ethValue));
    console.log("Token Price:", ethers.formatEther(TOKEN_PRICE));
    
    if (balance < ethValue + ethers.parseEther("0.01")) { // Extra buffer for gas
      throw new Error("Insufficient ETH balance for transaction + gas fees");
    }

    // The key fix: Your contract expects the number of tokens (not wei amount)
    // So we pass tokenAmount directly, not tokenAmount * 1e18
    console.log("Calling buyTokens with amount:", tokenAmount);
    console.log("Sending ETH value:", ethers.formatEther(ethValue));

    // Test with static call first
    try {
      await contracts.skillBridge.buyTokens.staticCall(tokenAmount, {
        value: ethValue,
        from: account
      });
      console.log("✅ Static call succeeded");
    } catch (staticError) {
      console.error("❌ Static call failed:", staticError);
      
      // Better error handling
      if (staticError.message.includes("Incorrect ETH sent")) {
        throw new Error("Payment amount mismatch. Please check the token price.");
      } else if (staticError.message.includes("Token transfer failed")) {
        throw new Error("Contract doesn't have enough tokens to sell.");
      } else {
        throw new Error(`Contract error: ${staticError.message}`);
      }
    }

    // Estimate gas
    const gasEstimate = await contracts.skillBridge.buyTokens.estimateGas(
      tokenAmount,
      { value: ethValue }
    );
    console.log("Gas estimate:", gasEstimate.toString());

    // Execute transaction
    const tx = await contracts.skillBridge.buyTokens(tokenAmount, {
      value: ethValue,
      gasLimit: gasEstimate + 50000n,
    });

    console.log("Transaction hash:", tx.hash);
    
    // Show pending toast
    toast.loading(`Transaction submitted: ${tx.hash.slice(0, 10)}...`, {
      id: 'buy-tokens-tx'
    });

    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);

    // Success
    toast.success(`Successfully purchased ${tokenAmount} tokens!`, {
      id: 'buy-tokens-tx'
    });
    
    await refreshTokenBalance();
    
  } catch (error) {
    console.error("❌ Failed to buy tokens:", error);
    
    // Remove loading toast
    toast.dismiss('buy-tokens-tx');
    
    // Better error messages
    let userMessage = "Transaction failed";
    
    if (error.message.includes("insufficient funds")) {
      userMessage = "Insufficient ETH balance for transaction + gas fees";
    } else if (error.message.includes("user rejected")) {
      userMessage = "Transaction cancelled";
    } else if (error.message.includes("Incorrect ETH sent")) {
      userMessage = "Payment amount is incorrect. Please try again.";
    } else if (error.message.includes("Token transfer failed")) {
      userMessage = "Contract doesn't have enough tokens available.";
    } else if (error.message) {
      userMessage = error.message;
    }
    
    toast.error(userMessage);
    throw error;
  }
};

// Add this function to check if your contract has enough tokens
const checkContractTokens = async () => {
  if(!contracts.skillBridge){
    return;
  }
  try {
    const contractAddress = await contracts.skillBridge.getAddress();
    console.log("Contract Address:", contractAddress);
    
    // Check how many SBT tokens the contract holds
    const contractTokenBalance = await contracts.token.balanceOf(contractAddress);
    console.log("Contract Token Balance:", ethers.formatUnits(contractTokenBalance, 18), "SBT");
    
    // Check if contract has enough tokens for the purchase
    const tokensNeeded = ethers.parseUnits("1", 18); // 1 token with 18 decimals
    console.log("Tokens needed for 1 token purchase:", ethers.formatUnits(tokensNeeded, 18));
    
    if (contractTokenBalance >= tokensNeeded) {
      console.log("✅ Contract has enough tokens");
      return true;
    } else {
      console.log("❌ Contract doesn't have enough tokens");
      console.log("Contract needs to be funded with SBT tokens first!");
      return false;
    }
    
  } catch (error) {
    console.error("Error checking contract tokens:", error);
    return false;
  }
};
checkContractTokens();
// Call this before buying tokens
// await checkContractTokens();
// 3. Transfer tokens to contract (Admin only)
const fundContract = async (amount) => {
  if (!contracts.token || !account) {
    throw new Error("Contracts not initialized");
  }

  const isOwner = await isContractOwner();
  if (!isOwner) {
    throw new Error("Only contract owner can fund the contract");
  }

  try {
    const amountInWei = ethers.parseEther(amount.toString());
    
    // Check if user has enough balance
    const userBalance = await contracts.token.balanceOf(account);
    if (userBalance < amountInWei) {
      throw new Error(`Insufficient balance. You have ${ethers.formatEther(userBalance)} SBT`);
    }

    console.log(`Transferring ${amount} SBT tokens to contract...`);
    
    const tx = await contracts.token.transfer(CONTRACT_ADDRESSES.SKILLBRIDGE_MAIN, amountInWei);
    await tx.wait();
    
    console.log(`Successfully transferred ${amount} SBT tokens to contract`);
    toast.success(`Contract funded with ${amount} SBT tokens`);
    
    // Refresh balances
    await refreshTokenBalance();
    
    return tx;
  } catch (error) {
    console.error("Failed to fund contract:", error);
    toast.error(`Failed to fund contract: ${error.message}`);
    throw error;
  }
};
// 4. Transfer tokesn to user or instructor
const transferTokens = async (to, amount) => {
  if (!contracts.token || !account) throw new Error("Not connected");
  try {
    const amountInWei = ethers.parseEther(amount.toString());
    const tx = await contracts.token.transfer(to, amountInWei);
    await tx.wait();
    toast.success("Token transfer successful");
    return tx;
  } catch (error) {
    console.error("Transfer failed:", error);
    toast.error("Token transfer failed");
    throw error;
  }
};

// handle quiz complete
  const completeTest = async (score) => {
    if (!contracts.skillBridge || !contracts.token) throw new Error("Contracts not initialized");
    
    const reward = ethers.parseEther((score * 1).toString());
    const retakeFee = ethers.parseEther("2");
    console.log("User balance:", ethers.formatEther(await contracts.token.balanceOf(account)));
    console.log("Contract balance:", ethers.formatEther(await contracts.token.balanceOf(CONTRACT_ADDRESSES.SKILLBRIDGE_MAIN)));
    console.log("Required fee:", ethers.formatEther(retakeFee));
    console.log("Expected reward:", ethers.formatEther(reward));
    
    try {
      const userData = await contracts.skillBridge.users(account);
      const hasCompleted = userData[4];
      
      let tx;
      
      if (!hasCompleted) {
        // First time test - check if contract has enough tokens for reward
        const contractBalance = await contracts.token.balanceOf(CONTRACT_ADDRESSES.SKILLBRIDGE_MAIN);
        if (contractBalance < reward) {
          throw new Error("Contract has insufficient tokens for reward");
        }
        
        tx = await contracts.skillBridge.completeTest(score);
      } else {
        // Retake - check user balance
        const userBalance = await contracts.token.balanceOf(account);
        if (userBalance < retakeFee) {
          throw new Error(`Insufficient balance. You need ${ethers.formatEther(retakeFee)} SKL tokens for retake fee`);
        }
        
        // Check contract balance for reward
        const contractBalance = await contracts.token.balanceOf(CONTRACT_ADDRESSES.SKILLBRIDGE_MAIN);
        if (contractBalance < reward) {
          throw new Error("Contract has insufficient tokens for reward");
        }
        
        // Check current allowance
        const currentAllowance = await contracts.token.allowance(account, CONTRACT_ADDRESSES.SKILLBRIDGE_MAIN);
        console.log("Current allowance:", ethers.formatEther(currentAllowance));
        console.log("Required fee:", ethers.formatEther(retakeFee));
        
        if (currentAllowance < retakeFee) {
          console.log("Approving tokens...");
          const approveTx = await contracts.token.approve(CONTRACT_ADDRESSES.SKILLBRIDGE_MAIN, retakeFee);
          await approveTx.wait();
          console.log("Approval successful");
        }
        
        // Now call retakeTest
        tx = await contracts.skillBridge.retakeTest(score, retakeFee);
      }
      
      await tx.wait();
      await refreshTokenBalance();
      
      toast.success(`Test ${hasCompleted ? "retaken" : "completed"} successfully!`);
      return tx;
    } catch (error) {
      console.error("Failed to submit test:", error);
      toast.error(`Test submission failed: ${error.message}`);
      throw error;
    }
  };

  // Create course
  const createCourse = async (courseData) => {
    if (!contracts.skillBridge) throw new Error('Contract not initialized');
    try {
      const tx = await contracts.skillBridge.createCourse(
        courseData.title,
        courseData.description,
        ethers.parseEther(courseData.price.toString()),
        courseData.videoIPFSHash,
        courseData.thumbnailIPFSHash,
        courseData.category
      );
      await tx.wait();
      toast.success('Course created successfully!');
      return tx;
    } catch (error) {
      console.error('Failed to create course:', error);
      toast.error('Failed to create course');
      throw error;
    }
  };

  // Enroll in course
  const enrollInCourse = async (courseId) => {
    if (!contracts.skillBridge || !contracts.token) throw new Error('Contracts not initialized');
  
    try {
      const course = await contracts.skillBridge.courses(courseId);
      const coursePrice = course[3]; // ✅ index 3 = price (uint256)
  
      // Check if user has enough tokens
      const currentBalance = await contracts.token.balanceOf(account);
      if (currentBalance < coursePrice) {
        throw new Error('Insufficient token balance');
      }
  
      // Approve token allowance
      const approveTx = await contracts.token.approve(
        CONTRACT_ADDRESSES.SKILLBRIDGE_MAIN,
        coursePrice
      );
      await approveTx.wait();
  
      // Enroll in course
      const enrollTx = await contracts.skillBridge.enrollInCourse(courseId);
      await enrollTx.wait();

      // Refresh token balance after enrollment
      await refreshTokenBalance();
  
      toast.success('Enrolled in course successfully!');
      return enrollTx;
    } catch (error) {
      console.error('Failed to enroll in course:', error);
      toast.error('Failed to enroll in course');
      throw error;
    }
  };

  // Purchase tokens
  const purchaseTokens = async (ethAmount) => {
    if (!contracts.skillBridge) throw new Error('Contract not initialized');
    try {
      const tx = await contracts.skillBridge.purchaseTokens({
        value: ethers.parseEther(ethAmount.toString())
      });
      await tx.wait();
      
      // Refresh token balance after purchase
      await refreshTokenBalance();
      
      toast.success('Tokens purchased successfully!');
      return tx;
    } catch (error) {
      console.error('Failed to purchase tokens:', error);
      toast.error('Failed to purchase tokens');
      throw error;
    }
  };

// Get all courses
    const getAllCourses = async () => {
      if (!contracts.skillBridge) return [];
      try {
        const nextId = await contracts.skillBridge.nextCourseId();
        const courses = [];

        for (let i = 1; i < nextId; i++) {
          try {
            const course = await contracts.skillBridge.courses(i);

            const courseId = Number(course[0]);
            const instructor = course[1];
            const title = course[2];
            const price = ethers.formatEther(course[3]);
            const metadataCID = course[4];
            const isActive = course[5];
            const createdAt = new Date(Number(course[6]) * 1000);

            if (isActive && metadataCID) {
              // 👇 Fetch metadata
              const metadataRes = await fetch(`https://gateway.pinata.cloud/ipfs/${metadataCID}`);
              const metadata = await metadataRes.json();

              // 👇 Get enrolled students count
              const enrolledStudents = await contracts.skillBridge.getEnrolledStudents(courseId);
              const enrollmentCount = enrolledStudents.length;

              courses.push({
                courseId,
                instructor,
                title,
                price: parseFloat(price),
                metadataCID,
                isActive,
                createdAt,
                enrollmentCount, // ✅ add it here
                ...metadata
              });
            }
          } catch (error) {
            console.error(`Failed to fetch course ${i}:`, error);
          }
        }

        return courses;
      } catch (error) {
        console.error('Failed to get courses:', error);
        return [];
      }
    };

  const markCourseAsCompleted = async (courseId, resultCID) => {
    if (!contracts.skillBridge || !account) return;
    console.log("this is courseid and resultcid",courseId,resultCID)
    try {
      const tx = await contracts.skillBridge.completeCourse(courseId, resultCID);
      await tx.wait();
      console.log(`Course ${courseId} marked as completed with result CID ${resultCID}`);
    } catch (err) {
      console.error('Failed to mark course as completed:', err);
      throw err;
    }
  };
  
  // Get course details
  const getCourseDetails = async (courseId) => {
    if (!contracts.skillBridge) throw new Error("SkillBridge contract not loaded");

    try {
      const course = await contracts.skillBridge.courses(courseId);
      const metadataCID = course.metadataCID;

      const metadataRes = await fetch(`https://gateway.pinata.cloud/ipfs/${metadataCID}`);
      const metadata = await metadataRes.json();

      return {
        courseId,
        ...metadata,
        instructor: course.instructor,
        price: Number(ethers.formatUnits(course.price, 18)),
        createdAt: Number(course.createdAt),
        isActive: course.isActive,
        metadataCid:metadataCID
      };
    } catch (error) {
      console.error('Failed to get course details:', error);
      throw error;
    }
  };

  // Check if user has access to course
  const hasAccessToCourse = async (userAddress, courseId) => {
    if (!contracts.skillBridge) return false;
    try {
      const isEnrolled = await contracts.skillBridge.hasAccessToCourse(userAddress, courseId);
      return isEnrolled;
    } catch (err) {
      console.error(`Failed to check enrollment for course ${courseId}:`, err);
      return false;
    }
  };

  const updateUserProfile = async (profileData) => {
    if (!contracts.skillBridge) throw new Error("Contract not connected");

    try {
      const cid = await uploadProfileDetailsToIPFS({ profileData });
      const tx = await contracts.skillBridge.setProfileMetadata(cid);
      await tx.wait();
      toast.success("Profile updated on blockchain!");
    } catch (err) {
      console.error("Profile update failed:", err);
      toast.error("Profile update failed");
    }
  };

  const getUserProfileCID = async (userAddress) => {
    if (!contracts.skillBridge) return null;
     console.log("this is useradress",userAddress);
     const cid=await contracts.skillBridge.getProfileMetadata(userAddress);
     console.log("this is data from blockchain",cid);
     return cid
  };

  // Get ETH balance
  const getEthBalance = async () => {
    if (!provider || !account) return '0';
    try {
      const balance = await provider.getBalance(account);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get ETH balance:', error);
      return '0';
    }
  };
  const getUserCertificates = async (account) => {
    const skillBridgeMainContract = contracts.skillBridge;
    const skillBridgeNFTContract = contracts.nft;
  
    if (!skillBridgeMainContract || !skillBridgeNFTContract || !account) {
      console.warn("⚠️ Missing contracts or account");
      return [];
    }
  
    const enrolledCourseIds = await skillBridgeMainContract.getUserEnrolledCourses(account);
    console.log("📘 Enrolled Courses:", enrolledCourseIds);
  
    const nftList = [];
  
    for (let courseId of enrolledCourseIds) {
      try {
        const nftId = await skillBridgeMainContract.userCourseCertificates(account, courseId);
        const numericId = Number(nftId);
  
        // Skip if tokenId is 0 AND account is not the owner
        const owner = await skillBridgeNFTContract.ownerOf(nftId);
        if (owner.toLowerCase() !== account.toLowerCase()) {
          console.warn(`⛔ Skipping NFT ID ${nftId} not owned by account ${account}`);
          continue;
        }
  
        const tokenUri = await skillBridgeNFTContract.tokenURI(numericId);
        const ipfsCid = tokenUri.includes("ipfs/") ? tokenUri.split("ipfs/")[1] : tokenUri;
        const metadata = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsCid}`);
        console.log("📦 NFT Metadata:", metadata);
  
        const courseAttr = metadata.data.attributes?.find(attr => attr.trait_type === "Course")?.value;
        const dateAttr = metadata.data.attributes?.find(attr => attr.trait_type === "Date")?.value;
        const displayDate = dateAttr ? new Date(dateAttr).toLocaleDateString() : "Date Unavailable";
  
        nftList.push({
          id: nftId.toString(),
          name: metadata.data.name || "SkillBridge Certificate",
          course: courseAttr || `Course #${courseId}`,
          date: displayDate,
          uri: tokenUri,
          image: metadata.data.image
        });
  
      } catch (err) {
        console.error("❌ Failed to fetch NFT for course:", courseId, err);
      }
    }
  
    return nftList;
  };

  const getCertifiatesNFTID = async ({ account, courseId }) => {
    if (!account || !courseId) {
      console.warn("⚠️ Missing user address or courseId");
      return null;
    }
  
    const skillBridgeMainContract = contracts.skillBridge;
    const skillBridgeNFTContract = contracts.nft;
  
    if (!skillBridgeMainContract || !skillBridgeNFTContract) {
      console.warn("⚠️ Missing contract instances");
      return null;
    }
  
    try {
      const nftId = await skillBridgeMainContract.getCertificateNftId(account, courseId);
      const owner = await skillBridgeNFTContract.ownerOf(nftId);
  
      if (owner.toLowerCase() !== account.toLowerCase()) {
        console.warn(`⛔ NFT ID ${nftId} does not belong to ${account}`);
        return null;
      }
  
      return nftId;
    } catch (err) {
      console.error(`❌ Failed to fetch certificate NFT ID for user ${account}, course ${courseId}`, err);
      return null;
    }
  };
  
  
  

  // Auto-refresh token balance periodically
  useEffect(() => {
    let intervalId;
    
    if (isConnected && contracts.token && account) {
      // Refresh balance immediately
      refreshTokenBalance();
      
      // Set up periodic refresh every 30 seconds
      intervalId = setInterval(() => {
        refreshTokenBalance();
      }, 30000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isConnected, contracts.token, account]);

  // Listen for account changes
  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        if (contracts.token) {
          refreshTokenBalance();
        }
      }
    };

    const handleChainChanged = (chainId) => {
      setChainId(Number(chainId));
      // Optionally refresh contracts or show network switch notification
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account, contracts.token]);

  // Check if already connected on page load
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(web3Provider);
            setAccount(accounts[0]);
            setIsConnected(true);
            
            const web3Signer = await web3Provider.getSigner();
            setSigner(web3Signer);
            
            const network = await web3Provider.getNetwork();
            setChainId(Number(network.chainId));
            
            await initializeContracts(web3Signer);
          }
        } catch (error) {
          console.error('Failed to check existing connection:', error);
        }
      }
    };

    checkConnection();
  }, []);
 
  const value = {
    // State
    account,
    provider,
    signer,
    contracts,
    loading,
    chainId,
    tokenBalance,
    isConnected,
    contractsLoaded,

    
    // Functions
    connectWallet,
    disconnectWallet,
    switchNetwork,
    initializeWeb3,
    
    // Token functions
    getTokenBalance,
    refreshTokenBalance,
    getEthBalance,
    
    // Contract functions
    getUserData,
    completeTest,
    createCourse,
    enrollInCourse,
    purchaseTokens,
    getAllCourses,
    getCourseDetails,
    hasAccessToCourse,
    isContractOwner,
    getContractTokenBalance,
    fundContract,
    updateUserProfile,
    getUserProfileCID,
    getCourseQuiz,
    buyTokens,
    transferTokens,
    markCourseAsCompleted,
    getEnrolledStudents,
    getUserCertificates,
    getCertifiatesNFTID,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};