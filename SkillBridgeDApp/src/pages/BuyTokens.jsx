import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import toast from 'react-hot-toast';

const BuyTokens = () => {
  const { 
    contracts, 
    account, 
    isConnected, 
    loading: web3Loading, 
    buyTokens 
  } = useWeb3();
  
  const [tokenAmount, setTokenAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const TOKEN_PRICE_ETH = 0.0001;
  const isReady = contracts.skillBridge && account && isConnected && !web3Loading;

  const handleBuyTokens = async () => {
    if (!isConnected || !account) {
      return toast.error('Please connect your wallet');
    }

    if (!contracts.skillBridge) {
      return toast.error('Contracts not initialized');
    }

    const amount = parseInt(tokenAmount);
    if (!amount || amount <= 0) {
      return toast.error('Enter a valid token amount');
    }

    try {
      setLoading(true);
      await buyTokens(amount);
      setTokenAmount('');
    } catch (error) {
      console.error('Token purchase failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEthCost = () => {
    if (!tokenAmount || parseInt(tokenAmount) <= 0) return '0';
    return (parseInt(tokenAmount) * TOKEN_PRICE_ETH).toFixed(4);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-white to-slate-100 p-4">
      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Buy SBT Tokens</h2>

        {!isReady ? (
          <div className="text-center text-yellow-500">
            <p>Please connect wallet and wait...</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block mb-2 text-sm text-gray-700">Number of Tokens</label>
              <input
                type="number"
                min="1"
                step="1"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter number of tokens (e.g. 100)"
              />
              {tokenAmount && (
                <p className="text-sm text-gray-500 mt-2">
                  ≈ {calculateEthCost()} ETH
                </p>
              )}
            </div>

            <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded">
              <p className="text-sm text-gray-700">Exchange Rate:</p>
              <p className="text-sm font-medium text-blue-600">1 ETH = 10,000 SBT</p>
              <p className="text-xs text-gray-500 mt-1">(1 SBT = 0.0001 ETH)</p>
            </div>

            <button
              onClick={handleBuyTokens}
              disabled={loading || !tokenAmount || parseInt(tokenAmount) <= 0}
              className={`w-full py-3 rounded-lg font-medium transition duration-300 ${
                loading || !tokenAmount
                  ? 'bg-gray-200 cursor-not-allowed text-gray-500'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md'
              }`}
            >
              {loading 
                ? 'Processing...' 
                : `Buy ${tokenAmount || 0} Tokens`}
            </button>

            <div className="mt-4 text-xs text-gray-500">
              <p>• You will pay <strong>{calculateEthCost()} ETH</strong></p>
              <p>• Gas fees apply on top</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BuyTokens;
