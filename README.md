do state management
# Flash Chat 💬

A real-time chat application built with WebSockets, focusing on seamless frontend experience and efficient real-time communication.

## Description

Flash Chat is a WebSocket-based real-time messaging application. The primary challenge and focus of this project lies in creating an intuitive and responsive frontend experience, while maintaining a clean and simple backend architecture. This project serves as an excellent learning opportunity for real-time web development patterns.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation & Setup

**Backend Setup:**
```bash
cd flash_be
npm install
npm run start
```

**Frontend Setup:**
```bash
cd flash_fe
npm install
npm run start
```

## Project Structure

```
flashchat/
├── flash_fe/                 # Frontend React application
│   └── src/
│       ├── components/       # Reusable UI components
│       ├── icons/           # Icon assets and components
│       ├── utils/           # Helper functions and utilities
│       └── App.tsx          # Main application component
│
└── flash_be/                # Backend WebSocket server
    └── src/
        └── index.ts         # Server entry point
```

## Features

- ✅ Real-time messaging via WebSockets
- ✅ Typing indicators
- 🔄 User authentication & authorization
- 🔄 GIF integration
- 🔄 Message history persistence
- 🔄 User presence indicators
- 🔄 File/image sharing
- 🔄 Message reactions/emojis

## TODOs & Roadmap

### 🔒 Security & Authentication
- [ ] **Close unauthorized endpoints** 
- [ ] Add rate limiting to prevent spam
- [ ] Input sanitization and XSS protection
- [ ] Implement user sessions and JWT tokens

### 🎨 User Experience
- [x] **Typing indicators** - Show when users are typing
- [ ] **GIF integration** - Add GIPHY API support for sending GIFs
- [ ] Message read receipts
- [ ] Dark/light theme toggle
- [ ] Sound notifications

### 📱 Features & Functionality
- [ ] Message editing and deletion
- [ ] File upload and sharing
- [ ] Message history pagination

### 🚀 Performance & Scalability
- [ ] Message caching with Redis
- [ ] Connection pooling optimization
- [ ] Mobile responsiveness improvements
- [ ] Progressive Web App (PWA) features

### 🧪 Development & Testing
- [ ] Unit tests for components
- [ ] Integration tests for WebSocket connections
- [ ] Error handling and reconnection logic
- [ ] Logging and monitoring setup
- [ ] Docker containerization

## Technologies Used

- **Frontend:** React, TypeScript, WebSockets
- **Backend:** Node.js, WebSocket Server
- **Real-time Communication:** Native WebSockets

## Contributing

Feel free to contribute to this project! Please create an issue first to discuss any major changes.

- Real-time messaging via WebSockets
- Typing indicators
- Temporary rooms, no auth required

## Notes
- Frontend reads `VITE_WEBSOCKET_URL` (default `ws://localhost:8080`).
- Backend reads `NODE_BACKEND_URL` and `NODE_WEBSOCKET_PORT` with safe defaults.

## Scripts
- Backend: `npm run dev` (build + start)
- Frontend: `pnpm run dev`, `pnpm run build`, `pnpm run lint`

## Roadmap
- Message history and persistence
- Presence indicators
- File/image sharing
- Tests (unit/integration)