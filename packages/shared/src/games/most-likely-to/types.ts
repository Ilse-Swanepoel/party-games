export interface MostLikelyToState {
  currentRound: number;
  totalRounds: number;
  prompt: string;
  votes: Record<string, string>; // voterId -> targetPlayerId
  usedPromptIndices: number[];
  phase: "prompt" | "voting" | "result";
}
