import React from "react";
import { Target, Zap, Trophy, BookOpenCheck, Upload, TrendingUp, DollarSign } from "lucide-react";

export default function HowItWorks() {
  return (
    <section className="py-16 ">
      <div className="max-w-7xl mx-auto px-4">
      

        {/* 🎓 Instructor Section */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800">
          For Instructors
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Instructor Flow Steps */}
          <Step
            icon={<BookOpenCheck className="text-blue-600" />}
            title="Create a Course"
            description="Design engaging courses with video, text, and quizzes."
          />
          <Step
            icon={<Upload className="text-purple-600" />}
            title="Upload & Publish"
            description="Securely upload content to IPFS and list your course on-chain."
          />
          <Step
            icon={<TrendingUp className="text-green-600" />}
            title="Reach Learners"
            description="Your course will be discoverable and accessible to all learners with tokens."
          />
          <Step
            icon={<DollarSign className="text-emerald-600" />}
            title="Earn 80% Revenue"
            description="Earn 80% of each sale in tokens. 20% supports the SkillBridge platform."
          />
        </div>
      </div>
    </section>
  );
}

function Step({ icon, title, description }) {
  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition group">
      <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-white shadow group-hover:scale-105 transition">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
