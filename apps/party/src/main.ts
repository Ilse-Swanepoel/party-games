import type * as Party from "partykit/server";
import type { ClientMessage, ServerMessage, Player, RoomPhase, RoomState, PodiumEntry } from "@party-games/shared";
import { MAX_PLAYERS, TOTAL_ROUNDS, VOTE_TIMER_SECONDS } from "@party-games/shared";
import { initGame, pickNextPrompt, tallyVotes, buildPodium, type MostLikelyToState } from "./games/most-likely-to/logic";

interface RoomData {
  phase: RoomPhase;
  gameId: string;
  hostId: string | null;
  players: Map<string, Player>;
  scores: Record<string, number>;
  gameState: MostLikelyToState | null;
  voteTimer: ReturnType<typeof setTimeout> | null;
  timerEnd: number | null;
}

function generateRoomState(room: RoomData): RoomState {
  return {
    phase: room.phase,
    gameId: room.gameId,
    players: Array.from(room.players.values()),
    hostId: room.hostId || "",
    scores: room.scores,
    currentRound: room.gameState?.currentRound || 0,
    totalRounds: room.gameState?.totalRounds || TOTAL_ROUNDS,
    prompt: room.gameState?.prompt,
    votes: room.phase === "round-result" ? room.gameState?.votes : undefined,
    voteCount: room.gameState ? Object.keys(room.gameState.votes).length : undefined,
    timerEnd: room.timerEnd || undefined,
  };
}

export default class GameRoom implements Party.Server {
  room: RoomData;

  constructor(readonly party: Party.Party) {
    this.room = {
      phase: "lobby",
      gameId: "most-likely-to",
      hostId: null,
      players: new Map(),
      scores: {},
      gameState: null,
      voteTimer: null,
      timerEnd: null,
    };
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Send current room state on connect
    this.send(conn, { type: "room-state", state: generateRoomState(this.room) });
  }

  onClose(conn: Party.Connection) {
    const player = this.room.players.get(conn.id);
    if (player) {
      player.connected = false;
      this.broadcast({ type: "player-left", playerId: conn.id });
    }
    // Check if all players have voted after disconnect
    if (this.room.phase === "voting") {
      this.checkAllVoted();
    }
  }

  onMessage(message: string, sender: Party.Connection) {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(message);
    } catch {
      return;
    }

    switch (msg.type) {
      case "join-host":
        this.handleJoinHost(sender);
        break;
      case "join":
        this.handleJoin(sender, msg.nickname);
        break;
      case "start-game":
        this.handleStartGame(sender);
        break;
      case "vote":
        this.handleVote(sender, msg.targetPlayerId);
        break;
      case "next-round":
        this.handleNextRound(sender);
        break;
    }
  }

  handleJoinHost(conn: Party.Connection) {
    this.room.hostId = conn.id;
    this.send(conn, { type: "room-state", state: generateRoomState(this.room) });
  }

  handleJoin(conn: Party.Connection, nickname: string) {
    if (this.room.phase !== "lobby") {
      this.send(conn, { type: "error", message: "Game already in progress" });
      return;
    }

    // Check max players
    const activePlayers = Array.from(this.room.players.values()).filter((p) => p.connected);
    if (activePlayers.length >= MAX_PLAYERS) {
      this.send(conn, { type: "error", message: "Room is full" });
      return;
    }

    // Check duplicate nickname
    const nickTaken = Array.from(this.room.players.values()).some(
      (p) => p.connected && p.nickname.toLowerCase() === nickname.toLowerCase()
    );
    if (nickTaken) {
      this.send(conn, { type: "error", message: "Nickname already taken" });
      return;
    }

    const player: Player = { id: conn.id, nickname, connected: true };
    this.room.players.set(conn.id, player);
    this.room.scores[conn.id] = 0;

    // Broadcast to everyone
    this.broadcastAll({ type: "player-joined", player });
    // Send full state to the new player
    this.send(conn, { type: "room-state", state: generateRoomState(this.room) });
  }

  handleStartGame(sender: Party.Connection) {
    if (sender.id !== this.room.hostId) {
      this.send(sender, { type: "error", message: "Only the host can start the game" });
      return;
    }

    const activePlayers = Array.from(this.room.players.values()).filter((p) => p.connected);
    if (activePlayers.length < 2) {
      this.send(sender, { type: "error", message: "Need at least 2 players" });
      return;
    }

    this.room.gameState = initGame();
    this.startNextRound();
  }

  handleVote(sender: Party.Connection, targetPlayerId: string) {
    if (this.room.phase !== "voting" || !this.room.gameState) return;
    if (sender.id === this.room.hostId) return; // Host can't vote
    if (!this.room.players.has(sender.id)) return;
    if (!this.room.players.has(targetPlayerId)) return;
    if (this.room.gameState.votes[sender.id]) return; // Already voted

    this.room.gameState.votes[sender.id] = targetPlayerId;

    // Broadcast vote count (anonymous)
    const activePlayers = Array.from(this.room.players.values()).filter((p) => p.connected);
    this.broadcastAll({
      type: "vote-count",
      count: Object.keys(this.room.gameState.votes).length,
      total: activePlayers.length,
    });

    this.checkAllVoted();
  }

  handleNextRound(sender: Party.Connection) {
    if (sender.id !== this.room.hostId) return;
    if (this.room.phase !== "scoreboard") return;

    if (this.room.gameState && this.room.gameState.currentRound >= this.room.gameState.totalRounds) {
      this.showFinalPodium();
    } else {
      this.startNextRound();
    }
  }

  startNextRound() {
    if (!this.room.gameState) return;

    const { prompt, promptIndex } = pickNextPrompt(this.room.gameState);
    this.room.gameState.currentRound++;
    this.room.gameState.prompt = prompt;
    this.room.gameState.votes = {};
    this.room.gameState.usedPromptIndices.push(promptIndex);
    this.room.phase = "voting";
    this.room.timerEnd = Date.now() + VOTE_TIMER_SECONDS * 1000;

    this.broadcastAll({
      type: "round-start",
      round: this.room.gameState.currentRound,
      prompt,
      timerEnd: this.room.timerEnd,
    });

    // Set vote timer
    if (this.room.voteTimer) clearTimeout(this.room.voteTimer);
    this.room.voteTimer = setTimeout(() => {
      this.endVoting();
    }, VOTE_TIMER_SECONDS * 1000);
  }

  checkAllVoted() {
    if (!this.room.gameState) return;
    const activePlayers = Array.from(this.room.players.values()).filter((p) => p.connected);
    const voteCount = Object.keys(this.room.gameState.votes).length;
    if (voteCount >= activePlayers.length) {
      this.endVoting();
    }
  }

  endVoting() {
    if (this.room.phase !== "voting" || !this.room.gameState) return;

    if (this.room.voteTimer) {
      clearTimeout(this.room.voteTimer);
      this.room.voteTimer = null;
    }

    this.room.phase = "round-result";
    const players = Array.from(this.room.players.values());
    const { winners, pointsAwarded, newScores } = tallyVotes(
      this.room.gameState.votes,
      players,
      this.room.scores
    );

    this.room.scores = newScores;

    this.broadcastAll({
      type: "round-result",
      votes: this.room.gameState.votes,
      winners,
      pointsAwarded,
    });

    // Auto-advance to scoreboard after a brief pause
    setTimeout(() => {
      this.room.phase = "scoreboard";
      this.broadcastAll({ type: "scoreboard", scores: this.room.scores });
    }, 3000);
  }

  showFinalPodium() {
    const players = Array.from(this.room.players.values());
    const podium = buildPodium(this.room.scores, players);
    this.room.phase = "final-podium";
    this.broadcastAll({ type: "game-over", podium });
  }

  // Helper: send to one connection
  send(conn: Party.Connection, msg: ServerMessage) {
    conn.send(JSON.stringify(msg));
  }

  // Helper: broadcast to all connections
  broadcast(msg: ServerMessage) {
    const data = JSON.stringify(msg);
    for (const conn of this.party.getConnections()) {
      conn.send(data);
    }
  }

  broadcastAll(msg: ServerMessage) {
    this.broadcast(msg);
  }
}
