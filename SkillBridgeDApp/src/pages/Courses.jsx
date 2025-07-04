import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { BookOpen, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import CourseCard from '../components/Courses/CourseCard';
import Sidebar from '../components/Courses/Sidebar';
import SearchAndFilters from '../components/Courses/SearchAndFilter';

const Courses = () => {
  const { enrollInCourse, account, getAllCourses, hasAccessToCourse, getTokenBalance, isConnected, tokenBalance } = useWeb3();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [userTokens, setUserTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [loadingCourseId, setLoadingCourseId] = useState(null);


  const categories = [
    { id: 'all', name: 'All Courses', icon: BookOpen },
    { id: 'blockchain', name: 'Blockchain', icon: Zap },
    { id: 'programming', name: 'Programming', icon: BookOpen },
    { id: 'design', name: 'Design', icon: BookOpen },
    { id: 'marketing', name: 'Marketing', icon: BookOpen },
  ];

  const fetchTokenBalance = async () => {
    if (!account) return;
    setTokenLoading(true);
    try {
      const balance = await getTokenBalance();
      setUserTokens(parseFloat(balance));
    } catch (error) {
      console.error("Error fetching token balance:", error);
      setUserTokens(0);
    } finally {
      setTokenLoading(false);
    }
  };

  const fetchCourses = async () => {
    if (!account) return;
    setLoading(true);
    try {
      const coursesFromChain = await getAllCourses();
      const withEnrollment = await Promise.all(
        coursesFromChain.map(async (course) => {
          const isEnrolled = await hasAccessToCourse(account, course.courseId);
          return { ...course, isEnrolled };
        })
      );
      setCourses(withEnrollment);
    } catch (err) {
      console.error("Error loading courses:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initialization effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitializing(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch courses when account and connection are ready
  useEffect(() => {
    if (!initializing && account && isConnected) {
      fetchCourses();
    } else if (!initializing && !account) {
      setLoading(false);
      setCourses([]);
    }
  }, [account, isConnected, initializing]);

  // Sync token balance from Web3Context
  useEffect(() => {
    if (tokenBalance && tokenBalance !== '0') {
      setUserTokens(parseFloat(tokenBalance));
    } else if (account && isConnected && !initializing) {
      // Fallback: fetch balance if context doesn't have it
      fetchTokenBalance();
    } else if (!account || !isConnected) {
      setUserTokens(0);
    }
  }, [tokenBalance, account, isConnected, initializing]);

  const filteredCourses = courses.filter(course => {
    const matchSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'popular': return b.enrollmentCount - a.enrollmentCount;
      case 'rating': return b.averageRating - a.averageRating;
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      default: return 0;
    }
  });

  const handleEnrollCourse = async (courseId, price) => {
    if (userTokens < price) {
      alert("Not enough tokens to enroll");
      return;
    }
    setLoadingCourseId(courseId);
    setTokenLoading(true);
    try {
      await enrollInCourse(courseId);
      // Token balance will be updated automatically by Web3Context
      await fetchCourses();
    } catch (err) {
      console.error("Enrollment failed:", err);
      alert("Enrollment failed");
    } finally {
      setTokenLoading(false);
    }
  };

  // Manual refresh function
  const handleRefresh = async () => {
    if (account && isConnected) {
      await fetchTokenBalance();
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-700">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!account || !isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center">
        <div>
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Connect Your Wallet</h3>
          <p className="text-gray-600">Please connect your wallet to view available courses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40 px-6 py-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              Explore Courses
            </h1>
            <p className="text-gray-600 mt-1">Choose from a variety of on-chain learning paths</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-md">
              <Zap size={16} />
              {tokenLoading ? '...' : `${userTokens.toFixed(2)} Tokens`}
            </div>
            <button
              onClick={handleRefresh}
              className="border border-gray-300 px-4 py-2 rounded-full text-sm bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm"
            >
              ⟳ Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <SearchAndFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <Sidebar
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          {/* Course Cards */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading courses...</p>
              </div>
            ) : sortedCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {sortedCourses.map(course => (
                  <CourseCard
                  key={course.courseId}
                  course={course}
                  userTokens={userTokens}
                  onEnroll={handleEnrollCourse}
                  loadingCourseId={loadingCourseId}
                />
                
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No courses found. Try different filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;