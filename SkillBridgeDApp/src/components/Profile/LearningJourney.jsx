import React from 'react';
import { CheckCircle, Clock, Medal, Target } from 'lucide-react';

export default function LearningJourney({ user }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-blue-600">📘 Learning Journey</h2>
      <div className="space-y-4">
        <div className="flex justify-between p-4 bg-gray-100 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-500" />
            <div>
              <p className="font-semibold text-gray-800">Joined SkillBridge</p>
              <p className="text-sm text-gray-500">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'From the beginning'}
              </p>
            </div>
          </div>
          <span className="text-sm text-green-500">Completed</span>
        </div>

        <div className="flex justify-between p-4 bg-gray-100 rounded-lg">
          <div className="flex items-center gap-3">
            <Target className="text-yellow-500" />
            <div>
              <p className="font-semibold text-gray-800">Entry Test Score</p>
              <p className="text-sm text-gray-500">{user?.testScore || 0}/10</p>
            </div>
          </div>
          <span className="text-sm text-yellow-500">Completed</span>
        </div>

        <div className="flex justify-between p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <div className="flex items-center gap-3">
            <Medal className="text-gray-400" />
            <div>
              <p className="font-semibold text-gray-500">Earn NFT Certificate</p>
              <p className="text-sm text-gray-400">Pass course quiz to earn</p>
            </div>
          </div>
          <span className="text-sm text-gray-400">Pending</span>
        </div>
      </div>
    </div>
  );
}
