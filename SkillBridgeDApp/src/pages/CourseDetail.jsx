import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, CheckCircle, ArrowLeft, BookOpen, Target, Award } from 'lucide-react';
import { useParams, useNavigate } from "react-router-dom";
import { useWeb3 } from '../context/Web3Context';
import IngestVectorButton from "../components/IngestVectorButton";
import CourseAIChat from "../components/CourseAiChat";
import axios from "axios";
import { fetchTextFromCid } from '../utils/ipfsFetcher';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    getCourseDetails,
    hasAccessToCourse,
    account,
    enrollInCourse,
    getCertifiatesNFTID,
    contractsLoaded,
  } = useWeb3();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [courseData, setCourseData] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userTokens, setUserTokens] = useState(250);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [vectorInfo, setVectorInfo] = useState({ collection: null, documentCount: 0 });
  const [description, setDescription] = useState("");
  const [prerequisites, setPrerequisites] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [hasCompletedCourse, setHasCompletedCourse] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getDifficultyColor = useCallback((difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-50 text-green-700 border-green-200';
      case 'Intermediate': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Advanced': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }, []);

  const handleMarkCompleted = useCallback(() => {
    navigate(`/test?type=course&courseId=${id}`);
  }, [navigate, id]);

  const handleBackToCourses = useCallback(() => {
    navigate("/courses");
  }, [navigate]);

  const handleGoToProfile = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  const loadCourse = useCallback(async () => {
    if (!id) {
      setError("Course ID is missing");
      setLoading(false);
      return;
    }

    if (!account) {
      setError("Please connect your wallet first");
      setLoading(false);
      return;
    }

    if (!contractsLoaded) {
      console.log("⏳ Waiting for contracts to load...");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [details, enrolled, nftId] = await Promise.all([
        getCourseDetails(id),
        hasAccessToCourse(account, id),
        getCertifiatesNFTID({ account, courseId: id })
      ]);

      setCourseData(details);
      setIsEnrolled(enrolled);
      setHasCompletedCourse(nftId && BigInt(nftId) >= 0n);

      const textPromises = [];
      if (details.descriptionCid) textPromises.push(fetchTextFromCid(details.descriptionCid).then(t => ['description', t]));
      if (details.prerequisitesCid) textPromises.push(fetchTextFromCid(details.prerequisitesCid).then(t => ['prerequisites', t]));
      if (details.learningOutcomesCid) textPromises.push(fetchTextFromCid(details.learningOutcomesCid).then(t => ['outcomes', t]));

      const textResults = await Promise.allSettled(textPromises);
      textResults.forEach(({ status, value }) => {
        if (status === 'fulfilled') {
          const [field, text] = value;
          if (field === 'description') setDescription(text);
          if (field === 'prerequisites') setPrerequisites(text);
          if (field === 'outcomes') setOutcomes(text);
        }
      });
    } catch (err) {
      console.error("Error loading course", err);
      setError("Failed to load course. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id, account, contractsLoaded, getCourseDetails, hasAccessToCourse, getCertifiatesNFTID]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!contractsLoaded && !error) {
        setError("Contracts are taking too long to load. Please refresh the page.");
        setLoading(false);
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [contractsLoaded, error]);

  const loadVectorInfo = useCallback(async (metadataCid) => {
    if (!metadataCid) return;
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/vector/courses/info/${metadataCid}`);
      setVectorInfo(data);
    } catch (err) {
      console.warn("Vector info fetch failed", err);
    }
  }, [BACKEND_URL]);

  const handleEnrollment = useCallback(async () => {
    if (!courseData || userTokens < courseData.price) {
      alert(`You need ${courseData.price - userTokens} more tokens.`);
      return;
    }
    try {
      await enrollInCourse(id);
      setIsEnrolled(true);
      setUserTokens(prev => prev - courseData.price);
    } catch (err) {
      console.error("Enrollment failed", err);
      alert("Enrollment failed.");
    }
  }, [courseData, userTokens, enrollInCourse, id]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  useEffect(() => {
    if (courseData?.metadataCid) loadVectorInfo(courseData.metadataCid);
  }, [courseData?.metadataCid, loadVectorInfo]);

  // Rendering
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent" />
          <p className="text-gray-700 font-medium">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <p className="text-red-600 mb-6 text-lg">{error}</p>
          <button 
            onClick={loadCourse} 
            className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition-all font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <p className="text-gray-700 text-lg">Course not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button 
            onClick={handleBackToCourses} 
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> 
            Back to Courses
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Course Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-wrap gap-3 mb-6">
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getDifficultyColor(courseData.difficulty)}`}>
              {courseData.difficulty}
            </span>
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
              {courseData.category}
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{courseData.title}</h1>
          
          {description && (
            <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">{description}</p>
          )}
        </div>

        {/* Main Content */}
        {isEnrolled ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Video Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[600px] flex flex-col">
                {showVideoPlayer ? (
                  <video
                    controls
                    className="w-full h-full object-cover"
                    src={`https://gateway.pinata.cloud/ipfs/${courseData.videoCid}`}
                    preload="metadata"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <button 
                      onClick={() => setShowVideoPlayer(true)} 
                      className="bg-white/20 p-6 rounded-full backdrop-blur-md hover:scale-110 transition-all shadow-lg"
                    >
                      <Play className="w-12 h-12 text-white" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* AI Chat Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 p-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  AI Assistant
                </h3>
                <p className="text-sm text-gray-600 mt-1">Get instant help with course content</p>
              </div>
              
              <div className="flex-1 overflow-hidden">
                {vectorInfo.documentCount === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <div className="bg-amber-50 p-8 rounded-2xl border-2 border-dashed border-amber-200 max-w-sm">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-amber-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-3">Setup Required</h4>
                      <p className="text-sm text-amber-700 mb-4">
                        Feed course data to enable AI assistance and get instant answers to your questions.
                      </p>
                      <IngestVectorButton courseId={id} courseData={courseData} />
                    </div>
                  </div>
                ) : (
                  <div className="h-full">
                    <CourseAIChat courseMetadataCid={courseData.metadataCid} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Enrollment Section for Non-enrolled Users */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-blue-50 p-6 rounded-2xl mb-6">
                <h3 className="text-3xl font-bold text-blue-600 mb-2">{courseData?.price} Tokens</h3>
                <p className="text-gray-600">One-time payment for lifetime access</p>
              </div>
              
              <button
                onClick={handleEnrollment}
                disabled={userTokens < (courseData?.price || 0)}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all shadow-lg ${
                  userTokens >= (courseData?.price || 0)
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:shadow-xl'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {userTokens >= (courseData?.price || 0) ? 'Enroll Now' : 'Insufficient Tokens'}
              </button>
              
              {userTokens < (courseData?.price || 0) && (
                <p className="text-red-500 text-sm mt-3">
                  You need {courseData.price - userTokens} more tokens to enroll.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Course Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Prerequisites */}
          {prerequisites && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center mb-4">
                <BookOpen className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">Prerequisites</h2>
              </div>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{prerequisites}</p>
            </div>
          )}

          {/* Learning Outcomes */}
          {outcomes && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center mb-4">
                <Target className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">Learning Outcomes</h2>
              </div>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{outcomes}</p>
            </div>
          )}
        </div>

        {/* Completion Section */}
        {isEnrolled && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {hasCompletedCourse ? (
              <div className="text-center bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200">
                <Award className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-green-700 mb-3">🎉 Congratulations!</h2>
                <p className="text-green-600 text-lg mb-6">
                  You've completed the course! Your NFT certificate is waiting in your Profile.
                </p>
                <button 
                  onClick={handleGoToProfile} 
                  className="px-8 py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  View Certificate in Profile
                </button>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Ready to Complete?</h3>
                <p className="text-gray-600 mb-6">Take the final quiz to earn your course certificate NFT.</p>
                <button
                  onClick={handleMarkCompleted}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Take Final Quiz
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;