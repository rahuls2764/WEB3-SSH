// src/components/Dashboard/QuickActions.jsx
import { Target, ShoppingCart, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function QuickActions({ hasCompletedTest }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionCard
          icon={<Target size={20} className="text-blue-500" />}
          title={hasCompletedTest ? "Retake Test" : "Take Test"}
          subtitle={hasCompletedTest ? "Improve your score" : "Earn tokens"}
          onClick={() => navigate("/test")}
        />
        <ActionCard
          icon={<ShoppingCart size={20} className="text-green-500" />}
          title="Buy Tokens"
          subtitle="Purchase with ETH"
          onClick={() => navigate("/buy-tokens")}
        />
        <ActionCard
          icon={<Award size={20} className="text-purple-500" />}
          title="Create Course"
          subtitle="Share your knowledge"
          onClick={() => navigate("/create-course")}
        />
      </div>
    </div>
  );
}

function ActionCard({ icon, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-5 border border-gray-300 rounded-xl bg-gray-100 hover:shadow-lg hover:border-cyan-500 transition flex gap-3 items-start cursor-pointer"
    >
      <div className="mt-1">{icon}</div>
      <div>
        <p className="font-semibold text-gray-800">{title}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </button>
  );
}
