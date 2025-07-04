// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Award, 
  Coins, 
  TrendingUp, 
  Play, 
  Star, 
  Clock, 
  Users,
  ShoppingCart,
  Trophy,
  Target,
  CheckCircle,
  ArrowRight,
  Activity,
  Calendar,
  Bell,
  Settings,
  User,
  ChevronRight,
  Zap,
  Bookmark,
  GraduationCap,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPanel from '../components/AdminPanel';
import StatsCards from "../components/Dashboard/StatsCards";
import CourseList from "../components/Dashboard/CourseList";
import QuickActions from "../components/Dashboard/QuickActions";

const Dashboard = () => {
  const { 
    account, 
    getUserData, 
    enrollInCourse, 
    getTokenBalance, 
    getAllCourses,
    hasAccessToCourse,
    tokenBalance,
    refreshTokenBalance
  } = useWeb3();
  
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [currentTokenBalance, setCurrentTokenBalance] = useState(0);
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState({});
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAllData = async () => {
      if (account) {
        setLoading(true);
        try {
          const [userDataFromChain, balance, coursesFromChain] = await Promise.all([
            getUserData(),
            getTokenBalance(),
            getAllCourses()
          ]);

          setUserData(userDataFromChain);
          setCurrentTokenBalance(parseFloat(balance) || 0);

          const enrollmentPromises = coursesFromChain.map(async (course) => {
            const hasAccess = await hasAccessToCourse(account, course.courseId);
            return { ...course, isEnrolled: hasAccess };
          });

          const coursesWithEnrollment = await Promise.all(enrollmentPromises);
          setAllCourses(coursesWithEnrollment);

          const enrolled = coursesWithEnrollment.filter(course => course.isEnrolled);
          setEnrolledCourses(enrolled);
          setCompletedCourses([]);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          toast.error('Error loading dashboard data');
        }
        setLoading(false);
      }
    };

    fetchAllData();
  }, [account, getUserData, getTokenBalance, getAllCourses, hasAccessToCourse]);

  useEffect(() => {
    if (tokenBalance) {
      setCurrentTokenBalance(parseFloat(tokenBalance) || 0);
    }
  }, [tokenBalance]);

  const handleEnrollInCourse = async (courseId, price) => {
    if (currentTokenBalance < price) {
      toast.error(`Insufficient tokens. You need ${price} SKL tokens.`);
      return;
    }

    setPurchaseLoading({ ...purchaseLoading, [courseId]: true });
    try {
      await enrollInCourse(courseId);
      toast.success('Successfully enrolled in course!');
      
      await refreshTokenBalance();
      const updatedUserData = await getUserData();
      setUserData(updatedUserData);

      const updatedCourses = allCourses.map(course => {
        if (course.courseId === courseId) {
          return { ...course, isEnrolled: true };
        }
        return course;
      });

      setAllCourses(updatedCourses);
      setEnrolledCourses(prev => [...prev, updatedCourses.find(c => c.courseId === courseId)]);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in course');
    }
    setPurchaseLoading({ ...purchaseLoading, [courseId]: false });
  };

  // Helper data
  const availableCourses = allCourses.filter(course => !course.isEnrolled);
  const recentActivity = [
    { type: 'enrollment', course: 'React Fundamentals', time: '2 hours ago', icon: BookOpen },
    { type: 'completion', course: 'JavaScript Basics', time: '1 day ago', icon: CheckCircle },
    { type: 'achievement', course: 'First Course Complete', time: '3 days ago', icon: Trophy },
  ];

  // Tab Button Component
  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  if (!account) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 text-center text-red-500">
        <div className="max-w-xl mx-auto mt-20 bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-lg">
          <Trophy size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2 text-slate-800">Access Denied</h2>
          <p className="text-slate-600">Please connect your wallet to access your dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 text-center">
        <div className="max-w-xl mx-auto mt-20 bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <AdminPanel />
      
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                <GraduationCap size={32} className="text-blue-600" />
                Welcome back!
              </h1>
              <p className="text-gray-600 mt-1">Continue your learning journey and track your progress</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg shadow-md">
                <Coins size={20} />
                <span className="font-bold">{currentTokenBalance.toFixed(2)} SBT</span>
              </div>
              
              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                <User size={18} />
                Profile
              </button>
              
              <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                <Bell size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <TabButton
            id="overview"
            label="Overview"
            icon={BarChart3}
            isActive={activeTab === 'overview'}
            onClick={setActiveTab}
          />
          <TabButton
            id="enrolled"
            label="My Courses"
            icon={BookOpen}
            isActive={activeTab === 'enrolled'}
            onClick={setActiveTab}
          />
          <TabButton
            id="available"
            label="Browse Courses"
            icon={ShoppingCart}
            isActive={activeTab === 'available'}
            onClick={setActiveTab}
          />
          <TabButton
            id="achievements"
            label="Achievements"
            icon={Trophy}
            isActive={activeTab === 'achievements'}
            onClick={setActiveTab}
          />
          <TabButton
            id="activity"
            label="Activity"
            icon={Activity}
            isActive={activeTab === 'activity'}
            onClick={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <BarChart3 size={24} className="text-blue-600" />
                  Your Statistics
                </h2>
                <StatsCards userData={userData} enrolledCount={enrolledCourses.length} />
              </section>

              {/* Continue Learning */}
              {enrolledCourses.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                      <Play size={24} className="text-green-600" />
                      Continue Learning
                    </h2>
                    <button 
                      onClick={() => setActiveTab('enrolled')}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      View All <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {enrolledCourses.slice(0, 3).map(course => (
                      <div key={course.courseId} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-800 mb-2">{course.title}</h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                          </div>
                          <Bookmark size={20} className="text-green-500 flex-shrink-0" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock size={16} />
                            <span>Continue</span>
                          </div>
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                            <Play size={16} />
                            Resume
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Quick Actions */}
              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Zap size={24} className="text-yellow-600" />
                  Quick Actions
                </h2>
                <QuickActions hasCompletedTest={userData?.hasCompletedTest} />
              </section>

              {/* Featured Courses */}
              {availableCourses.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                      <Star size={24} className="text-purple-600" />
                      Featured Courses
                    </h2>
                    <button 
                      onClick={() => setActiveTab('available')}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      Browse All <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {availableCourses.slice(0, 3).map(course => (
                      <div key={course.courseId} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-800 mb-2">{course.title}</h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star size={16} fill="currentColor" />
                            <span className="text-sm">4.8</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                            <Coins size={16} />
                            <span>{course.price} SBT</span>
                          </div>
                          <button 
                            onClick={() => handleEnrollInCourse(course.courseId, course.price)}
                            disabled={purchaseLoading[course.courseId] || currentTokenBalance < course.price}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {purchaseLoading[course.courseId] ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Enrolling...</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={16} />
                                <span>Enroll</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Enrolled Courses Tab */}
          {activeTab === 'enrolled' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen size={28} className="text-blue-600" />
                  My Courses ({enrolledCourses.length})
                </h2>
              </div>
              {enrolledCourses.length > 0 ? (
                <CourseList 
                  courses={enrolledCourses} 
                  type="enrolled" 
                  onEnroll={handleEnrollInCourse} 
                />
              ) : (
                <div className="text-center py-12">
                  <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Courses Yet</h3>
                  <p className="text-gray-500 mb-4">Start your learning journey by enrolling in a course!</p>
                  <button 
                    onClick={() => setActiveTab('available')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse Courses
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Available Courses Tab */}
          {activeTab === 'available' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <ShoppingCart size={28} className="text-green-600" />
                  Available Courses ({availableCourses.length})
                </h2>
              </div>
              {availableCourses.length > 0 ? (
                <CourseList 
                  courses={availableCourses}
                  type="available"
                  onEnroll={handleEnrollInCourse}
                  currentTokenBalance={currentTokenBalance}
                  purchaseLoading={purchaseLoading}
                />
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Available Courses</h3>
                  <p className="text-gray-500">All courses have been enrolled or none are available.</p>
                </div>
              )}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Trophy size={28} className="text-yellow-600" />
                  Achievements & Badges
                </h2>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Achievement Cards */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <Trophy size={24} className="text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">First Course</h3>
                      <p className="text-gray-600 text-sm">Complete your first course</p>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: enrolledCourses.length > 0 ? '100%' : '0%' }}></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {enrolledCourses.length > 0 ? 'Completed' : 'Not started'}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <BookOpen size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Dedicated Learner</h3>
                      <p className="text-gray-600 text-sm">Enroll in 5 courses</p>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((enrolledCourses.length / 5) * 100, 100)}%` }}></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{enrolledCourses.length}/5 courses</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Target size={24} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">High Achiever</h3>
                      <p className="text-gray-600 text-sm">Score 90%+ on 3 tests</p>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '33%' }}></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">1/3 tests</p>
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Activity size={28} className="text-purple-600" />
                  Recent Activity
                </h2>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => {
                      const IconComponent = activity.icon;
                      return (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <IconComponent size={20} className="text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-800">
                              {activity.type === 'enrollment' && 'Enrolled in '}
                              {activity.type === 'completion' && 'Completed '}
                              {activity.type === 'achievement' && 'Earned '}
                              <span className="text-blue-600">{activity.course}</span>
                            </p>
                            <p className="text-gray-600 text-sm">{activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;