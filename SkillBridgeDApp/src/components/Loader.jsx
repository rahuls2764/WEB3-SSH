// src/components/Loader.jsx
import React from 'react';

export default function Loader({ text = "Fetching questions..." }) {
  return (
    <div className="flex flex-col mx-auto items-center justify-center mt-10 text-mytofy-text-primary">
      {/* Glowing rotating ring */}
      <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg shadow-cyan-500/50" />

      {/* Optional text */}
      <p className="text-lg font-semibold text-center animate-pulse text-mytofy-fade-green">
        {text}
      </p>
    </div>
  );
}
