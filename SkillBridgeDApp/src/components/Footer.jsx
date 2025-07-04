// src/components/Footer.jsx
import React from 'react';
import { Mail, Phone, Instagram, Linkedin } from 'lucide-react';

const developers = [
  {
    name: "Ketan Dayke",
    email: "ketandayke@gmail.com",
    phone: "7247789391",
    instagram: "https://www.instagram.com/ketan_dayke/",
    linkedin: "https://www.linkedin.com/in/ketan-dayke-kd050703/",
  },
  {
    name: "Rahul Soni",
    email: "sonirahul2764@gmail.com",
    phone: "9549066685",
    instagram: "https://www.instagram.com/rahul_soni.4/",
    linkedin: "https://www.linkedin.com/in/rahul-soni-56b165280/",
  }
];

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-900 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">👨‍💻 Meet the Developers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {developers.map((dev, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold text-white mb-2">{dev.name}</h3>
              <ul className="text-sm space-y-2 text-gray-200">
                <li className="flex items-center gap-2">
                  <Mail size={16} className="text-indigo-400" />
                  <a href={`mailto:${dev.email}`} className="hover:underline">{dev.email}</a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={16} className="text-green-400" />
                  <span>{dev.phone}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Instagram size={16} className="text-pink-400" />
                  <a href={dev.instagram} target="_blank" rel="noreferrer" className="hover:underline">
                    Instagram
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Linkedin size={16} className="text-blue-400" />
                  <a href={dev.linkedin} target="_blank" rel="noreferrer" className="hover:underline">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 text-sm text-gray-400">
          © {new Date().getFullYear()} SkillBridge | Built with 💙 by Ketan & Rahul
        </div>
      </div>
    </footer>
  );
}
