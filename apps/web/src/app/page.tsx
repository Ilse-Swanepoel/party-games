import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Party Games
        </h1>
        <p className="mt-3 text-lg text-gray-400">
          Grab your friends. Grab your phones. Get unhinged.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Link
          href="/host"
          className="flex-1 text-center py-4 px-6 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-lg transition-colors"
        >
          Host a Game
        </Link>
        <Link
          href="/play"
          className="flex-1 text-center py-4 px-6 rounded-2xl bg-card border border-card-border hover:border-purple-500 text-white font-bold text-lg transition-colors"
        >
          Join a Game
        </Link>
      </div>
    </main>
  );
}
