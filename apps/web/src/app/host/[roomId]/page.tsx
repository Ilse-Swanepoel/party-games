"use client";

import { use, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePartySocket } from "@/hooks/usePartySocket";
import { useGameState } from "@/hooks/useGameState";
import { HostLobby } from "@/components/lobby/HostLobby";
import { HostRound } from "@/components/game/HostRound";
import { RoundResult } from "@/components/game/RoundResult";
import { Scoreboard } from "@/components/game/Scoreboard";
import { FinalPodium } from "@/components/game/FinalPodium";

export default function HostGamePage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const searchParams = useSearchParams();
  const gameId = searchParams.get("game") || "most-likely-to";
  const { state, handleMessage } = useGameState();
  const { send, connected } = usePartySocket({ roomId, onMessage: handleMessage });

  // Register as host on connect
  useEffect(() => {
    if (connected) {
      send({ type: "join-host" });
    }
  }, [connected, send]);

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 min-h-screen">
      {state.phase === "lobby" && (
        <HostLobby
          roomCode={roomId}
          players={state.players}
          onStart={() => send({ type: "start-game" })}
          error={state.error}
        />
      )}

      {state.phase === "voting" && (
        <HostRound
          round={state.currentRound}
          totalRounds={state.totalRounds}
          prompt={state.prompt}
          voteCount={state.voteCount}
          totalVoters={state.totalVoters}
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
          onNext={() => send({ type: "next-round" })}
        />
      )}

      {state.phase === "final-podium" && (
        <FinalPodium podium={state.podium} />
      )}
    </main>
  );
}
