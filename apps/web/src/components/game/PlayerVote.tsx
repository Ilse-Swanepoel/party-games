"use client";

import { useEffect, useState } from "react";
import type { Player } from "@party-games/shared";

interface PlayerVoteProps {
  prompt: string;
  players: Player[];
  round: number;
  totalRounds: number;
  hasVoted: boolean;
  onVote: (targetPlayerId: string) => void;
  timerEnd: number | null;
}

export function PlayerVote({
  prompt,
  players,
  round,
  totalRounds,
  hasVoted,
  onVote,
  timerEnd,
}: PlayerVoteProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Reset selection each round
  useEffect(() => {
    setSelectedId(null);
  }, [round]);

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

  const connectedPlayers = players.filter((p) => p.connected);

  function handleTap(playerId: string) {
    if (hasVoted) return;
    setSelectedId(playerId);
    onVote(playerId);
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <div className="text-center">
        <p className="text-xs text-gray-400 uppercase tracking-wider">
          Round {round} / {totalRounds} &middot; {secondsLeft}s
        </p>
        <p className="text-gray-400 text-sm mt-2">Who is most likely to...</p>
        <h2 className="text-xl font-extrabold text-white mt-1">{prompt}</h2>
      </div>

      {hasVoted ? (
        <div className="flex flex-col items-center gap-2 py-8">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <p className="text-green-400 font-bold">Vote locked in!</p>
          <p className="text-gray-400 text-sm">Waiting for others...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 w-full">
          {connectedPlayers.map((player) => (
            <button
              key={player.id}
              onClick={() => handleTap(player.id)}
              className={`p-4 rounded-xl border text-left font-bold text-lg transition-all cursor-pointer ${
                selectedId === player.id
                  ? "bg-purple-600 border-purple-500 text-white"
                  : "bg-card border-card-border text-white hover:border-purple-500"
              }`}
            >
              {player.nickname}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
