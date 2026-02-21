# Chatty - Real-time Chat App

*COMPANY*: CODTECH IT SOLUTIONS

*NAME*: PARMAR ZALAK KANTILAL

*INTERN ID*: CTIS4007

*DOMAIN*: FRONT END DEVELOPMENT

*DURATION*: 4 WEEKS

*MENTOR*: NEELA SANTOSH

## Chatty is a real-time chat application built as a full-stack JavaScript project with a React frontend and a Node.js WebSocket backend. The main goal of this project is to deliver an instant messaging experience where users can switch between conversations, send messages live, and see message history for each chat room. From the current implementation, Chatty is already functional as a development-ready prototype with clear core features completed.

The platform stack is modern and lightweight. On the frontend, Chatty runs in the browser using React 18 with Vite as the build and development tool. On the backend, it uses Node.js with the ws library to create a standalone WebSocket server. The project uses ES Modules ("type": "module" in package.json), so imports/exports follow modern JavaScript syntax throughout both client and server code. Styling is handled with plain CSS (no Tailwind or component library), and the UI is custom-designed with responsive behavior for both desktop and mobile screen sizes.

The completed tasks in this version include several practical chat capabilities. First, real-time messaging is implemented via WebSocket, meaning messages are transmitted instantly without page refresh. Second, room-based messaging is supported: when a user opens a chat (for example with Mia or Noah), the frontend sends a join event to the server, and the socket is assigned to that room. Third, message history replay is implemented: the server stores recent messages in memory and sends room history to users when they join. This creates continuity instead of starting every chat empty. Fourth, connection-state handling is done on the client with visible statuses (connecting, online, offline) so users know whether sending is currently available.

Another finished part is input validation and guardrails. On the backend, room names are trimmed and capped at 64 characters, author names at 32 characters, and message text at 500 characters. Empty messages are ignored. This reduces noise and basic malformed input issues. Messages are also structured with id (UUID), room, author, text, and ISO timestamp, which is a good foundation for future persistence or analytics. There is also history size control (MAX_HISTORY = 200) per room to prevent unbounded memory growth in the current in-memory model.

The frontend workflow is clean and user-friendly. It starts in an inbox-style screen showing chat previews, unread badges, and contact chips. Selecting a chat opens a dedicated conversation view with message bubbles, timestamps, and a composer input. There is a “Back” action to return to inbox, automatic scroll-to-latest behavior, and disabled send action when the socket is offline. A generated guest identity like Guest-1234 is assigned per session. The UI includes fallback dummy messages per room so the interface remains populated and testable even when no server history exists yet.

How it runs: dependencies are installed with npm install, and development mode is started with npm run dev. That command uses concurrently to launch both services at once: Vite frontend at http://localhost:5173 and WebSocket server at ws://localhost:8080. The frontend can also target a different socket endpoint using the optional environment variable VITE_WS_URL. For production-style frontend output, npm run build generates static assets and npm run preview serves them for validation.

Languages and technologies used are:

JavaScript (client and server logic)
JSX (React component rendering)
CSS (responsive custom styling and animations)
HTML (Vite entry template)
Node.js runtime + WebSocket protocol (ws package)
Vite tooling and React DOM rendering
In summary, Chatty is already a working real-time chat system with room support, live updates, status awareness, responsive UI, and message history in memory. It is not yet a fully production-hardened SaaS product (no authentication, no database persistence, no horizontal scaling layer), but the foundation is solid and clearly structured for future expansion.
