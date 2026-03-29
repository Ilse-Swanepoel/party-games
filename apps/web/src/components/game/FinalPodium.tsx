"use client";

import { motion } from "framer-motion";
import type { PodiumEntry } from "@party-games/shared";

interface FinalPodiumProps {
  podium: PodiumEntry[];
}

const podiumColors = [
  "from-yellow-400 to-amber-500", // 1st
  "from-gray-300 to-gray-400",    // 2nd
  "from-amber-600 to-amber-700",  // 3rd
];

const podiumHeights = ["h-40", "h-28", "h-20"];
const podiumEmoji = ["👑", "⭐", "🎉"];

export function FinalPodium({ podium }: FinalPodiumProps) {
  // Reorder for display: 2nd, 1st, 3rd
  const displayOrder = [podium[1], podium[0], podium[2]].filter(Boolean);

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg">
      <motion.h2
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-4xl font-extrabold text-white text-center"
      >
        Game Over!
      </motion.h2>

      <div className="flex items-end justify-center gap-4 w-full">
        {displayOrder.map((entry, displayIdx) => {
          // Map display index back to actual rank index
          const rankIdx = displayIdx === 1 ? 0 : displayIdx === 0 ? 1 : 2;
          return (
            <motion.div
              key={entry.playerId}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + rankIdx * 0.3, type: "spring" }}
              className="flex flex-col items-center gap-2 flex-1"
            >
              <span className="text-3xl">{podiumEmoji[rankIdx]}</span>
              <p className="font-bold text-white text-center truncate w-full">
                {entry.nickname}
              </p>
              <p className="text-sm font-mono text-purple-400">
                {entry.score} pts
              </p>
              <div
                className={`w-full ${podiumHeights[rankIdx]} rounded-t-xl bg-gradient-to-b ${podiumColors[rankIdx]} flex items-center justify-center`}
              >
                <span className="text-2xl font-extrabold text-white/90">
                  #{entry.rank}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="text-gray-400 text-sm"
      >
        Thanks for playing!
      </motion.p>
    </div>
  );
}
