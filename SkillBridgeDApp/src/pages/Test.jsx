// src/pages/Test.jsx
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, Award, CheckCircle, XCircle, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import TestQuizQuestions from '../utils/TestQuizQuestions';
import Loader from '../components/Loader';
import { uploadCourseResult } from '../services/IpfsUploadService';
import axios from "axios";

const Test = () => {
  const { account, completeTest, getUserData, getUserProfileCID, getCourseQuiz, markCourseAsCompleted } = useWeb3();
  const [searchParams] = useSearchParams();
  const testType = searchParams.get('type') || 'entry';
  const courseId = searchParams.get('courseId');

  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(180);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState([]);
  const [testPassed, setTestPassed] = useState(false);
  const [finalPercentage, setFinalPercentage] = useState(0);
  
  const [courseTitle, setCourseTitle] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (account) {
        const data = await getUserData();
        setUserData(data);
        const enrolled = data?.coursesEnrolled?.includes(courseId);
        if (enrolled) setIsEnrolled(true);
      }
    };
    fetchUserData();
  }, [account, courseId, getUserData]);

  useEffect(() => {
    let timer;
    if (hasStarted && timeLeft > 0 && !isSubmitted) {
      timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, hasStarted, isSubmitted]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleAnswer = (questionIndex, selectedOption) => {
    if (isSubmitted) return;
    setAnswers({ ...answers, [questionIndex]: selectedOption });
  };

  const handleQuizStart = async () => {
    setLoading(true);
    let quizMeta = {};
    try {
      if (testType === 'entry') {
        const data = await TestQuizQuestions();
        quizMeta = { questions: data, passingScore: 70, timeLimit: 3 };
      } else if (testType === 'course' && courseId) {
        if (!isEnrolled) {
          toast.error("You must be enrolled to take this quiz.");
          setLoading(false);
          return;
        }
        quizMeta = await getCourseQuiz(courseId);
      }

      setQuestions(quizMeta.questions);
      setPassingScore(quizMeta.passingScore);
      setTimeLeft(quizMeta.timeLimit * 60);
      setCourseTitle(quizMeta.courseTitle);
      setHasStarted(true);
    } catch (err) {
      toast.error("Failed to load quiz questions.");
    } finally {
      setLoading(false);
    }
  };

  const [certificateCid, setCertificateCid] = useState(null);
  const [showMintButton, setShowMintButton] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitted(true);
    const total = questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0);
    setScore(total);
    const percent = (total / questions.length) * 100;
    setFinalPercentage(percent);
    setLoading(true);

    try {
      if (testType === 'entry') {
        await completeTest(total);
        toast.success(`Test submitted! You earned ${total} SBT tokens.`);
        setTestPassed(true);
      } else if (testType === 'course') {
        if (percent >= passingScore) {
          setTestPassed(true);
          setShowMintButton(true);
          toast.success("🎉 You passed! Mint your certificate.");
        } else {
          setTestPassed(false);
          toast.error(`You scored ${percent.toFixed(1)}%. Minimum ${passingScore}% required.`);
        }
      }
    } catch (err) {
      toast.error("Error submitting test.");
    } finally {
      setLoading(false);
    }
  };

  const handleMintCertificate = async () => {
    try {
      setLoading(true);

      const cid = await getUserProfileCID(account);
      console.log("this is profile cide", cid);
      let profile;
      if (cid) {
        const ipfsURL = `https://gateway.pinata.cloud/ipfs/${cid}`;
        const profileResponse = await axios.get(ipfsURL);
        profile = profileResponse.data;
      }

      console.log("this is profile", profile);
      const quizResult = {
        courseId,
        courseTitle,
        userAddress: account,
        userName: profile?.userName || "Anonymous",
        userEmail: profile?.email || "NA",
        answers,
        score,
        total: questions.length,
        percentage: finalPercentage,
        completedAt: new Date().toISOString(),
      };
      console.log('this is quiz result to send to backend', quizResult);
      const resultCID = await uploadCourseResult({ quizResult });
      console.log("this is resultcide and courseId and isenrolled", resultCID, courseId, isEnrolled);
      await markCourseAsCompleted(courseId, resultCID);
      setCertificateCid(resultCID);
      setShowMintButton(false);
      toast.success("📜 Certificate minted successfully!");
    } catch (err) {
      toast.error("Failed to mint certificate.");
    } finally {
      setLoading(false);
    }
  };

  const restartTest = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setScore(0);
    setIsSubmitted(false);
    setTimeLeft(300);
    setHasStarted(false);
    setTestPassed(false);
    setShowMintButton(false);
    setFinalPercentage(0);
  };

  if (!account) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 text-center">
        <div className="max-w-xl mx-auto mt-20 bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-lg">
          <Trophy size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2 text-slate-800">Access Denied</h2>
          <p className="text-slate-600">Please connect your wallet to start the test.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            {testType === 'entry' ? 'SkillBridge Entry Test' : 'Course Completion Quiz'}
          </h1>
          {hasStarted && !isSubmitted && (
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-lg shadow-md border border-gray-200">
              <Clock size={20} className="text-blue-600" />
              <span className="font-semibold text-slate-800">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        {!hasStarted ? (
          <div className="text-center space-y-8">
            {testType === 'entry' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">1 Free Attempt</h3>
                  <p className="text-slate-600">Your first test is free. Retakes cost 2 SBT.</p>
                </div>
                <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">Time Limit: 3 Minutes</h3>
                  <p className="text-slate-600">Answer as many questions as possible.</p>
                </div>
                <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">Earn Tokens</h3>
                  <p className="text-slate-600">Each correct answer = 1 SBT.</p>
                </div>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-lg border border-gray-200 text-left max-w-2xl mx-auto">
                <h2 className="text-xl text-blue-600 font-semibold mb-4">Course Quiz Rules</h2>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Score at least {passingScore}% to pass.
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    You have {Math.floor(timeLeft / 60)} minutes to finish.
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Certificate NFT is unlocked after passing.
                  </li>
                </ul>
              </div>
            )}

            <div className="mt-8">
              {loading ? (
                <div className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-lg border border-gray-200">
                  <Loader />
                </div>
              ) : (
                <button
                  onClick={handleQuizStart}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  {testType === 'entry'
                    ? userData?.hasCompletedTest ? "Retake Test (2 SBT)" : "Start Test"
                    : "Start Course Quiz"}
                </button>
              )}
            </div>
          </div>
        ) : !isSubmitted ? (
          <div className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-lg border border-gray-200">
            {/* Progress */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-slate-600">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 ml-4">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-6 text-slate-800">{questions[currentQuestion]?.question}</h2>
            
            <div className="grid gap-3 mb-8">
              {Object.entries(questions[currentQuestion]?.options || {}).map(([key, option]) => (
                <button
                  key={key}
                  className={`border px-6 py-4 rounded-lg text-left transition-all duration-200 ${
                    answers[currentQuestion] === key 
                      ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-md' 
                      : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-blue-300 hover:shadow-md'
                  }`}
                  onClick={() => handleAnswer(currentQuestion, key)}
                >
                  <span className="font-semibold text-blue-600">{key.toUpperCase()}.</span> <span className="text-slate-700">{option}</span>
                </button>
              ))}
            </div>
            
            <div className="flex justify-between">
              <button
                disabled={currentQuestion === 0}
                className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                  currentQuestion === 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700 border border-blue-200 hover:border-blue-300'
                }`}
                onClick={() => setCurrentQuestion((prev) => prev - 1)}
              >
                ← Previous
              </button>
              
              {currentQuestion < questions.length - 1 ? (
                <button 
                  className="px-6 py-3 text-blue-600 hover:bg-blue-50 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-lg transition-all duration-200" 
                  onClick={() => setCurrentQuestion((prev) => prev + 1)}
                >
                  Next →
                </button>
              ) : (
                <button
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-all duration-200 disabled:opacity-50 shadow-md"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Test'}
                </button>
              )}
            </div>
          </div>
        ) : (
          // Results Section
          <div className="text-center space-y-8">
            {testType === 'entry' ? (
              // Entry Test Results
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-lg border border-gray-200">
                  <Award size={48} className="mx-auto text-yellow-500 mb-4" />
                  <h2 className="text-2xl font-bold text-green-600 mb-4">Entry Test Completed!</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-slate-600 mb-1">Score:</p>
                      <p className="text-2xl font-bold text-blue-600">{score} / {questions.length}</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                      <p className="text-slate-600 mb-1">Percentage:</p>
                      <p className="text-2xl font-bold text-green-600">{finalPercentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                    <p className="text-lg text-yellow-700 font-semibold">
                      🎉 You've earned {score} SBT tokens!
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-md"
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard
                  </button>
                  <button 
                    className="px-8 py-3 bg-white hover:bg-gray-50 text-slate-700 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 shadow-md"
                    onClick={restartTest}
                  >
                    Retake Test
                  </button>
                </div>
              </div>
            ) : (
              // Course Test Results
              <div className="space-y-6">
                {testPassed ? (
                  // Passed Course Test
                  <div className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-lg border border-gray-200">
                    <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold text-green-600 mb-2">Congratulations! 🎉</h2>
                    <p className="text-lg text-slate-600 mb-6">You passed the course quiz!</p>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-slate-600 mb-1">Your Score:</p>
                          <p className="text-2xl font-bold text-green-600">{score} / {questions.length}</p>
                        </div>
                        <div>
                          <p className="text-slate-600 mb-1">Percentage:</p>
                          <p className="text-2xl font-bold text-green-600">{finalPercentage.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-slate-600 mb-1">Required:</p>
                          <p className="text-2xl font-bold text-blue-600">{passingScore}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 mb-6">
                      <Trophy size={32} className="mx-auto text-yellow-500 mb-2" />
                      <h3 className="text-xl font-semibold text-purple-700 mb-2">Certificate Unlocked!</h3>
                      {showMintButton ? (
                        <>
                          <p className="text-slate-600 mb-4">You can now mint your course completion certificate as an NFT.</p>
                          <button
                            onClick={handleMintCertificate}
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-md"
                          >
                            Mint Certificate NFT
                          </button>
                        </>
                      ) : (
                        <p className="text-green-600 font-semibold">Certificate minted successfully! 🎊</p>
                      )}
                    </div>
                  </div>
                ) : (
                  // Failed Course Test
                  <div className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-lg border border-gray-200">
                    <XCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Quiz Not Passed</h2>
                    <p className="text-lg text-slate-600 mb-6">You need to score higher to pass this course.</p>
                    
                    <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-6 border border-red-200 mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-slate-600 mb-1">Your Score:</p>
                          <p className="text-2xl font-bold text-red-600">{score} / {questions.length}</p>
                        </div>
                        <div>
                          <p className="text-slate-600 mb-1">Percentage:</p>
                          <p className="text-2xl font-bold text-red-600">{finalPercentage.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-slate-600 mb-1">Required:</p>
                          <p className="text-2xl font-bold text-blue-600">{passingScore}%</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-red-200">
                        <p className="text-red-600 font-medium">
                          You need {(passingScore - finalPercentage).toFixed(1)}% more to pass.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-md"
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard
                  </button>
                  <button 
                    className="px-8 py-3 bg-white hover:bg-gray-50 text-slate-700 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 shadow-md"
                    onClick={restartTest}
                  >
                    Retake Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Test;