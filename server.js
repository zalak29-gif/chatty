import { WebSocketServer } from "ws";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.PORT || 8080);
const MAX_HISTORY = 200;
const historyByRoom = new Map();

const wss = new WebSocketServer({ port: PORT });

function getRoomHistory(room) {
  if (!historyByRoom.has(room)) {
    historyByRoom.set(room, []);
  }
  return historyByRoom.get(room);
}

function pushHistory(room, entry) {
  const roomHistory = getRoomHistory(room);
  roomHistory.push(entry);
  if (roomHistory.length > MAX_HISTORY) {
    roomHistory.shift();
  }
}

function broadcastToRoom(room, payload) {
  const data = JSON.stringify(payload);

  for (const client of wss.clients) {
    if (client.readyState === 1 && client.room === room) {
      client.send(data);
    }
  }
}

wss.on("connection", (socket) => {
  socket.room = "";

  socket.on("message", (raw) => {
    let packet;

    try {
      packet = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (packet?.type === "join") {
      const room = String(packet?.payload?.room || "").trim().slice(0, 64);
      if (!room) {
        return;
      }
      socket.room = room;
      socket.send(
        JSON.stringify({
          type: "history",
          payload: { room, messages: getRoomHistory(room) },
        })
      );
      return;
    }

    if (packet?.type !== "message" || !socket.room) {
      return;
    }

    const text = String(packet?.payload?.text || "").trim().slice(0, 500);
    const author = String(packet?.payload?.author || "Guest").trim().slice(0, 32) || "Guest";

    if (!text) {
      return;
    }

    const message = {
      id: randomUUID(),
      room: socket.room,
      author,
      text,
      timestamp: new Date().toISOString(),
    };

    pushHistory(socket.room, message);
    broadcastToRoom(socket.room, { type: "message", payload: message });
  });
});

console.log(`WebSocket server listening on ws://localhost:${PORT}`);
