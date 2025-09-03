"use client";

import { useEffect, useState, useRef } from "react";
import { Video, VideoOff, Wifi, WifiOff, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebRTCConnection, supportsWebRTC, isMobileDevice, getMediaConstraints } from "@/lib/webrtc";

interface ViewerConnection {
  viewerId: string;
  peerConnection: RTCPeerConnection;
  isConnected: boolean;
}

export default function StreamPage() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [viewerCount, setViewerCount] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const streamerIdRef = useRef<string>(`streamer_${Date.now()}`);
  const viewersRef = useRef<Map<string, ViewerConnection>>(new Map());

  // WebRTC configuration
  const rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" }
    ]
  };

  useEffect(() => {
    connectToSignalingServer();
    
    return () => {
      stopStreaming();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectToSignalingServer = () => {
    try {
      const ws = new WebSocket(`ws://localhost:8000/video/ws/${streamerIdRef.current}/streamer`);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionStatus("Connected");
        console.log("Connected to signaling server as streamer");
      };

      ws.onclose = () => {
        setIsConnected(false);
        setConnectionStatus("Disconnected");
        console.log("Disconnected from signaling server");
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          connectToSignalingServer();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("Connection Error");
      };

      ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        await handleSignalingMessage(message);
      };
    } catch (error) {
      console.error("Failed to connect to signaling server:", error);
      setConnectionStatus("Failed to connect");
    }
  };

  const handleSignalingMessage = async (message: any) => {
    console.log("Received signaling message:", message);

    switch (message.type) {
      case "stream_request":
        // New viewer wants to connect
        await handleNewViewer(message.from);
        break;

      case "answer":
        // Received answer from viewer
        await handleAnswer(message.answer, message.from);
        break;

      case "ice-candidate":
        // Received ICE candidate from viewer
        await handleIceCandidate(message.candidate, message.from);
        break;
    }
  };

  const handleNewViewer = async (viewerId: string) => {
    if (!localStream || !wsRef.current) return;

    try {
      // Create new peer connection for this viewer
      const peerConnection = new RTCPeerConnection(rtcConfig);
      
      // Add local stream tracks to the peer connection
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && wsRef.current) {
          wsRef.current.send(JSON.stringify({
            type: "ice-candidate",
            candidate: event.candidate,
            target: viewerId
          }));
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log(`Connection state with viewer ${viewerId}:`, peerConnection.connectionState);
        const viewerConnection = viewersRef.current.get(viewerId);
        if (viewerConnection) {
          viewerConnection.isConnected = peerConnection.connectionState === "connected";
          updateViewerCount();
        }
      };

      // Store viewer connection
      viewersRef.current.set(viewerId, {
        viewerId,
        peerConnection,
        isConnected: false
      });

      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      wsRef.current.send(JSON.stringify({
        type: "offer",
        offer: offer,
        target: viewerId
      }));

      updateViewerCount();
    } catch (error) {
      console.error("Error handling new viewer:", error);
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit, viewerId: string) => {
    const viewerConnection = viewersRef.current.get(viewerId);
    if (!viewerConnection) return;

    try {
      await viewerConnection.peerConnection.setRemoteDescription(answer);
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit, viewerId: string) => {
    const viewerConnection = viewersRef.current.get(viewerId);
    if (!viewerConnection) return;

    try {
      await viewerConnection.peerConnection.addIceCandidate(candidate);
    } catch (error) {
      console.error("Error handling ICE candidate:", error);
    }
  };

  const updateViewerCount = () => {
    const connectedViewers = Array.from(viewersRef.current.values())
      .filter(viewer => viewer.isConnected).length;
    setViewerCount(connectedViewers);
  };

  const startStreaming = async () => {
    try {
      setError("");
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user", // Front camera by default
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });

      setLocalStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsStreaming(true);
      console.log("Started streaming");
      
    } catch (err: any) {
      console.error("Error starting stream:", err);
      setError(`Failed to start streaming: ${err.message}`);
    }
  };

  const stopStreaming = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
      });
      setLocalStream(null);
    }

    // Close all peer connections
    viewersRef.current.forEach(viewer => {
      viewer.peerConnection.close();
    });
    viewersRef.current.clear();

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsStreaming(false);
    setViewerCount(0);
    console.log("Stopped streaming");
  };

  const switchCamera = async () => {
    if (!localStream) return;

    try {
      const videoTrack = localStream.getVideoTracks()[0];
      const currentFacingMode = videoTrack.getSettings().facingMode;
      
      // Stop current stream
      stopStreaming();
      
      // Start new stream with opposite camera
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentFacingMode === "user" ? "environment" : "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });

      setLocalStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      
    } catch (err: any) {
      console.error("Error switching camera:", err);
      setError(`Failed to switch camera: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Mobile Streaming</h1>
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center text-green-400">
                <Wifi className="h-4 w-4 mr-1" />
                <span className="text-sm">Connected</span>
              </div>
            ) : (
              <div className="flex items-center text-red-400">
                <WifiOff className="h-4 w-4 mr-1" />
                <span className="text-sm">{connectionStatus}</span>
              </div>
            )}
            
            <div className="flex items-center text-gray-300">
              <Users className="h-4 w-4 mr-1" />
              <span className="text-sm">{viewerCount} viewers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Error Display */}
        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-4">
            <p>{error}</p>
          </div>
        )}

        {/* Video Preview */}
        <div className="relative mb-6">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-lg bg-gray-800"
            style={{ maxHeight: "60vh" }}
          />
          
          {!isStreaming && (
            <div className="absolute inset-0 bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Video className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-400">Camera preview will appear here</p>
              </div>
            </div>
          )}
          
          {isStreaming && (
            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              🔴 LIVE
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex space-x-4">
            {!isStreaming ? (
              <Button 
                onClick={startStreaming}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3"
                disabled={!isConnected}
              >
                <Video className="h-5 w-5 mr-2" />
                Start Streaming
              </Button>
            ) : (
              <Button 
                onClick={stopStreaming}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3"
              >
                <VideoOff className="h-5 w-5 mr-2" />
                Stop Streaming
              </Button>
            )}
            
            {isStreaming && (
              <Button 
                onClick={switchCamera}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3"
              >
                <Settings className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Stream Info */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Stream Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Streamer ID:</span>
                <span className="font-mono">{streamerIdRef.current}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={isStreaming ? "text-green-400" : "text-red-400"}>
                  {isStreaming ? "Broadcasting" : "Not streaming"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Viewers:</span>
                <span>{viewerCount} watching</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Connection:</span>
                <span className={isConnected ? "text-green-400" : "text-red-400"}>
                  {connectionStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-900 rounded-lg p-4">
            <h3 className="font-semibold mb-2">How to Stream</h3>
            <ol className="text-sm text-blue-200 space-y-1">
              <li>1. Allow camera and microphone access</li>
              <li>2. Tap "Start Streaming" to begin broadcasting</li>
              <li>3. Your video will be visible to viewers in real-time</li>
              <li>4. Share this page URL with others to let them stream too</li>
            </ol>
          </div>
          
          {/* Tips */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Tips for Better Streaming</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Keep your device stable for better video quality</li>
              <li>• Ensure good lighting for clearer video</li>
              <li>• Use Wi-Fi for more stable connection</li>
              <li>• Keep the browser tab active while streaming</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}