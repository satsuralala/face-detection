from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # Store active connections: {connection_id: websocket}
        self.active_connections: Dict[str, WebSocket] = {}
        # Store streamers (mobile devices): {streamer_id: websocket}
        self.streamers: Dict[str, WebSocket] = {}
        # Store viewers (web browsers): {viewer_id: websocket}
        self.viewers: Dict[str, WebSocket] = {}
        
    async def connect(self, websocket: WebSocket, client_id: str, client_type: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        
        if client_type == "streamer":
            self.streamers[client_id] = websocket
            logger.info(f"Streamer {client_id} connected")
            # Notify all viewers about new streamer
            await self.notify_viewers_new_streamer(client_id)
        elif client_type == "viewer":
            self.viewers[client_id] = websocket
            logger.info(f"Viewer {client_id} connected")
            # Send list of active streamers to new viewer
            await self.send_active_streamers_to_viewer(websocket)
            
    async def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            
        if client_id in self.streamers:
            del self.streamers[client_id]
            logger.info(f"Streamer {client_id} disconnected")
            # Notify all viewers about disconnected streamer
            await self.notify_viewers_streamer_left(client_id)
            
        if client_id in self.viewers:
            del self.viewers[client_id]
            logger.info(f"Viewer {client_id} disconnected")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
        
    async def send_to_client(self, message: dict, client_id: str):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_text(json.dumps(message))
    
    async def broadcast_to_viewers(self, message: dict):
        for viewer_ws in self.viewers.values():
            try:
                await viewer_ws.send_text(json.dumps(message))
            except:
                pass  # Handle disconnected clients
                
    async def notify_viewers_new_streamer(self, streamer_id: str):
        message = {
            "type": "new_streamer",
            "streamerId": streamer_id,
            "timestamp": str(int(__import__('time').time() * 1000))
        }
        await self.broadcast_to_viewers(message)
        
    async def notify_viewers_streamer_left(self, streamer_id: str):
        message = {
            "type": "streamer_left", 
            "streamerId": streamer_id
        }
        await self.broadcast_to_viewers(message)
        
    async def send_active_streamers_to_viewer(self, websocket: WebSocket):
        active_streamers = list(self.streamers.keys())
        message = {
            "type": "active_streamers",
            "streamers": active_streamers
        }
        await websocket.send_text(json.dumps(message))

# Global connection manager instance
manager = ConnectionManager()

@router.websocket("/ws/{client_id}/{client_type}")
async def websocket_endpoint(websocket: WebSocket, client_id: str, client_type: str):
    await manager.connect(websocket, client_id, client_type)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "offer":
                # Forward offer from streamer to specific viewer
                target_client = message.get("target")
                if target_client:
                    await manager.send_to_client({
                        "type": "offer",
                        "offer": message.get("offer"),
                        "from": client_id
                    }, target_client)
                    
            elif message.get("type") == "answer":
                # Forward answer from viewer to specific streamer
                target_client = message.get("target")
                if target_client:
                    await manager.send_to_client({
                        "type": "answer",
                        "answer": message.get("answer"),
                        "from": client_id
                    }, target_client)
                    
            elif message.get("type") == "ice-candidate":
                # Forward ICE candidate between peers
                target_client = message.get("target")
                if target_client:
                    await manager.send_to_client({
                        "type": "ice-candidate",
                        "candidate": message.get("candidate"),
                        "from": client_id
                    }, target_client)
                    
            elif message.get("type") == "request_stream":
                # Viewer requesting stream from specific streamer
                streamer_id = message.get("streamerId")
                if streamer_id in manager.streamers:
                    await manager.send_to_client({
                        "type": "stream_request",
                        "from": client_id
                    }, streamer_id)
                    
    except WebSocketDisconnect:
        await manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"Error in websocket connection: {e}")
        await manager.disconnect(client_id)