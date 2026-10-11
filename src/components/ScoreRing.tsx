import React from "react";

interface ScoreRingProps {
  score: number;
  maxScore: number;
  threshold?: number; // threshold ratio, default 0.6 (60%)
}

export default function ScoreRing({ score, maxScore, threshold = 0.6 }: ScoreRingProps) {
  const pct = maxScore > 0 ? Math.min(Math.max(score / maxScore, 0), 1) : 0;
  const passed = pct >= threshold;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  
  // Custom hex color selectors for premium visual output
  const strokeColor = passed ? "#10b981" : "#ef4444"; // emerald vs red
  const bgColor = passed ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700";

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center justify-center shrink-0">
        <svg width="48" height="48" viewBox="0 0 44 44" className="-rotate-90">
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke="#f1f5f9" // Slate 100
            strokeWidth="3.5"
          />
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className="absolute text-[10px] font-mono font-bold text-slate-500">
          {Math.round(pct * 100)}%
        </span>
      </div>
      <div className="font-mono text-sm leading-tight">
        <div className="font-bold flex items-center gap-1.5">
          <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${bgColor}`}>
            {score} / {maxScore}
          </span>
        </div>
        <div className="text-slate-400 text-[11px] mt-0.5">
          {passed ? "Зараховано" : "Не зараховано"}
        </div>
      </div>
    </div>
  );
}
