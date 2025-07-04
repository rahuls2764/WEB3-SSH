// src/components/Dashboard/StatsCards.jsx
import { BookOpen, Award, CheckCircle, Target } from "lucide-react";

export default function StatsCards({ userData, enrolledCount }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      <Card
        label="Courses Enrolled"
        value={enrolledCount}
        icon={<BookOpen />}
        color="text-cyan-500"
      />
      <Card
        label="Completed"
        value={userData?.coursesCompleted || 0}
        icon={<CheckCircle />}
        color="text-green-500"
      />
      <Card
        label="Tokens Earned"
        value={parseFloat(userData?.tokensEarned || 0).toFixed(2)}
        icon={<Award />}
        color="text-purple-500"
      />
      <Card
        label="Test Score"
        value={userData?.testScore || 0}
        icon={<Target />}
        color="text-yellow-500"
      />
    </div>
  );
}

function Card({ label, value, icon, color }) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl flex justify-between items-center hover:shadow-md transition">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
      <div className={`text-3xl ${color}`}>{icon}</div>
    </div>
  );
}
