import { MOST_LIKELY_TO_PROMPTS, TOTAL_ROUNDS, POINTS_PER_CORRECT_VOTE } from "@party-games/shared";
import type { Player, PodiumEntry } from "@party-games/shared";

export interface MostLikelyToState {
  currentRound: number;
  totalRounds: number;
  prompt: string;
  votes: Record<string, string>;
  usedPromptIndices: number[];
}

export function initGame(): MostLikelyToState {
  return {
    currentRound: 0,
    totalRounds: TOTAL_ROUNDS,
    prompt: "",
    votes: {},
    usedPromptIndices: [],
  };
}

export function pickNextPrompt(state: MostLikelyToState): { prompt: string; promptIndex: number } {
  const available = MOST_LIKELY_TO_PROMPTS
    .map((_, i) => i)
    .filter((i) => !state.usedPromptIndices.includes(i));

  const idx = available[Math.floor(Math.random() * available.length)];
  return { prompt: MOST_LIKELY_TO_PROMPTS[idx], promptIndex: idx };
}

export function tallyVotes(
  votes: Record<string, string>,
  players: Player[],
  currentScores: Record<string, number>
): {
  winners: string[];
  pointsAwarded: Record<string, number>;
  newScores: Record<string, number>;
} {
  // Count votes per target
  const voteCounts: Record<string, number> = {};
  for (const targetId of Object.values(votes)) {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
  }

  // Find max vote count
  const maxVotes = Math.max(0, ...Object.values(voteCounts));

  // Winners are all players with the max votes (if anyone got votes)
  const winners = maxVotes > 0
    ? Object.entries(voteCounts)
        .filter(([, count]) => count === maxVotes)
        .map(([playerId]) => playerId)
    : [];

  // Award points to anyone who voted for a winner
  const pointsAwarded: Record<string, number> = {};
  const newScores = { ...currentScores };

  for (const [voterId, targetId] of Object.entries(votes)) {
    if (winners.includes(targetId)) {
      pointsAwarded[voterId] = POINTS_PER_CORRECT_VOTE;
      newScores[voterId] = (newScores[voterId] || 0) + POINTS_PER_CORRECT_VOTE;
    }
  }

  return { winners, pointsAwarded, newScores };
}

export function buildPodium(
  scores: Record<string, number>,
  players: Player[]
): PodiumEntry[] {
  const sorted = players
    .map((p) => ({
      playerId: p.id,
      nickname: p.nickname,
      score: scores[p.id] || 0,
      rank: 0,
    }))
    .sort((a, b) => b.score - a.score);

  // Assign ranks (1-indexed, ties get same rank)
  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].score < sorted[i - 1].score) {
      currentRank = i + 1;
    }
    sorted[i].rank = currentRank;
  }

  return sorted.slice(0, 3);
}
