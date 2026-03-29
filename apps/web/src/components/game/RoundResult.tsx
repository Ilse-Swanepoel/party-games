"use client";

import { motion } from "framer-motion";
import type { Player } from "@party-games/shared";

interface RoundResultProps {
  winners: string[];
  votes: Record<string, string>;
  players: Player[];
  pointsAwarded: Record<string, number>;
  prompt: string;
}

export function RoundResult({
  winners,
  votes,
  players,
  pointsAwarded,
  prompt,
}: RoundResultProps) {
  const playerMap = new Map(players.map((p) => [p.id, p]));

  // Count votes per target
  const voteCounts: Record<string, number> = {};
  for (const targetId of Object.values(votes)) {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
  }

  const winnerNames = winners
    .map((id) => playerMap.get(id)?.nickname || "???")
    .join(" & ");

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg text-center">
      <p className="text-gray-400 text-sm">Most likely to... {prompt}</p>

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="text-8xl"
      >
        🏅
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-extrabold text-white"
      >
        {winnerNames}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-gray-400"
      >
        {winners.length > 1 ? "tied with" : "with"}{" "}
        {voteCounts[winners[0]] || 0} vote{(voteCounts[winners[0]] || 0) !== 1 ? "s" : ""}
      </motion.p>

      {Object.keys(pointsAwarded).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-sm text-green-400"
        >
          +100 pts to:{" "}
          {Object.keys(pointsAwarded)
            .map((id) => playerMap.get(id)?.nickname || "???")
            .join(", ")}
        </motion.div>
      )}
    </div>
  );
}
