"use client";

import { useRouter } from "next/navigation";
import { GAME_DEFINITIONS } from "@party-games/shared";

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/1/O/0 confusion
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function HostPage() {
  const router = useRouter();
  const games = Object.values(GAME_DEFINITIONS);

  function handlePickGame(gameId: string) {
    const roomCode = generateRoomCode();
    router.push(`/host/${roomCode}?game=${gameId}`);
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-3xl font-bold">Pick a Game</h1>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => handlePickGame(game.id)}
            className="p-6 rounded-2xl bg-card border border-card-border hover:border-purple-500 text-left transition-colors cursor-pointer"
          >
            <h2 className="text-xl font-bold text-white">{game.name}</h2>
            <p className="mt-1 text-gray-400 text-sm">{game.description}</p>
          </button>
        ))}
      </div>
    </main>
  );
}
