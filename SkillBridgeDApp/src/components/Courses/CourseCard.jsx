// src/components/Courses/CourseCard.jsx
import React from 'react';
import { Zap, BookOpen, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CourseCard({ course, userTokens,onEnroll,loadingCourseId }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden group border border-gray-200 h-[25rem]">
      {/* Thumbnail */}
      <div className="h-3/5 relative">
        {course.thumbnailCid ? (
          <img
            src={`https://gateway.pinata.cloud/ipfs/${course.thumbnailCid}`}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-indigo-500 to-purple-600">
            <BookOpen className="text-white opacity-70 w-10 h-10" />
          </div>
        )}

        {/* Difficulty Tag */}
        <div className="absolute top-3 left-3 bg-gray-800/80 text-white text-xs px-3 py-1 rounded-full capitalize backdrop-blur">
          {course.difficulty || 'General'}
        </div>

        {/* Enrolled Tag */}
        {course.isEnrolled && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow">
            Enrolled
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col justify-between h-2/5">
       <div>
       <h3 className="font-semibold text-lg text-gray-800 group-hover:text-indigo-600 transition ">
          {course.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{course.description}</p>

        <div className="flex justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            {course.duration || 'Self-paced'}
          </div>
          <div className="flex items-center gap-1">
            <Users size={14} />
            {course.enrollmentCount || 0}
          </div>
        </div>
       </div>

        <div className="flex justify-between items-center ">
          <div className="flex items-center gap-1 text-indigo-600 font-medium">
            <Zap size={16} />
            <span>{course.price} Tokens</span>
          </div>
          {course.isEnrolled ? (
            <button
              onClick={() => navigate(`/courses/${course.courseId}`)}
              className="text-sm px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition"
            >
              Watch
            </button>
          ) : (
            <button
            onClick={() => onEnroll(course.courseId, course.price)}
            disabled={userTokens < course.price || loadingCourseId === course.courseId}
            className={`text-sm px-4 py-2 rounded-full transition ${
              userTokens >= course.price && loadingCourseId !== course.courseId
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loadingCourseId === course.courseId ? 'Processing...' : 'Enroll'}
          </button>
          
          )}
        </div>
      </div>
    </div>
  );
}
