import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Coins, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const {
    account,
    isContractOwner,
    getContractTokenBalance,
    fundContract,
    tokenBalance,
    transferTokens,
  } = useWeb3();

  const [isOwner, setIsOwner] = useState(false);
  const [contractBalance, setContractBalance] = useState('0');
  const [fundAmount, setFundAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    const checkOwnership = async () => {
      const ownerStatus = await isContractOwner();
      setIsOwner(ownerStatus);
    };
    checkOwnership();
  }, [account]);

  useEffect(() => {
    const fetchContractBalance = async () => {
      const balance = await getContractTokenBalance();
      setContractBalance(balance);
    };
    fetchContractBalance();
  }, [getContractTokenBalance]);

  const handleFundContract = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      toast.error("Enter a valid fund amount");
      return;
    }
    setLoading(true);
    try {
      await fundContract(fundAmount);
      setFundAmount('');
      const newBalance = await getContractTokenBalance();
      setContractBalance(newBalance);
    } catch {
      toast.error("Funding failed");
    }
    setLoading(false);
  };

  const handleQuickFund = async (amount) => {
    setLoading(true);
    try {
      await fundContract(amount);
      const newBalance = await getContractTokenBalance();
      setContractBalance(newBalance);
    } catch {
      toast.error("Quick fund failed");
    }
    setLoading(false);
  };

  const handleTokenTransfer = async () => {
    if (!recipient || !transferAmount || parseFloat(transferAmount) <= 0) {
      toast.error("Invalid recipient or amount");
      return;
    }

    setTransferring(true);
    try {
      await transferTokens(recipient, transferAmount);
      toast.success(`Transferred ${transferAmount} SBT`);
      setRecipient('');
      setTransferAmount('');
    } catch {
      toast.error("Transfer failed");
    }
    setTransferring(false);
  };

  if (!isOwner) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-md mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Coins className="text-indigo-500" />
        Admin Panel
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Token Info & Fund Section */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-2">Token Balances</h3>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Your Balance</span>
              <span className="font-bold text-green-600">{tokenBalance} SBT</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Contract Balance</span>
              <span className="font-bold text-blue-600">{contractBalance} SBT</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Fund Contract</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {[1000, 5000, 10000].map(amount => (
                <button
                  key={amount}
                  onClick={() => handleQuickFund(amount)}
                  className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm px-3 py-1 rounded-lg transition"
                  disabled={loading}
                >
                  {amount} SBT
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Custom amount"
              />
              <button
                onClick={handleFundContract}
                disabled={loading || !fundAmount}
                className="bg-green-500 hover:bg-green-600 text-white px-4 rounded-lg text-sm transition"
              >
                {loading ? 'Funding...' : 'Fund'}
              </button>
            </div>
          </div>
        </div>

        {/* Transfer Tokens */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Transfer Tokens</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Recipient Address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Amount"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleTokenTransfer}
              disabled={transferring}
              className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition text-sm"
            >
              <Send size={18} className="mr-2" />
              {transferring ? "Transferring..." : "Send Tokens"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
