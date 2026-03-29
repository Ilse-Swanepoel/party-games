import type { GameDefinition } from "../types";

export const GAME_DEFINITIONS: Record<string, GameDefinition> = {
  "most-likely-to": {
    id: "most-likely-to",
    name: "Most Likely To",
    description: "Vote on who's most likely to do unhinged things. Points for picking the popular answer!",
    minPlayers: 2,
    maxPlayers: 12,
  },
};
