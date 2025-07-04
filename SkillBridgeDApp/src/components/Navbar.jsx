// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { 
  BookOpen, 
  User, 
  Wallet, 
  Menu, 
  X, 
  Home, 
  PlusCircle,
  BarChart3,
  Coins
} from 'lucide-react';

const Navbar = () => {
  const { account, connectWallet, disconnectWallet, getTokenBalance } = useWeb3();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tokenBalance, setTokenBalance] = useState('0');
  const location = useLocation();

  useEffect(() => {
    const fetchBalance = async () => {
      if (account) {
        const balanceRaw = await getTokenBalance(); // already formatted as string
        const parsed = parseFloat(balanceRaw).toFixed(2); // format it cleanly
        setTokenBalance(parsed);
      }
    };
    fetchBalance();
    
  }, [account, getTokenBalance]);

  const navigationItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/courses', icon: BookOpen, label: 'Courses' },
    { path: '/test',state:{type:"entry"}, icon: BarChart3, label: 'Take Test' },
    { path: '/create-course', icon: PlusCircle, label: 'Create Course' },
    { path: '/dashboard', icon: User, label: 'Dashboard' },
  ];

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4  ">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">SkillBridge</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={
                  item.label === 'Take Test'
                    ? { pathname: item.path, state: item.state }
                    : item.path
                }
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActivePath(item.path)
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Wallet Section */}
          <div className="hidden md:flex items-center space-x-4">
            {account ? (
              <>
                <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-medium">{tokenBalance} SBT</span>

                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white">{formatAddress(account)}</span>
                  <button
                    onClick={disconnectWallet}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Disconnect Wallet"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={connectWallet}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActivePath(item.path)
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            
            {/* Mobile Wallet Section */}
            <div className="pt-4 border-t border-white/10">
              {account ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-white font-medium">
                      {parseFloat(tokenBalance).toFixed(2)} SBT
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-white text-sm">{formatAddress(account)}</span>
                    </div>
                    <button
                      onClick={disconnectWallet}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;