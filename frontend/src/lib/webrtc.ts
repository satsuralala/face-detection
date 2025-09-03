// WebRTC utility functions and configuration

export const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ]
};

export interface SignalingMessage {
  type: string;
  [key: string]: any;
}

export class WebRTCConnection {
  private ws: WebSocket | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private isStreamer: boolean = false;
  
  constructor(
    private clientId: string,
    private clientType: 'streamer' | 'viewer',
    private onMessage?: (message: SignalingMessage) => void,
    private onConnectionStateChange?: (clientId: string, state: RTCPeerConnectionState) => void
  ) {
    this.isStreamer = clientType === 'streamer';
  }

  async connect(serverUrl: string = 'ws://localhost:8000'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${serverUrl}/video/ws/${this.clientId}/${this.clientType}`);
        
        this.ws.onopen = () => {
          console.log(`Connected as ${this.clientType}`);
          resolve();
        };
        
        this.ws.onclose = () => {
          console.log('WebSocket connection closed');
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
        
        this.ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private async handleMessage(message: SignalingMessage) {
    if (this.onMessage) {
      this.onMessage(message);
    }

    switch (message.type) {
      case 'offer':
        await this.handleOffer(message.offer, message.from);
        break;
      case 'answer':
        await this.handleAnswer(message.answer, message.from);
        break;
      case 'ice-candidate':
        await this.handleIceCandidate(message.candidate, message.from);
        break;
    }
  }

  private async handleOffer(offer: RTCSessionDescriptionInit, fromId: string) {
    const pc = this.getOrCreatePeerConnection(fromId);
    
    try {
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      this.sendMessage({
        type: 'answer',
        answer: answer,
        target: fromId
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit, fromId: string) {
    const pc = this.peerConnections.get(fromId);
    if (!pc) return;
    
    try {
      await pc.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  private async handleIceCandidate(candidate: RTCIceCandidateInit, fromId: string) {
    const pc = this.peerConnections.get(fromId);
    if (!pc) return;
    
    try {
      await pc.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  private getOrCreatePeerConnection(peerId: string): RTCPeerConnection {
    if (this.peerConnections.has(peerId)) {
      return this.peerConnections.get(peerId)!;
    }

    const pc = new RTCPeerConnection(rtcConfig);
    this.peerConnections.set(peerId, pc);

    // Add local stream if we're a streamer
    if (this.isStreamer && this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendMessage({
          type: 'ice-candidate',
          candidate: event.candidate,
          target: peerId
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(peerId, pc.connectionState);
      }
    };

    return pc;
  }

  async setLocalStream(stream: MediaStream) {
    this.localStream = stream;
    
    // Add tracks to existing peer connections
    this.peerConnections.forEach(pc => {
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
    });
  }

  async createOffer(targetId: string): Promise<void> {
    const pc = this.getOrCreatePeerConnection(targetId);
    
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      this.sendMessage({
        type: 'offer',
        offer: offer,
        target: targetId
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  requestStream(streamerId: string) {
    this.sendMessage({
      type: 'request_stream',
      streamerId: streamerId
    });
  }

  private sendMessage(message: SignalingMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  getPeerConnection(peerId: string): RTCPeerConnection | undefined {
    return this.peerConnections.get(peerId);
  }

  disconnect() {
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Utility function to check if device supports WebRTC
export const supportsWebRTC = (): boolean => {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    window.RTCPeerConnection
  );
};

// Utility function to detect mobile device
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Utility function to get media constraints based on device
export const getMediaConstraints = (isMobile: boolean = false) => {
  if (isMobile) {
    return {
      video: {
        facingMode: "user",
        width: { ideal: 720 },
        height: { ideal: 1280 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true
      }
    };
  }
  
  return {
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true
    }
  };
};