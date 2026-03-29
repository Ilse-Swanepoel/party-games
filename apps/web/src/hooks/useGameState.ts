"use client";

import { useReducer, useCallback } from "react";
import type {
  ServerMessage,
  RoomState,
  Player,
  PodiumEntry,
} from "@party-games/shared";
import { TOTAL_ROUNDS } from "@party-games/shared";

export interface GameUIState {
  phase: RoomState["phase"];
  players: Player[];
  hostId: string;
  scores: Record<string, number>;
  currentRound: number;
  totalRounds: number;
  prompt: string;
  voteCount: number;
  totalVoters: number;
  votes: Record<string, string>;
  winners: string[];
  pointsAwarded: Record<string, number>;
  podium: PodiumEntry[];
  timerEnd: number | null;
  error: string | null;
}

const initialState: GameUIState = {
  phase: "lobby",
  players: [],
  hostId: "",
  scores: {},
  currentRound: 0,
  totalRounds: TOTAL_ROUNDS,
  prompt: "",
  voteCount: 0,
  totalVoters: 0,
  votes: {},
  winners: [],
  pointsAwarded: {},
  podium: [],
  timerEnd: null,
  error: null,
};

function reducer(state: GameUIState, msg: ServerMessage): GameUIState {
  switch (msg.type) {
    case "room-state":
      return {
        ...state,
        phase: msg.state.phase,
        players: msg.state.players,
        hostId: msg.state.hostId,
        scores: msg.state.scores,
        currentRound: msg.state.currentRound,
        totalRounds: msg.state.totalRounds,
        prompt: msg.state.prompt || "",
        voteCount: msg.state.voteCount || 0,
        totalVoters: msg.state.players.filter((p) => p.connected).length,
        timerEnd: msg.state.timerEnd || null,
        error: null,
      };

    case "player-joined":
      return {
        ...state,
        players: state.players.some((p) => p.id === msg.player.id)
          ? state.players.map((p) =>
              p.id === msg.player.id ? msg.player : p
            )
          : [...state.players, msg.player],
        error: null,
      };

    case "player-left":
      return {
        ...state,
        players: state.players.map((p) =>
          p.id === msg.playerId ? { ...p, connected: false } : p
        ),
      };

    case "round-start":
      return {
        ...state,
        phase: "voting",
        currentRound: msg.round,
        prompt: msg.prompt,
        voteCount: 0,
        totalVoters: state.players.filter((p) => p.connected).length,
        votes: {},
        winners: [],
        pointsAwarded: {},
        timerEnd: msg.timerEnd,
        error: null,
      };

    case "vote-count":
      return {
        ...state,
        voteCount: msg.count,
        totalVoters: msg.total,
      };

    case "round-result":
      return {
        ...state,
        phase: "round-result",
        votes: msg.votes,
        winners: msg.winners,
        pointsAwarded: msg.pointsAwarded,
      };

    case "scoreboard":
      return {
        ...state,
        phase: "scoreboard",
        scores: msg.scores,
      };

    case "game-over":
      return {
        ...state,
        phase: "final-podium",
        podium: msg.podium,
      };

    case "error":
      return {
        ...state,
        error: msg.message,
      };

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleMessage = useCallback((msg: ServerMessage) => {
    dispatch(msg);
  }, []);

  return { state, handleMessage };
}
