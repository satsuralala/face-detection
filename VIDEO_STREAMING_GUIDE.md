# 📹 Mobile Video Streaming System

This system allows mobile phone users to stream live video to a Next.js web application using WebRTC technology.

## 🏗️ Architecture Overview

The system consists of three main components:

1. **Signaling Server** (FastAPI + WebSocket) - Handles WebRTC signaling
2. **Mobile Streaming Interface** - Captures and streams video from mobile devices
3. **Web Viewer Interface** - Displays all connected video streams

## 🚀 How It Works

### WebRTC Flow
1. Mobile device connects to signaling server as "streamer"
2. Web viewers connect to signaling server as "viewer"
3. Signaling server facilitates WebRTC peer-to-peer connections
4. Video streams directly between mobile devices and web browsers

### Real-time Features
- ✅ Multiple simultaneous streams
- ✅ Automatic connection management
- ✅ Real-time viewer count
- ✅ Connection status indicators
- ✅ Camera switching (front/back)
- ✅ Auto-reconnection on network issues

## 📱 Usage Instructions

### For Mobile Users (Streamers)
1. Open mobile browser and navigate to:
   - Next.js route: `http://your-domain.com/stream`
   - Direct HTML: `http://your-domain.com/mobile-stream.html`
2. Allow camera and microphone permissions
3. Tap "Start Streaming"
4. Video will be broadcast to all connected viewers

### For Web Viewers
1. Navigate to: `http://your-domain.com/live-streams`
2. All active mobile streams will appear automatically
3. Streams display in a responsive grid layout
4. Real-time connection status for each stream

## 🛠️ Technical Implementation

### Backend (FastAPI)
```python
# WebSocket endpoint for signaling
@router.websocket("/ws/{client_id}/{client_type}")
```

**Key Features:**
- Connection management for streamers and viewers
- WebRTC signaling (offer/answer/ICE candidates)
- Real-time notifications for new/disconnected streamers

### Frontend Components

#### 1. Live Streams Viewer (`/live-streams`)
- Displays grid of all active video streams
- WebRTC peer connections for each stream
- Real-time connection status indicators

#### 2. Mobile Streaming Interface (`/stream`)
- Camera access and streaming controls
- WebRTC broadcasting to multiple viewers
- Camera switching functionality

#### 3. Static Mobile Page (`/mobile-stream.html`)
- Lightweight alternative for mobile devices
- No Next.js dependencies
- Direct WebRTC implementation

### WebRTC Utilities (`/lib/webrtc.ts`)
- Reusable WebRTC connection class
- Device detection utilities
- Media constraints configuration

## 🔧 Setup Instructions

### 1. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install socket.io-client simple-peer
```

**Backend:**
```bash
cd backend
pip install --break-system-packages python-socketio websockets
```

### 2. Start Services

**Backend Server:**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend Server:**
```bash
cd frontend
npm run dev
```

### 3. Access Points
- **Main App:** http://localhost:3000
- **Live Streams:** http://localhost:3000/live-streams
- **Mobile Streaming:** http://localhost:3000/stream
- **Direct Mobile:** http://localhost:3000/mobile-stream.html

## 📋 Browser Compatibility

### Supported Browsers
- ✅ Chrome (mobile & desktop)
- ✅ Firefox (mobile & desktop)
- ✅ Safari (iOS & macOS)
- ✅ Edge (mobile & desktop)

### Required Permissions
- 📷 Camera access
- 🎤 Microphone access
- 🌐 WebRTC support

## 🔒 Security Considerations

### HTTPS Requirement
- WebRTC requires HTTPS in production
- Use SSL certificates for live deployment
- Local development works with HTTP

### STUN/TURN Servers
- Currently using Google's public STUN servers
- Consider private TURN servers for production
- May need TURN servers for restrictive networks

## 🚀 Deployment

### Production Setup
1. Deploy backend with WebSocket support
2. Configure HTTPS for both frontend and backend
3. Update WebSocket URLs in frontend code
4. Set up proper STUN/TURN servers

### Environment Variables
```env
# Backend
WEBSOCKET_URL=wss://your-api-domain.com

# Frontend
NEXT_PUBLIC_WS_URL=wss://your-api-domain.com
```

## 🎯 Features

### Current Features
- ✅ Multiple simultaneous streams
- ✅ Real-time viewer count
- ✅ Connection status monitoring
- ✅ Camera switching
- ✅ Auto-reconnection
- ✅ Mobile-optimized interface
- ✅ Responsive design

### Potential Enhancements
- 🔄 Stream recording
- 🔄 Chat functionality
- 🔄 Stream quality controls
- 🔄 User authentication
- 🔄 Stream moderation
- 🔄 Analytics dashboard

## 🐛 Troubleshooting

### Common Issues

1. **"Camera not accessible"**
   - Ensure HTTPS in production
   - Check browser permissions
   - Try different browsers

2. **"Connection failed"**
   - Verify backend is running
   - Check WebSocket URL
   - Confirm network connectivity

3. **"No video appearing"**
   - Check WebRTC compatibility
   - Verify STUN server accessibility
   - Try refreshing both pages

### Debug Tools
- Browser DevTools Network tab
- WebRTC internals: `chrome://webrtc-internals/`
- Console logs for connection states

## 📞 Support

For technical support or feature requests, check the console logs and WebRTC connection states. The system includes comprehensive logging for debugging connection issues.