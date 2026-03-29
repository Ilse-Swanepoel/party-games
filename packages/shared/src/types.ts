// ============ Core Types ============

export interface Player {
  id: string;
  nickname: string;
  connected: boolean;
}

export type RoomPhase =
  | "lobby"
  | "round-prompt"
  | "voting"
  | "round-result"
  | "scoreboard"
  | "final-podium"
  | "finished";

export interface RoomState {
  phase: RoomPhase;
  gameId: string;
  players: Player[];
  hostId: string;
  scores: Record<string, number>;
  currentRound: number;
  totalRounds: number;
  // Game-specific state
  prompt?: string;
  votes?: Record<string, string>; // voterId -> targetPlayerId
  voteCount?: number;
  winners?: string[]; // player IDs with most votes
  pointsAwarded?: Record<string, number>; // points given this round
  podium?: PodiumEntry[];
  timerEnd?: number; // timestamp when voting ends
}

export interface PodiumEntry {
  playerId: string;
  nickname: string;
  score: number;
  rank: number;
}

// ============ Client -> Server Messages ============

export type ClientMessage =
  | { type: "join"; nickname: string }
  | { type: "join-host" }
  | { type: "start-game" }
  | { type: "vote"; targetPlayerId: string }
  | { type: "next-round" };

// ============ Server -> Client Messages ============

export type ServerMessage =
  | { type: "room-state"; state: RoomState }
  | { type: "player-joined"; player: Player }
  | { type: "player-left"; playerId: string }
  | { type: "round-start"; round: number; prompt: string; timerEnd: number }
  | { type: "vote-count"; count: number; total: number }
  | { type: "round-result"; votes: Record<string, string>; winners: string[]; pointsAwarded: Record<string, number> }
  | { type: "scoreboard"; scores: Record<string, number> }
  | { type: "game-over"; podium: PodiumEntry[] }
  | { type: "error"; message: string };

// ============ Game Module Interface ============

export interface GameDefinition {
  id: string;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
}
