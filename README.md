# Chatty - Real-time Chat App

A responsive chat application built with React and WebSockets.

## Features

- Real-time messaging via WebSocket (`ws`)
- Message history replayed to new users when they connect
- Mobile-friendly responsive chat UI
- Connection status indicator (`connecting`, `online`, `offline`)

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start both server and client:
   ```bash
   npm run dev
   ```
3. Open:
   - Frontend: `http://localhost:5173`
   - WebSocket server: `ws://localhost:8080`

## Optional environment variable

- `VITE_WS_URL` to point frontend to a custom WebSocket URL.