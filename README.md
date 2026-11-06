# 🎵 MusicTogether - Real-Time Synchronized Music & Friend Rooms

Full-stack web application built with **React.js**, **Node.js**, **Socket.io**, and **Axios**.

---

## 📁 Architecture & Folder Structure

```
music-sync-app/
├── server/                               # Node.js + Express + Socket.io Server
│   ├── controllers/
│   │   └── roomController.js             # REST API business logic
│   ├── routes/
│   │   └── roomRoutes.js                 # API endpoints (/api/rooms, /api/tracks)
│   ├── sockets/
│   │   └── musicSocket.js                # Modular real-time sync event handlers
│   ├── data/
│   │   └── roomsStore.js                 # Room state store & default tracks
│   ├── index.js                          # Server entry point
│   └── package.json
│
└── client/                               # React.js (Vite) Frontend
    ├── src/
    │   ├── api/
    │   │   └── musicApi.js               # Axios instance & REST API calls
    │   ├── components/
    │   │   ├── Header.jsx                # Header bar & friend invite button
    │   │   ├── MembersList.jsx           # Online friends in room list
    │   │   ├── PlaylistQueue.jsx         # Track queue & track selector
    │   │   ├── PlayerStage.jsx           # Vinyl disc, timeline seek, & audio controls
    │   │   ├── ChatPanel.jsx             # Real-time room chat
    │   │   ├── AddTrackModal.jsx         # Custom track modal
    │   │   └── JoinRoomScreen.jsx        # Join/Create room screen + active rooms list
    │   ├── App.jsx                       # Main controller & Socket state coordinator
    │   ├── App.css                       # Modern Glassmorphic Cyberpunk Theme
    │   └── index.css
    └── package.json
```

---

## ⚡ Tech Stack & Libraries
- **Frontend**: React 19, Vite, Axios, Socket.io-client, Lucide-react
- **Backend**: Node.js, Express, Socket.io, Cors

---

## 🏃 Run Karne Ka Tarika:

### Step 1: Server Start
```powershell
cd "e:\project\Personal Project\music-sync-app\server"
node index.js
```
*(Server port 5000 par listen karega: REST API + Socket.io)*

### Step 2: React Client Start
```powershell
cd "e:\project\Personal Project\music-sync-app\client"
npm run dev
```
*(Client `http://localhost:5173` par chalega)*
