"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import PartySocket from "partysocket";
import { PARTYKIT_HOST } from "@/lib/party";
import type { ClientMessage, ServerMessage } from "@party-games/shared";

interface UsePartySocketOptions {
  roomId: string;
  onMessage: (msg: ServerMessage) => void;
}

export function usePartySocket({ roomId, onMessage }: UsePartySocketOptions) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<PartySocket | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    const socket = new PartySocket({
      host: PARTYKIT_HOST,
      room: roomId,
    });

    socket.addEventListener("open", () => setConnected(true));
    socket.addEventListener("close", () => setConnected(false));
    socket.addEventListener("message", (event) => {
      try {
        const msg = JSON.parse(event.data) as ServerMessage;
        onMessageRef.current(msg);
      } catch {
        // ignore malformed messages
      }
    });

    socketRef.current = socket;

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [roomId]);

  const send = useCallback((msg: ClientMessage) => {
    socketRef.current?.send(JSON.stringify(msg));
  }, []);

  return { send, connected };
}
