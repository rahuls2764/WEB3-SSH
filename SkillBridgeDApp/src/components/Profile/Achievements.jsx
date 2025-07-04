import React from 'react';
import { Trophy, Star, Coins, Target, CheckCircle } from 'lucide-react';

const iconMap = {
  trophy: Trophy,
  star: Star,
  coins: Coins,
  target: Target,
};

export default function Achievements({ achievements }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-yellow-500">
        <Trophy /> Achievements
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((a) => {
          const Icon = iconMap[a.icon] || Trophy;
          return (
            <div
              key={a.id}
              className={`p-4 rounded-xl border transition shadow-sm hover:shadow-md ${
                a.unlocked ? 'bg-white' : 'bg-gray-100 opacity-70'
              }`}
            >
              <div className="flex gap-3 items-center">
                <Icon className={`w-6 h-6 ${a.unlocked ? 'text-yellow-500' : 'text-gray-400'}`} />
                <div>
                  <h3 className={`font-semibold ${a.unlocked ? 'text-gray-800' : 'text-gray-400'}`}>{a.title}</h3>
                  <p className="text-sm text-gray-500">{a.description}</p>
                </div>
                {a.unlocked && <CheckCircle className="text-green-500 ml-auto" size={18} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
