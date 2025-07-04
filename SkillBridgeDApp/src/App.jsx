// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './context/Web3Context';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Test from './pages/Test';
import Courses from './pages/Courses';
import CreateCourse from './pages/CreateCourse';
import CourseDetail from './pages/CourseDetail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import BuyTokens from './pages/BuyTokens';
import NFTCertificate from './pages/NFTCertificate';
import './App.css';

// Component to handle conditional padding
function MainContent() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  
  return (
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Test />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/create-course" element={<CreateCourse />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/buy-tokens" element={<BuyTokens />} />
        <Route path="/certificate/:cid" element={<NFTCertificate />} />

      </Routes>
    </main>
  );
}

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="app-container min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-black">
          <Navbar />
          <MainContent />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;