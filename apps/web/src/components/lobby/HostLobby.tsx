"use client";

import type { Player } from "@party-games/shared";

interface HostLobbyProps {
  roomCode: string;
  players: Player[];
  onStart: () => void;
  error: string | null;
}

export function HostLobby({ roomCode, players, onStart, error }: HostLobbyProps) {
  const connectedPlayers = players.filter((p) => p.connected);

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg">
      <div className="text-center">
        <p className="text-gray-400 text-sm uppercase tracking-wider">Room Code</p>
        <p className="text-7xl font-mono font-extrabold tracking-[0.2em] text-white mt-2">
          {roomCode}
        </p>
        <p className="text-gray-400 mt-2">
          Go to this site on your phone and enter the code above
        </p>
      </div>

      <div className="w-full">
        <p className="text-sm text-gray-400 mb-3">
          Players ({connectedPlayers.length})
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {connectedPlayers.map((player) => (
            <div
              key={player.id}
              className="p-3 rounded-xl bg-card border border-card-border text-center"
            >
              <p className="font-bold text-white truncate">{player.nickname}</p>
            </div>
          ))}
          {connectedPlayers.length === 0 && (
            <p className="col-span-full text-center text-gray-500 py-8">
              Waiting for players to join...
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <button
        onClick={onStart}
        disabled={connectedPlayers.length < 2}
        className="py-4 px-8 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xl transition-colors cursor-pointer"
      >
        Start Game
      </button>
    </div>
  );
}
