import React from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import {
  BookOpen,
  Award,
  Coins,
  Users,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
  Shield,
  Globe,
  UserCheck,
  GraduationCap,
  Zap,
  Wallet
} from 'lucide-react';
import Footer from '../components/Footer';
import HowItWorks from '../components/HowItWorks.jsx';

const Home = () => {
  const { account, connectWallet } = useWeb3();

  const features = [
    {
      icon: Coins,
      title: 'Earn While Learning',
      description: 'Take skill tests and earn platform tokens based on your performance.',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      icon: BookOpen,
      title: 'Quality Courses',
      description: 'Access premium courses from expert instructors worldwide.',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      icon: Award,
      title: 'NFT Certificates',
      description: 'Earn blockchain-verified certificates as NFTs upon course completion.',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      icon: Users,
      title: 'Global Community',
      description: 'Connect with learners and instructors from around the world.',
      gradient: 'from-violet-500 to-purple-600'
    }
  ];

  const stats = [
    { label: 'Active Learners', value: '10,000+', icon: UserCheck },
    { label: 'Courses Available', value: '500+', icon: GraduationCap },
    { label: 'NFTs Minted', value: '25,000+', icon: Zap },
    { label: 'Tokens Distributed', value: '1M+', icon: Wallet }
  ];

  const benefits = [
    'Decentralized learning platform',
    'Blockchain-verified certificates',
    'Transparent reward system',
    'Global accessibility',
    'Peer-to-peer skill exchange',
    'Cryptocurrency payments'
  ];

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      
      {/* Hero Section */}
      <section className="min-h-screen w-full flex items-start pt-12 justify-center px-4 ">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
    
    {/* Text Left */}
    <div className="space-y-6 text-center md:text-left">
      <span className="inline-block bg-indigo-100 text-indigo-700 px-3 rounded-full text-sm font-medium shadow">
        🔗 Powered by Web3 • SkillBridge
      </span>

      <h1 className="text-5xl md:text-7xl font-extrabold text-slate-800 leading-tight mb-4">
        Learn, Earn, and
        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          {' '}Certify
        </span>
      </h1>

      <p className="text-xl md:text-2xl text-slate-600 max-w-xl leading-relaxed">
        Join the world's first Web3 skill-sharing platform where knowledge pays and certificates are forever.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center md:justify-start">
        {/* Wallet/Button */}
        {account ? (
          <Link to="/test" className="group flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl text-lg font-semibold transition hover:scale-105 shadow-lg">
            <span>Take Skill Test</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        ) : (
          <button onClick={connectWallet} className="group flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl text-lg font-semibold transition hover:scale-105 shadow-lg">
            <span>Connect Wallet to Start</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        )}

        <Link to="/courses" className="flex items-center space-x-3 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 hover:border-slate-300 px-8 py-3 rounded-xl text-lg font-semibold transition shadow-md">
          <BookOpen className="w-5 h-5" />
          <span>Browse Courses</span>
        </Link>
      </div>

      
    </div>

    {/* Right Visual */}
    <div className="w-full">
      <img
        src="/herosection.png"
        alt="SkillBridge illustration"
        className="w-full max-w-lg mx-auto drop-shadow-xl"
      />
    </div>
  </div>
</section>


      {/* Enhanced Stats Section with Heavy Shadows */}
      <section className="w-full flex items-center justify-center p-4">
        <div className="w-full max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/40 backdrop-blur-xl border-2 border-white/60 rounded-2xl p-6 text-center hover:bg-white/60 hover:border-white/80 transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.25)] hover:-translate-y-3 group">
              <div className={`w-12 h-12 bg-gradient-to-r ${
                index === 0 ? 'from-blue-500 to-cyan-500' :
                index === 1 ? 'from-emerald-500 to-teal-500' :
                index === 2 ? 'from-amber-500 to-orange-500' :
                'from-violet-500 to-purple-500'
              } rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.2)] group-hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)]`}>
                <stat.icon className="w-6 h-6 text-white drop-shadow-sm" />
              </div>
              <div className="text-3xl font-bold text-slate-800 mb-1 drop-shadow-sm">{stat.value}</div>
              <div className="text-slate-700 font-semibold drop-shadow-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full flex items-center justify-center p-4 py-16">
        <div className="w-full max-w-7xl mx-auto px-4 space-y-16">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800">Why Choose SkillBridge?</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Experience the future of education with blockchain technology and innovative learning methods.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-8 hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-2">
                <div className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full flex items-center justify-center p-4 py-16">
        <div className="w-full max-w-7xl mx-auto px-4 space-y-16">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800">How It Works</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">Three simple steps to transform your learning journey</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: 1,
                title: 'Take Assessment',
                desc: 'Complete our comprehensive skill assessment and earn tokens based on your expertise level.',
                colors: 'from-blue-500 to-indigo-600'
              },
              {
                number: 2,
                title: 'Enroll in Courses',
                desc: 'Use your earned tokens to access premium courses tailored to your learning goals.',
                colors: 'from-purple-500 to-pink-600'
              },
              {
                number: 3,
                title: 'Earn NFT Certificate',
                desc: 'Complete courses and receive blockchain-verified NFT certificates that prove your skills.',
                colors: 'from-emerald-500 to-teal-600'
              }
            ].map((step, index) => (
              <div key={index} className="text-center space-y-6 group">
                <div className="relative">
                  <div className={`w-20 h-20 bg-gradient-to-r ${step.colors} rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                    <span className="text-white font-bold text-2xl">{step.number}</span>
                  </div>
                  <div className={`absolute -inset-4 bg-gradient-to-r ${step.colors}/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </section>
      <HowItWorks />

      {/* Benefits Section */}
      <section className="w-full flex items-center justify-center p-4 py-16">
        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-3xl p-8 md:p-16 shadow-xl">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-800 leading-tight">
                  The Future of Education is Here
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed">
                  SkillBridge combines traditional educational excellence with cutting-edge blockchain technology to create an unparalleled learning experience.
                </p>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-4 group">
                      <CheckCircle className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                      <span className="text-slate-700 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Shield, title: 'Secure', desc: 'Blockchain security', color: 'blue' },
                  { icon: Globe, title: 'Global', desc: 'Worldwide access', color: 'emerald' },
                  { icon: TrendingUp, title: 'Rewarding', desc: 'Earn while learning', color: 'violet' },
                  { icon: Star, title: 'Quality', desc: 'Expert instructors', color: 'amber' }
                ].map((box, i) => (
                  <div key={i} className={`group bg-gradient-to-br from-${box.color}-50 to-${box.color}-100 p-8 rounded-2xl text-center hover:from-${box.color}-100 hover:to-${box.color}-200 transition-all duration-300 hover:-translate-y-1`}>
                    <box.icon className={`w-10 h-10 text-${box.color}-600 mx-auto mb-4 group-hover:scale-110 transition-transform`} />
                    <h4 className="text-slate-800 font-bold text-lg mb-2">{box.title}</h4>
                    <p className="text-slate-600 text-sm">{box.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full flex items-center justify-center p-4 py-16">
        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="text-center space-y-10 bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-900 rounded-3xl p-16 shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">Ready to Transform Your Learning?</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Join thousands of learners who are already earning tokens and building their skills on SkillBridge.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
              {account ? (
                <>
                  <Link
                    to="/test"
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-10 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Start Your Journey
                  </Link>
                  <Link
                    to="/courses"
                    className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-10 py-4 rounded-xl font-bold transition-all duration-300 hover:border-white/40"
                  >
                    Explore Courses
                  </Link>
                </>
              ) : (
                <button
                  onClick={connectWallet}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-10 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Connect Wallet to Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;