"use client";

import { useEffect, useState } from "react";

interface HostRoundProps {
  round: number;
  totalRounds: number;
  prompt: string;
  voteCount: number;
  totalVoters: number;
  timerEnd: number | null;
}

export function HostRound({
  round,
  totalRounds,
  prompt,
  voteCount,
  totalVoters,
  timerEnd,
}: HostRoundProps) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!timerEnd) return;
    const update = () => {
      const left = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));
      setSecondsLeft(left);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [timerEnd]);

  const progress = totalVoters > 0 ? (voteCount / totalVoters) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl text-center">
      <div className="text-sm text-gray-400 uppercase tracking-wider">
        Round {round} of {totalRounds}
      </div>

      <div>
        <p className="text-gray-400 text-lg mb-2">Who is most likely to...</p>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
          {prompt}
        </h2>
      </div>

      <div className="w-full max-w-md">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>{voteCount} / {totalVoters} voted</span>
          <span>{secondsLeft}s</span>
        </div>
        <div className="w-full h-3 rounded-full bg-card border border-card-border overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
