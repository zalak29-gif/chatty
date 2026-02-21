import { useEffect, useMemo, useRef, useState } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080";
const PREVIEW_CHATS = [
  { id: "c1", name: "Mia", last: "Are we still meeting at 7?", time: "09:42 AM", unread: 2, room: "mia" },
  { id: "c2", name: "Noah", last: "I sent the notes to your email.", time: "08:18 AM", unread: 0, room: "noah" },
  { id: "c3", name: "Luna", last: "Your pastel theme is so cute!", time: "Yesterday", unread: 1, room: "luna" },
  { id: "c4", name: "Eli", last: "Lets finalize the plan today.", time: "Yesterday", unread: 0, room: "eli" },
];
const DUMMY_MESSAGES_BY_ROOM = {
  mia: [
    { id: "demo-mia-1", room: "mia", author: "Mia", text: "good morning sunshine!", timestamp: "2026-02-20T08:14:00.000Z" },
    { id: "demo-mia-2", room: "mia", author: "Mia", text: "are we still meeting at 7?", timestamp: "2026-02-20T08:18:00.000Z" },
  ],
  noah: [
    { id: "demo-noah-1", room: "noah", author: "Noah", text: "i sent the notes to your email.", timestamp: "2026-02-20T09:03:00.000Z" },
    { id: "demo-noah-2", room: "noah", author: "Noah", text: "let me know if you want a summary too.", timestamp: "2026-02-20T09:05:00.000Z" },
  ],
  luna: [
    { id: "demo-luna-1", room: "luna", author: "Luna", text: "your pastel theme is so cute!", timestamp: "2026-02-19T19:42:00.000Z" },
    { id: "demo-luna-2", room: "luna", author: "Luna", text: "can we add stickers next?", timestamp: "2026-02-19T19:43:00.000Z" },
  ],
  eli: [
    { id: "demo-eli-1", room: "eli", author: "Eli", text: "lets finalize the plan today.", timestamp: "2026-02-19T18:22:00.000Z" },
    { id: "demo-eli-2", room: "eli", author: "Eli", text: "i can share the final checklist in 10 mins.", timestamp: "2026-02-19T18:23:00.000Z" },
  ],
};

function getDummyMessages(room) {
  return DUMMY_MESSAGES_BY_ROOM[room] || [];
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function App() {
  const [chats, setChats] = useState(PREVIEW_CHATS);
  const [activeChatId, setActiveChatId] = useState(PREVIEW_CHATS[0].id);
  const [messages, setMessages] = useState(getDummyMessages(PREVIEW_CHATS[0].room));
  const [text, setText] = useState("");
  const [status, setStatus] = useState("connecting");
  const [view, setView] = useState("inbox");
  const wsRef = useRef(null);
  const feedRef = useRef(null);
  const activeChat = chats.find((chat) => chat.id === activeChatId) || chats[0];
  const currentRoomRef = useRef(activeChat.room);

  const username = useMemo(() => {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `Guest-${suffix}`;
  }, []);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("online");
      ws.send(
        JSON.stringify({
          type: "join",
          payload: { room: currentRoomRef.current },
        })
      );
    };
    ws.onclose = () => setStatus("offline");
    ws.onerror = () => setStatus("offline");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "history") {
          if (Array.isArray(data.payload)) {
            setMessages(
              data.payload.length
                ? data.payload.map((msg) => ({ ...msg, room: currentRoomRef.current }))
                : getDummyMessages(currentRoomRef.current)
            );
            return;
          }

          const room = String(data.payload?.room || "");
          if (room !== currentRoomRef.current) {
            return;
          }
          const roomMessages = data.payload?.messages || [];
          setMessages(roomMessages.length ? roomMessages : getDummyMessages(room));
          return;
        }

        if (data.type === "message" && data.payload) {
          const incomingRoom = String(data.payload.room || "");
          if (!incomingRoom || incomingRoom === currentRoomRef.current) {
            setMessages((prev) => [
              ...prev,
              { ...data.payload, room: incomingRoom || currentRoomRef.current },
            ]);
          }
        }
      } catch {
        // Ignore malformed payloads from unknown clients.
      }
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    currentRoomRef.current = activeChat.room;
    setMessages(getDummyMessages(activeChat.room));

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "join",
          payload: { room: activeChat.room },
        })
      );
    }
  }, [activeChat.room]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (event) => {
    event.preventDefault();
    const trimmed = text.trim();

    if (!trimmed || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: "message",
        payload: {
          author: username,
          room: activeChat.room,
          text: trimmed,
        },
      })
    );

    setText("");
  };

  const openChat = (chatId) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, unread: 0 } : chat))
    );
    setActiveChatId(chatId);
    setView("chat");
  };

  return (
    <div className="page">
      <main className="chat-shell">
        {view === "inbox" ? (
          <section className="inbox-screen">
            <header className="inbox-header">
              <div>
                <p className="eyebrow">Welcome back</p>
                <h1>Chatty</h1>
              </div>
              <button className="profile-button" aria-label="Open profile">
                <span className="profile-icon" aria-hidden="true">
                  Z
                </span>
              </button>
            </header>

            <div className="story-row" aria-label="Active contacts">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  className="story-chip"
                  onClick={() => openChat(chat.id)}
                >
                  <span>{chat.name.slice(0, 1)}</span>
                  <small>{chat.name}</small>
                </button>
              ))}
            </div>

            <div className="inbox-list">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  className="chat-preview"
                  onClick={() => openChat(chat.id)}
                >
                  <div className="avatar">{chat.name.slice(0, 1)}</div>
                  <div className="preview-main">
                    <strong>{chat.name}</strong>
                    <p>{chat.last}</p>
                  </div>
                  <div className="preview-side">
                    <time>{chat.time}</time>
                    {chat.unread > 0 ? <span>{chat.unread}</span> : null}
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {view === "chat" ? (
        <header className="chat-header">
          <div>
            <h1>{activeChat.name}</h1>
            <p>Real-time room with live message history</p>
          </div>
          <div className="chat-actions">
            <button className="back-button" onClick={() => setView("inbox")}>
              Back
            </button>
            <div className={`status-badge status-${status}`}>
              <span />
              {status}
            </div>
          </div>
        </header>
        ) : null}

        {view === "chat" ? (
        <section ref={feedRef} className="message-feed" aria-live="polite">
          {messages.length === 0 ? (
            <div className="empty-state">No messages yet. Start the conversation.</div>
          ) : (
            messages.map((msg) => {
              const mine = msg.author === username;
              return (
                <article key={msg.id} className={`bubble ${mine ? "mine" : "other"}`}>
                  <div className="meta">
                    <strong>{msg.author}</strong>
                    <time>{formatTime(msg.timestamp)}</time>
                  </div>
                  <p>{msg.text}</p>
                </article>
              );
            })
          )}
        </section>
        ) : null}

        {view === "chat" ? (
        <form className="composer" onSubmit={sendMessage}>
          <label htmlFor="text" className="sr-only">
            Message
          </label>
          <input
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message as ${username}`}
            maxLength={500}
            autoComplete="off"
          />
          <button type="submit" disabled={status !== "online"}>
            Send
          </button>
        </form>
        ) : null}
      </main>
      <footer className="rights-reserved">@ 2026 Zalak. All rights reserved.</footer>
    </div>
  );
}

export default App;




