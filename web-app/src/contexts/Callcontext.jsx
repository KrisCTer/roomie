// contexts/CallContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { useSocket } from "./SocketContext";
import { getUserInfo } from "../services/localStorageService";

const CallContext = createContext(null);

// WebRTC Configuration
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export const CallProvider = ({ children }) => {
  const { socket, isConnected } = useSocket();
  const currentUser = getUserInfo();

  // Call State
  const [callState, setCallState] = useState({
    isInCall: false,
    isRinging: false,
    callType: null, // 'voice' | 'video'
    remotePeer: null,
    conversationId: null,
  });

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // Refs
  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // ========== INITIALIZE CALL LISTENERS ==========
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for incoming call
    socket.on("incoming-call", handleIncomingCall);

    // Listen for call accepted
    socket.on("call-accepted", handleCallAccepted);

    // Listen for call rejected
    socket.on("call-rejected", handleCallRejected);

    // Listen for call ended
    socket.on("call-ended", handleCallEnded);

    // Listen for ICE candidate
    socket.on("ice-candidate", handleIceCandidate);

    // Listen for offer
    socket.on("webrtc-offer", handleOffer);

    // Listen for answer
    socket.on("webrtc-answer", handleAnswer);

    return () => {
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("call-rejected", handleCallRejected);
      socket.off("call-ended", handleCallEnded);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("webrtc-offer", handleOffer);
      socket.off("webrtc-answer", handleAnswer);
    };
  }, [socket, isConnected]);

  // ========== START CALL (CALLER) ==========
  const startCall = useCallback(
    async (conversationId, remotePeer, callType = "voice") => {
      try {
        console.log("📞 Starting call:", {
          conversationId,
          remotePeer,
          callType,
        });

        // ⭐ CHECK: Socket must be connected
        if (!socket) {
          throw new Error("Socket not initialized. Please refresh the page.");
        }

        if (!isConnected) {
          throw new Error("Socket not connected. Please wait and try again.");
        }

        // ⭐ CHECK: Remote peer must exist
        if (!remotePeer || !remotePeer.userId) {
          throw new Error("Invalid recipient");
        }

        // Get local media stream
        const constraints = {
          audio: true,
          video: callType === "video",
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setLocalStream(stream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Update call state
        setCallState({
          isInCall: true,
          isRinging: false,
          callType,
          remotePeer,
          conversationId,
        });

        // Create peer connection
        const peerConnection = new RTCPeerConnection(ICE_SERVERS);
        peerConnectionRef.current = peerConnection;

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate && socket && isConnected) {
            socket.emit("ice-candidate", {
              candidate: event.candidate,
              to: remotePeer.userId,
            });
          }
        };

        // Handle remote stream
        peerConnection.ontrack = (event) => {
          console.log("📥 Received remote track");
          setRemoteStream(event.streams[0]);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        // Create offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        // Send call request via socket
        socket.emit("call-user", {
          to: remotePeer.userId,
          from: currentUser.userId,
          conversationId,
          callType,
          offer,
          caller: {
            userId: currentUser.userId,
            username: currentUser.username,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            avatar: currentUser.avatar,
          },
        });

        console.log("✅ Call initiated");
      } catch (error) {
        console.error("❌ Error starting call:", error);
        alert(`Cannot start call: ${error.message}`);
        endCall();
      }
    },
    [socket, isConnected, currentUser, endCall]
  );

  // ========== HANDLE INCOMING CALL ==========
  const handleIncomingCall = useCallback((data) => {
    console.log("📞 Incoming call:", data);

    setCallState({
      isInCall: false,
      isRinging: true,
      callType: data.callType,
      remotePeer: data.caller,
      conversationId: data.conversationId,
      offer: data.offer,
    });

    // Show incoming call UI
  }, []);

  // ========== ACCEPT CALL ==========
  const acceptCall = useCallback(async () => {
    try {
      console.log("✅ Accepting call");

      // ⭐ CHECK: Socket must be connected
      if (!socket || !isConnected) {
        throw new Error("Socket not connected");
      }

      const { callType, remotePeer, offer } = callState;

      // ⭐ CHECK: Must have valid call state
      if (!remotePeer || !offer) {
        throw new Error("Invalid call state");
      }

      // Get local media stream
      const constraints = {
        audio: true,
        video: callType === "video",
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const peerConnection = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = peerConnection;

      // Add local tracks
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket && isConnected) {
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            to: remotePeer.userId,
          });
        }
      };

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log("📥 Received remote track");
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Set remote description (offer)
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      // Create answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      // Send answer
      socket.emit("answer-call", {
        to: remotePeer.userId,
        answer,
      });

      // Update state
      setCallState((prev) => ({
        ...prev,
        isInCall: true,
        isRinging: false,
      }));

      console.log("✅ Call accepted");
    } catch (error) {
      console.error("❌ Error accepting call:", error);
      alert(`Cannot accept call: ${error.message}`);
      rejectCall();
    }
  }, [callState, socket, isConnected, rejectCall]);

  // ========== REJECT CALL ==========
  const rejectCall = useCallback(() => {
    console.log("❌ Rejecting call");

    const { remotePeer } = callState;

    // Send rejection if socket available and remotePeer exists
    if (socket && isConnected && remotePeer?.userId) {
      socket.emit("reject-call", {
        to: remotePeer.userId,
      });
    }

    setCallState({
      isInCall: false,
      isRinging: false,
      callType: null,
      remotePeer: null,
      conversationId: null,
    });
  }, [callState, socket, isConnected]);

  // ========== END CALL ==========
  const endCall = useCallback(() => {
    console.log("📴 Ending call");

    // Notify remote peer if socket available
    if (socket && isConnected && callState.remotePeer?.userId) {
      socket.emit("end-call", {
        to: callState.remotePeer.userId,
      });
    }

    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Reset state
    setLocalStream(null);
    setRemoteStream(null);
    setCallState({
      isInCall: false,
      isRinging: false,
      callType: null,
      remotePeer: null,
      conversationId: null,
    });

    console.log("✅ Call ended");
  }, [callState, localStream, socket, isConnected]);

  // ========== HANDLE CALL ACCEPTED ==========
  const handleCallAccepted = useCallback((data) => {
    console.log("✅ Call accepted by remote peer");
    // Call state already updated in startCall
  }, []);

  // ========== HANDLE CALL REJECTED ==========
  const handleCallRejected = useCallback(() => {
    console.log("❌ Call rejected by remote peer");
    alert("Call was rejected");
    endCall();
  }, [endCall]);

  // ========== HANDLE CALL ENDED ==========
  const handleCallEnded = useCallback(() => {
    console.log("📴 Call ended by remote peer");
    endCall();
  }, [endCall]);

  // ========== HANDLE ICE CANDIDATE ==========
  const handleIceCandidate = useCallback(async (data) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
        console.log("✅ ICE candidate added");
      }
    } catch (error) {
      console.error("❌ Error adding ICE candidate:", error);
    }
  }, []);

  // ========== HANDLE OFFER (FOR CALLEE) ==========
  const handleOffer = useCallback(async (data) => {
    // This is handled in handleIncomingCall
    console.log("📥 Received offer");
  }, []);

  // ========== HANDLE ANSWER (FOR CALLER) ==========
  const handleAnswer = useCallback(async (data) => {
    try {
      console.log("📥 Received answer");
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
        console.log("✅ Remote description set");
      }
    } catch (error) {
      console.error("❌ Error setting remote description:", error);
    }
  }, []);

  // ========== TOGGLE MUTE ==========
  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled; // Return muted state
      }
    }
    return false;
  }, [localStream]);

  // ========== TOGGLE VIDEO ==========
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return !videoTrack.enabled; // Return video off state
      }
    }
    return false;
  }, [localStream]);

  const value = {
    callState,
    localStream,
    remoteStream,
    localVideoRef,
    remoteVideoRef,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};

// ========== CUSTOM HOOK ==========
export const useCall = () => {
  const context = useContext(CallContext);

  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }

  return context;
};

export default CallContext;
