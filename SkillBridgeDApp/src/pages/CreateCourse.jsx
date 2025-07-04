import React, { useState, useEffect } from 'react';
import { Upload, Plus, X, Eye, Save, Video, FileText, Zap, CheckCircle, AlertCircle, Sparkles, Wand2 } from 'lucide-react';
import FetchQuiz from '../utils/FetchQuiz';
import { categories } from '../utils/CourseCategories';
import { uploadCourseContentToIPFS } from '../services/IpfsUploadService';
import { useWeb3 } from '../context/Web3Context';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';

const CreateCourse = () => {
  const [step, setStep] = useState(1);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: '',
    price: '',
    duration: '',
    videoFile: null,
    thumbnail: null,
    prerequisites: [''],
    learningOutcomes: ['']
  });
  const [quizData, setQuizData] = useState({
    questions: [
      {
        id: Date.now(),
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 10
      }
    ],
    passingScore: 70,
    timeLimit: 30
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [aiGeneratedQuizPreview, setAiGeneratedQuizPreview] = useState([]);
  const [showAiQuizGenerator, setShowAiQuizGenerator] = useState(false);
  const { provider, signer, account, connectWallet, contracts } = useWeb3();
  const skillBridgeMainContract = contracts?.skillBridge;
  const tokenContract = contracts?.token;

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const handleInputChange = (field, value) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayFieldChange = (field, index, value) => {
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field) => {
    setCourseData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field, index) => {
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? { ...q, options: q.options.map((opt, j) => j === optionIndex ? value : opt) }
          : q
      )
    }));
  };

  const addQuestion = () => {
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        id: Date.now(),
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 10
      }]
    }));
  };

  const removeQuestion = (idToRemove) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== idToRemove)
    }));
  };

  const addAiQuestionToQuiz = (questionToAdd) => {
    const optionsArray = [
      questionToAdd.options.a,
      questionToAdd.options.b,
      questionToAdd.options.c,
      questionToAdd.options.d
    ];
    const answerIndex = questionToAdd.answer.charCodeAt(0) - 'a'.charCodeAt(0);

    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        id: questionToAdd._id || Date.now(),
        question: questionToAdd.question,
        options: optionsArray,
        correctAnswer: answerIndex,
        points: 10
      }]
    }));
    setAiGeneratedQuizPreview(prev => prev.filter(q => q._id !== questionToAdd._id));
  };

  const addAllAiQuestionsToQuiz = () => {
    const transformedQuestions = aiGeneratedQuizPreview.map(questionToAdd => {
      const optionsArray = [
        questionToAdd.options.a,
        questionToAdd.options.b,
        questionToAdd.options.c,
        questionToAdd.options.d
      ];
      const answerIndex = questionToAdd.answer.charCodeAt(0) - 'a'.charCodeAt(0);
      return {
        id: questionToAdd._id || Date.now(),
        question: questionToAdd.question,
        options: optionsArray,
        correctAnswer: answerIndex,
        points: 10
      };
    });
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, ...transformedQuestions]
    }));
    setAiGeneratedQuizPreview([]);
  };

  const handleFileUpload = (field, file) => {
    setCourseData(prev => ({ ...prev, [field]: file }));
  };

  const simulateUpload = async () => {
    setIsUploading(true);
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleSubmit = async () => {
    if (!provider || !signer || !skillBridgeMainContract) {
      toast.error("Web3 provider not connected. Please connect your wallet.");
      connectWallet();
      return;
    }
  
    setIsUploading(true);
    setUploadProgress(0);
    toast.loading("Starting course upload to IPFS and Blockchain...", { id: "course-upload" });
  
    try {
      const ipfsMetadataHash = await uploadCourseContentToIPFS(courseData, quizData, setUploadProgress);
      toast.success("All content uploaded to IPFS!", { id: "course-upload" });
      
      setUploadProgress(75);
      toast.loading("Confirm transaction in your wallet...", { id: "blockchain-tx" });
  
      const priceInTokens = ethers.parseUnits(courseData.price.toString(), 18);
  
      const tx = await skillBridgeMainContract.createCourse(
        ipfsMetadataHash,
        courseData.title,
        priceInTokens,
      );
  
      setUploadProgress(90);
      toast.loading("Transaction sent. Waiting for confirmation...", { id: "blockchain-tx" });
      await tx.wait();
      setUploadProgress(100);
  
      toast.success("Course created successfully on SkillBridge!", { id: "course-upload" });
      toast.dismiss("blockchain-tx");
  
      setCourseData({
        title: '',
        description: '',
        category: '',
        difficulty: '',
        price: '',
        duration: '',
        videoFile: null,
        thumbnail: null,
        prerequisites: [''],
        learningOutcomes: ['']
      });
  
      setQuizData({
        questions: [
          { id: Date.now(), question: '', options: ['', '', '', ''], correctAnswer: 0, points: 10 }
        ],
        passingScore: 70,
        timeLimit: 30
      });
  
      setStep(1);
    } catch (error) {
      console.error("Failed to create course:", error);
      toast.error(`Failed to create course: ${error.message || error}`, { id: "course-upload" });
      toast.dismiss("blockchain-tx");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  const generateQuestionsWithAi = async () => {
    if (!courseData.category || !courseData.title || !courseData.description || !courseData.difficulty) {
      alert("Please fill in Course Title, Description, Category, and Difficulty in Step 1 before generating AI questions.");
      return;
    }

    setIsGeneratingQuiz(true);
    setAiGeneratedQuizPreview([]);

    const prompt = `You are a strict JSON API.
    **Generate exactly 10 multiple-choice questions.**
    The questions are for a course titled "${courseData.title}" on the topic of ${courseData.category}.
    The course is for a ${courseData.difficulty} level audience.
    Here is a brief description of the course: "${courseData.description}".
    Each question must have:
    - A "question" field (the question text).
    - An "options" object with four keys: "a", "b", "c", "d", each containing a string option.
    - An "answer" field containing the correct option key ("a", "b", "c", or "d").
    Ensure the questions are relevant to the course title, category, description, and difficulty level.
    Respond ONLY with a JSON array of question objects. Example format:
    [
      {
        "_id": "unique-uuid-1",
        "question": "What is the capital of France?",
        "options": {
          "a": "Berlin",
          "b": "Madrid",
          "c": "Paris",
          "d": "Rome"
        },
        "answer": "c"
      }
    ]`;

    try {
      const data = await FetchQuiz({ prompt });
      if (Array.isArray(data)) {
        setAiGeneratedQuizPreview(data);
      } else {
        console.error("AI response was not an array:", data);
        alert("Failed to generate questions. AI did not return a valid format.");
      }
    } catch (error) {
      console.error("Error generating AI questions:", error);
      alert("An error occurred while generating questions with AI. Please try again.");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map(num => (
        <div key={num} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
            step >= num
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
              : 'bg-gray-200 text-gray-500'
          }`}>
            {num}
          </div>
          {num < 3 && (
            <div className={`h-1 w-16 mx-4 ${
              step > num ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
          <input
            type="text"
            value={courseData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter course title"
            className="w-full px-4 py-3 border bg-gray-300 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <div className="relative">
            <select
              value={courseData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-4 py-3 border bg-gray-300 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
          <div className="relative">
            <select
              value={courseData.difficulty}
              onChange={(e) => handleInputChange('difficulty', e.target.value)}
              className="w-full px-4 py-3 border bg-gray-300 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
            >
              <option value="">Select difficulty</option>
              {difficulties.map(diff => (
                <option key={diff} value={diff.toLowerCase()}>{diff}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price (Tokens)</label>
          <div className="relative">
            <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-500 w-5 h-5" />
            <input
              type="number"
              value={courseData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="0"
              className="w-full pl-10 pr-4 py-3 border bg-gray-300 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Course Description</label>
        <textarea
          value={courseData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe what students will learn in this course And add Syllabus properly"
          rows={4}
          className="w-full px-4 py-3 border bg-gray-300 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          minLength={500}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prerequisites</label>
          {courseData.prerequisites.map((prereq, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={prereq}
                onChange={(e) => handleArrayFieldChange('prerequisites', index, e.target.value)}
                placeholder="Enter prerequisite"
                className="flex-1 px-4 py-2 border bg-gray-300 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {index > 0 && (
                <button
                  onClick={() => removeArrayField('prerequisites', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => addArrayField('prerequisites')}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-sm flex items-center text-white py-2 px-4 rounded-lg mt-2"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Prerequisite
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Learning Outcomes</label>
          {courseData.learningOutcomes.map((outcome, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={outcome}
                onChange={(e) => handleArrayFieldChange('learningOutcomes', index, e.target.value)}
                placeholder="What will students learn?"
                className="flex-1 px-4 py-2 border bg-gray-300 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {index > 0 && (
                <button
                  onClick={() => removeArrayField('learningOutcomes', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => addArrayField('learningOutcomes')}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-sm flex items-center text-white py-2 px-4 rounded-lg mt-2"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Learning Outcome
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Course Video</label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Upload your course video</p>
            <p className="text-sm text-gray-500 mb-4">MP4, MOV, AVI up to 500MB</p>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleFileUpload('videoFile', e.target.files[0])}
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition-all"
            >
              Choose File
            </label>
            {courseData.videoFile && (
              <p className="text-sm text-green-600 mt-2">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                {courseData.videoFile.name}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Course Thumbnail</label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Upload thumbnail image</p>
            <p className="text-sm text-gray-500 mb-4">PNG, JPG up to 5MB</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload('thumbnail', e.target.files[0])}
              className="hidden"
              id="thumbnail-upload"
            />
            <label
              htmlFor="thumbnail-upload"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition-all"
            >
              Choose File
            </label>
            {courseData.thumbnail && (
              <p className="text-sm text-green-600 mt-2">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                {courseData.thumbnail.name}
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Duration</label>
        <input
          type="text"
          value={courseData.duration}
          onChange={(e) => handleInputChange('duration', e.target.value)}
          placeholder="e.g., 2 hours, 30 minutes"
          className="w-full px-4 py-3 border bg-gray-300 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Course Quiz</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAiQuizGenerator(prev => !prev)}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all flex items-center"
          >
            <Wand2 className="w-4 h-4 inline mr-1" />
            {showAiQuizGenerator ? 'Hide AI Generator' : 'AI Quiz Generator'}
          </button>
          <button
            onClick={addQuestion}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Add Manual Question
          </button>
        </div>
      </div>

      {showAiQuizGenerator && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6 space-y-4">
          <h3 className="text-xl font-semibold text-blue-800 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
            AI Quiz Question Generator
          </h3>
          <p className="text-blue-700 text-sm">
            Based on your course details, the AI will generate multiple-choice questions. Review them below and add the ones you like to your quiz.
          </p>
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-2">AI Prompt (uneditable)</label>
            <textarea
              value={`Generate 10 multiple-choice questions for the course "${courseData.title}" on ${courseData.category}, aimed at a ${courseData.difficulty} level, based on this description: "${courseData.description}". Each must have a question, 4 options (a-d), and a correct answer (a-d). Respond ONLY with JSON.`}
              rows={5}
              readOnly
              className="w-full px-4 py-3 border bg-gray-300 border-blue-200 rounded-xl bg-blue-100 text-blue-800 resize-none"
            />
          </div>
          <button
            onClick={generateQuestionsWithAi}
            disabled={isGeneratingQuiz || !courseData.category || !courseData.title || !courseData.description || !courseData.difficulty}
            className="bg-blue-600  px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isGeneratingQuiz ? (
              <>
                <Zap className="w-4 h-4 inline mr-2 animate-pulse" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 inline mr-2" />
                Generate Questions
              </>
            )}
          </button>

          {isGeneratingQuiz && (
            <div className="flex items-center text-blue-700">
              <AlertCircle className="w-5 h-5 mr-2 animate-spin" />
              Generating AI questions, please wait...
            </div>
          )}

          {aiGeneratedQuizPreview.length > 0 && (
            <div className="mt-6 border-t pt-6 border-blue-200">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">Generated Questions Preview</h3>
              <div className="space-y-4">
                {aiGeneratedQuizPreview.map((question, qIndex) => (
                  <div key={question._id || `ai-q-${qIndex}`} className="bg-blue-100 rounded-lg p-4 shadow-sm relative">
                    <p className="font-medium text-blue-900 mb-2">Q{qIndex + 1}: {question.question}</p>
                    <ul className="list-disc list-inside text-blue-800 text-sm">
                      {Object.entries(question.options).map(([key, value]) => (
                        <li key={key} className={question.answer === key ? 'font-semibold text-green-700' : ''}>
                          {key.toUpperCase()}. {value} {question.answer === key && <CheckCircle className="w-3 h-3 inline ml-1 text-green-600" />}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => addAiQuestionToQuiz(question)}
                      className="absolute top-4 right-4 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-all"
                      title="Add this question to quiz"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addAllAiQuestionsToQuiz}
                className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all w-full flex items-center justify-center"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add All Generated Questions to Quiz
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Passing Score (%)</label>
          <input
            type="number"
            value={quizData.passingScore}
            onChange={(e) => setQuizData(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
            className="w-full px-4 py-3 border bg-gray-300 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (minutes)</label>
          <input
            type="number"
            value={quizData.timeLimit}
            onChange={(e) => setQuizData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
            className="w-full px-4 py-3 border bg-gray-300 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="space-y-6">
        {quizData.questions.map((question, qIndex) => (
          <div key={question.id || qIndex} className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Question {qIndex + 1}</h3>
              {quizData.questions.length > 0 && (
                <button
                  onClick={() => removeQuestion(question.id)}
                  className="text-red-500 bg-gray-300 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
              <textarea
                value={question.question}
                onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                placeholder="Enter your question"
                rows={2}
                className="w-full px-4 py-3 border bg-gray-300 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center">
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={question.correctAnswer === oIndex}
                    onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                    className="mr-3 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                    placeholder={`Option ${oIndex + 1}`}
                    className="flex-1 px-4 py-2 border bg-gray-300 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <label className="text-sm font-medium text-gray-700 mr-2">Points:</label>
                <input
                  type="number"
                  value={question.points}
                  onChange={(e) => handleQuestionChange(qIndex, 'points', parseInt(e.target.value))}
                  className="w-20 px-3 py-1 border bg-gray-300 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 inline mr-1 text-green-500" />
                Correct answer: Option {question.correctAnswer + 1}
              </div>
            </div>
          </div>
        ))}
        {quizData.questions.length === 0 && (
          <div className="text-center text-gray-500 py-4 border border-dashed border-gray-300 rounded-lg">
            No quiz questions added yet. Add a manual question or generate some with AI!
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Create New Course
            </h1>
            <p className="text-gray-600">Share your expertise and earn tokens</p>
          </div>

          {renderStepIndicator()}

          <div className="mb-8">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </div>

          {isUploading && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Uploading course...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                step === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-cyan-500 text-gray-700 hover:bg-cyan-700'
              }`}
            >
              Previous
            </button>

            <div className="flex space-x-4">
              <button
                onClick={() => {}}
                className="px-6 py-3 border bg-cyan-500 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-cyan-700 transition-all"
              >
                <Save className="w-4 h-4 inline mr-2" />
                Save Draft
              </button>

              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50"
                >
                  {isUploading ? 'Publishing...' : 'Publish Course'}
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 text-center">
            <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-indigo-600 hover:to-purple-700 font-medium">
              <Eye className="w-4 h-4 inline mr-1" />
              Preview Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;