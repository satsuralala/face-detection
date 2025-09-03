"use client";

import { useEffect, useState, useRef } from "react";
import { Video, Users, Clock, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "../../components/header";
import { WebRTCConnection, supportsWebRTC } from "@/lib/webrtc";

interface StreamInfo {
  streamerId: string;
  isConnected: boolean;
  peerConnection: RTCPeerConnection | null;
  stream: MediaStream | null;
  lastSeen: Date;
}

export default function LiveStreamsPage() {
  const [streams, setStreams] = useState<Map<string, StreamInfo>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const wsRef = useRef<WebSocket | null>(null);
  const viewerIdRef = useRef<string>(`viewer_${Date.now()}`);

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
      // Cleanup on component unmount
      if (wsRef.current) {
        wsRef.current.close();
      }
      streams.forEach((streamInfo) => {
        if (streamInfo.peerConnection) {
          streamInfo.peerConnection.close();
        }
      });
    };
  }, []);

  const connectToSignalingServer = () => {
    try {
      // Connect to the WebSocket signaling server
      const ws = new WebSocket(`ws://localhost:8000/video/ws/${viewerIdRef.current}/viewer`);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionStatus("Connected");
        console.log("Connected to signaling server");
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
      case "active_streamers":
        // Initialize connections for active streamers
        message.streamers.forEach((streamerId: string) => {
          if (!streams.has(streamerId)) {
            requestStreamFromStreamer(streamerId);
          }
        });
        break;

      case "new_streamer":
        // New streamer joined, request their stream
        if (!streams.has(message.streamerId)) {
          requestStreamFromStreamer(message.streamerId);
        }
        break;

      case "streamer_left":
        // Remove disconnected streamer
        const streamInfo = streams.get(message.streamerId);
        if (streamInfo) {
          if (streamInfo.peerConnection) {
            streamInfo.peerConnection.close();
          }
          setStreams(prev => {
            const newStreams = new Map(prev);
            newStreams.delete(message.streamerId);
            return newStreams;
          });
        }
        break;

      case "offer":
        // Received offer from streamer
        await handleOffer(message.offer, message.from);
        break;

      case "answer":
        // Received answer from streamer
        await handleAnswer(message.answer, message.from);
        break;

      case "ice-candidate":
        // Received ICE candidate
        await handleIceCandidate(message.candidate, message.from);
        break;
    }
  };

  const requestStreamFromStreamer = async (streamerId: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    // Create peer connection for this streamer
    const peerConnection = new RTCPeerConnection(rtcConfig);
    
    // Set up stream info
    const streamInfo: StreamInfo = {
      streamerId,
      isConnected: false,
      peerConnection,
      stream: null,
      lastSeen: new Date()
    };

    // Handle incoming stream
    peerConnection.ontrack = (event) => {
      console.log("Received remote stream from:", streamerId);
      streamInfo.stream = event.streams[0];
      streamInfo.isConnected = true;
      setStreams(prev => new Map(prev.set(streamerId, { ...streamInfo })));
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: "ice-candidate",
          candidate: event.candidate,
          target: streamerId
        }));
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state with ${streamerId}:`, peerConnection.connectionState);
      if (peerConnection.connectionState === "disconnected" || 
          peerConnection.connectionState === "failed") {
        streamInfo.isConnected = false;
        setStreams(prev => new Map(prev.set(streamerId, { ...streamInfo })));
      }
    };

    setStreams(prev => new Map(prev.set(streamerId, streamInfo)));

    // Request stream from streamer
    wsRef.current.send(JSON.stringify({
      type: "request_stream",
      streamerId: streamerId
    }));
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit, streamerId: string) => {
    const streamInfo = streams.get(streamerId);
    if (!streamInfo || !streamInfo.peerConnection) return;

    try {
      await streamInfo.peerConnection.setRemoteDescription(offer);
      const answer = await streamInfo.peerConnection.createAnswer();
      await streamInfo.peerConnection.setLocalDescription(answer);

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "answer",
          answer: answer,
          target: streamerId
        }));
      }
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit, streamerId: string) => {
    const streamInfo = streams.get(streamerId);
    if (!streamInfo || !streamInfo.peerConnection) return;

    try {
      await streamInfo.peerConnection.setRemoteDescription(answer);
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit, streamerId: string) => {
    const streamInfo = streams.get(streamerId);
    if (!streamInfo || !streamInfo.peerConnection) return;

    try {
      await streamInfo.peerConnection.addIceCandidate(candidate);
    } catch (error) {
      console.error("Error handling ICE candidate:", error);
    }
  };

  const VideoStream = ({ streamInfo }: { streamInfo: StreamInfo }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
      if (videoRef.current && streamInfo.stream) {
        videoRef.current.srcObject = streamInfo.stream;
      }
    }, [streamInfo.stream]);

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative">
          {streamInfo.stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <Video className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-500">Connecting to stream...</p>
              </div>
            </div>
          )}
          
          {/* Connection status indicator */}
          <div className="absolute top-2 right-2">
            {streamInfo.isConnected ? (
              <div className="flex items-center bg-green-500 text-white px-2 py-1 rounded text-xs">
                <Wifi className="h-3 w-3 mr-1" />
                Live
              </div>
            ) : (
              <div className="flex items-center bg-red-500 text-white px-2 py-1 rounded text-xs">
                <WifiOff className="h-3 w-3 mr-1" />
                Connecting
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">Stream {streamInfo.streamerId}</h3>
          <div className="flex items-center text-gray-600 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            Connected: {streamInfo.lastSeen.toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Live Video Streams</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              {isConnected ? (
                <div className="flex items-center text-green-600">
                  <Wifi className="h-5 w-5 mr-2" />
                  <span className="font-medium">Connected</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <WifiOff className="h-5 w-5 mr-2" />
                  <span className="font-medium">{connectionStatus}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-2" />
              <span>{streams.size} Active Streams</span>
            </div>
          </div>
        </div>

        {/* Instructions for mobile users */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">How to Start Streaming</h2>
          <div className="text-blue-800">
            <p className="mb-2">To stream video from your mobile phone:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Open your mobile browser and go to: <code className="bg-blue-100 px-2 py-1 rounded">http://your-domain.com/stream</code></li>
              <li>Allow camera access when prompted</li>
              <li>Tap "Start Streaming" to begin broadcasting</li>
              <li>Your video will appear here automatically</li>
            </ol>
          </div>
        </div>

        {/* Video Streams Grid */}
        {streams.size === 0 ? (
          <div className="text-center py-16">
            <Video className="mx-auto h-24 w-24 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Streams</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Waiting for mobile devices to connect and start streaming. 
              Share the streaming URL with users to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from(streams.values()).map((streamInfo) => (
              <VideoStream key={streamInfo.streamerId} streamInfo={streamInfo} />
            ))}
          </div>
        )}

        {/* Connection Info */}
        <div className="mt-12 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Viewer ID:</span>
              <p className="text-gray-600 font-mono">{viewerIdRef.current}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">WebSocket Status:</span>
              <p className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {connectionStatus}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Active Connections:</span>
              <p className="text-gray-600">{streams.size} streams</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}