"use client";

import { motion } from "framer-motion";
import type { Player } from "@party-games/shared";

interface ScoreboardProps {
  scores: Record<string, number>;
  players: Player[];
  currentRound: number;
  totalRounds: number;
  onNext?: () => void; // Only host passes this
}

export function Scoreboard({
  scores,
  players,
  currentRound,
  totalRounds,
  onNext,
}: ScoreboardProps) {
  const sorted = players
    .filter((p) => p.connected)
    .map((p) => ({ ...p, score: scores[p.id] || 0 }))
    .sort((a, b) => b.score - a.score);

  const isLastRound = currentRound >= totalRounds;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      <h2 className="text-2xl font-bold text-white">Scoreboard</h2>
      <p className="text-sm text-gray-400">
        Round {currentRound} of {totalRounds}
      </p>

      <div className="w-full flex flex-col gap-2">
        {sorted.map((player, i) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between p-3 rounded-xl bg-card border border-card-border"
          >
            <div className="flex items-center gap-3">
              <span className="text-gray-400 font-mono text-sm w-6">
                #{i + 1}
              </span>
              <span className="font-bold text-white">{player.nickname}</span>
            </div>
            <span className="font-mono text-purple-400 font-bold">
              {player.score}
            </span>
          </motion.div>
        ))}
      </div>

      {onNext && (
        <button
          onClick={onNext}
          className="py-3 px-8 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-lg transition-colors cursor-pointer"
        >
          {isLastRound ? "Show Final Results" : "Next Round"}
        </button>
      )}
    </div>
  );
}
