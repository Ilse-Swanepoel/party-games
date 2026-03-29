"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [nickname, setNickname] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = roomCode.trim().toUpperCase();
    const name = nickname.trim();
    if (code.length === 4 && name.length > 0) {
      router.push(`/play/${code}?nickname=${encodeURIComponent(name)}`);
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-3xl font-bold">Join a Game</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Room Code</label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 4))}
            placeholder="ABCD"
            autoCapitalize="characters"
            autoComplete="off"
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-card border border-card-border text-white text-center text-2xl font-mono tracking-[0.3em] placeholder:text-gray-600 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Nickname</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 16))}
            placeholder="Your name"
            autoComplete="off"
            className="w-full px-4 py-3 rounded-xl bg-card border border-card-border text-white text-center text-lg placeholder:text-gray-600 focus:outline-none focus:border-purple-500"
          />
        </div>

        <button
          type="submit"
          disabled={roomCode.length !== 4 || nickname.trim().length === 0}
          className="py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-lg transition-colors cursor-pointer"
        >
          Join
        </button>
      </form>
    </main>
  );
}
