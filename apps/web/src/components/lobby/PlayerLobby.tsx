"use client";

import type { Player } from "@party-games/shared";

interface PlayerLobbyProps {
  nickname: string;
  players: Player[];
}

export function PlayerLobby({ nickname, players }: PlayerLobbyProps) {
  const connectedPlayers = players.filter((p) => p.connected);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <div className="text-center">
        <p className="text-3xl font-bold text-white">You're in!</p>
        <p className="text-purple-400 font-mono text-lg mt-1">{nickname}</p>
      </div>

      <div className="w-full">
        <p className="text-sm text-gray-400 mb-3">
          Players in lobby ({connectedPlayers.length})
        </p>
        <div className="flex flex-col gap-2">
          {connectedPlayers.map((player) => (
            <div
              key={player.id}
              className="p-3 rounded-xl bg-card border border-card-border"
            >
              <p className="font-bold text-white">{player.nickname}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-gray-400">
        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
        <p className="text-sm">Waiting for host to start the game...</p>
      </div>
    </div>
  );
}
