// src/components/Dashboard/CourseList.jsx
import { BookOpen, Play, Clock, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CourseList({ courses, type, onEnroll, currentTokenBalance, purchaseLoading }) {
  const navigate = useNavigate();
  const isEnrolledSection = type === "enrolled";

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-800">
        {isEnrolledSection ? <Play className="text-indigo-500" /> : <BookOpen className="text-indigo-500" />}
        {isEnrolledSection ? "Continue Learning" : "Available Courses"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {courses.map(course => (
          <div
            key={course.courseId}
            className="bg-white/80 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition overflow-hidden backdrop-blur-sm"
          >
            <div className="h-40 bg-gray-100 flex items-center justify-center">
              {course.thumbnailCid ? (
                <img
                  src={`https://gateway.pinata.cloud/ipfs/${course.thumbnailCid}`}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <BookOpen size={32} className="text-indigo-400" />
              )}
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-base text-slate-800 mb-1 truncate">{course.title}</h3>
              <p className="text-gray-500 text-sm mb-2 truncate">by {course.instructor?.slice(0, 10)}...</p>

              {course.duration && (
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                  <Clock size={14} />
                  <span>{course.duration}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                {isEnrolledSection ? (
                  <button
                    onClick={() => navigate(`/courses/${course.courseId}`)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={() => onEnroll(course.courseId, course.price)}
                    disabled={purchaseLoading[course.courseId] || currentTokenBalance < course.price}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors ${
                      currentTokenBalance < course.price
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-indigo-500 text-white hover:bg-indigo-600"
                    }`}
                  >
                    {purchaseLoading[course.courseId] ? (
                      "Enrolling..."
                    ) : (
                      <>
                        <ShoppingCart size={14} />
                        Enroll
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
