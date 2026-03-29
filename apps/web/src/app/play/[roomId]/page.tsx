"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePartySocket } from "@/hooks/usePartySocket";
import { useGameState } from "@/hooks/useGameState";
import { PlayerLobby } from "@/components/lobby/PlayerLobby";
import { PlayerVote } from "@/components/game/PlayerVote";
import { RoundResult } from "@/components/game/RoundResult";
import { Scoreboard } from "@/components/game/Scoreboard";
import { FinalPodium } from "@/components/game/FinalPodium";

export default function PlayerGamePage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const searchParams = useSearchParams();
  const nickname = searchParams.get("nickname") || "Player";
  const { state, handleMessage } = useGameState();
  const { send, connected } = usePartySocket({ roomId, onMessage: handleMessage });
  const [hasVoted, setHasVoted] = useState(false);

  // Join room on connect
  useEffect(() => {
    if (connected) {
      send({ type: "join", nickname });
    }
  }, [connected, send, nickname]);

  // Reset vote status each round
  useEffect(() => {
    setHasVoted(false);
  }, [state.currentRound]);

  function handleVote(targetPlayerId: string) {
    if (!hasVoted) {
      send({ type: "vote", targetPlayerId });
      setHasVoted(true);
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 min-h-screen">
      {state.error && (
        <div className="mb-4 p-3 rounded-xl bg-red-900/50 border border-red-700 text-red-200 text-sm">
          {state.error}
        </div>
      )}

      {state.phase === "lobby" && (
        <PlayerLobby nickname={nickname} players={state.players} />
      )}

      {state.phase === "voting" && (
        <PlayerVote
          prompt={state.prompt}
          players={state.players}
          round={state.currentRound}
          totalRounds={state.totalRounds}
          hasVoted={hasVoted}
          onVote={handleVote}
          timerEnd={state.timerEnd}
        />
      )}

      {state.phase === "round-result" && (
        <RoundResult
          winners={state.winners}
          votes={state.votes}
          players={state.players}
          pointsAwarded={state.pointsAwarded}
          prompt={state.prompt}
        />
      )}

      {state.phase === "scoreboard" && (
        <Scoreboard
          scores={state.scores}
          players={state.players}
          currentRound={state.currentRound}
          totalRounds={state.totalRounds}
        />
      )}

      {state.phase === "final-podium" && (
        <FinalPodium podium={state.podium} />
      )}
    </main>
  );
}
