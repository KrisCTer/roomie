import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useSocket } from "../../../contexts/SocketContext";
import { getUserInfo } from "../../../services/localStorageService";

const CallContext = createContext(null);

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const CallProvider = ({ children }) => {
  const { socket, isConnected } = useSocket();
  const currentUser = getUserInfo();

  const [callState, setCallState] = useState({
    isInCall: false,
    isRinging: false,
    remotePeer: null,
    callType: null,
    conversationId: null,
    offer: null,
  });

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // =====================================================
  // 1) END CALL — MUST BE DECLARED FIRST ✔
  // =====================================================
  const endCall = useCallback(() => {
    console.log("📴 Ending call");

    if (socket && isConnected && callState.remotePeer?.userId) {
      socket.emit("end-call", { to: callState.remotePeer.userId });
    }

    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setLocalStream(null);
    setRemoteStream(null);
    setCallState({
      isInCall: false,
      isRinging: false,
      remotePeer: null,
      offer: null,
      callType: null,
      conversationId: null,
    });

    console.log("✅ Call ended");
  }, [socket, isConnected, callState.remotePeer, localStream]);

  // =====================================================
  // 2) REJECT CALL
  // =====================================================
  const rejectCall = useCallback(() => {
    console.log("❌ Rejecting call");

    if (socket && isConnected && callState.remotePeer?.userId) {
      socket.emit("reject-call", { to: callState.remotePeer.userId });
    }

    setCallState({
      isInCall: false,
      isRinging: false,
      remotePeer: null,
      callType: null,
      conversationId: null,
      offer: null,
    });
  }, [socket, isConnected, callState.remotePeer]);

  // =====================================================
  // 3) START CALL
  // =====================================================
  const startCall = useCallback(
    async (conversationId, remotePeer, callType = "voice") => {
      try {
        console.log("📞 Start call →", remotePeer);

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === "video",
        });

        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnectionRef.current = pc;

        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        pc.ontrack = (e) => {
          setRemoteStream(e.streams[0]);
          if (remoteVideoRef.current)
            remoteVideoRef.current.srcObject = e.streams[0];
        };

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            socket.emit("ice-candidate", {
              to: remotePeer.userId,
              candidate: e.candidate,
            });
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("call-user", {
          to: remotePeer.userId,
          from: currentUser.userId,
          conversationId,
          callType,
          offer,
          caller: currentUser,
        });

        setCallState({
          isInCall: true,
          isRinging: false,
          conversationId,
          remotePeer,
          callType,
        });
      } catch (err) {
        console.error("❌ Error:", err);
        endCall();
      }
    },
    [socket, isConnected, currentUser, endCall]
  );

  // =====================================================
  // 4) HANDLE INCOMING CALL
  // =====================================================
  const handleIncomingCall = useCallback((data) => {
    console.log("📥 Incoming call", data);

    setCallState({
      isInCall: false,
      isRinging: true,
      callType: data.callType,
      conversationId: data.conversationId,
      remotePeer: data.caller,
      offer: data.offer,
    });
  }, []);

  // =====================================================
  // 5) ACCEPT CALL
  // =====================================================
  const acceptCall = useCallback(async () => {
    try {
      const { remotePeer, offer, callType } = callState;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video",
      });

      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      pc.ontrack = (e) => {
        setRemoteStream(e.streams[0]);
        if (remoteVideoRef.current)
          remoteVideoRef.current.srcObject = e.streams[0];
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("ice-candidate", {
            to: remotePeer.userId,
            candidate: e.candidate,
          });
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer-call", {
        to: remotePeer.userId,
        answer,
      });

      setCallState((s) => ({ ...s, isInCall: true, isRinging: false }));
    } catch (err) {
      console.error(err);
      rejectCall();
    }
  }, [callState, socket, isConnected, rejectCall]);

  // =====================================================
  // 6) HANDLE SOCKET EVENTS
  // =====================================================
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-ended", endCall);
    socket.on("call-rejected", rejectCall);

    return () => {
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-ended", endCall);
      socket.off("call-rejected", rejectCall);
    };
  }, [socket, isConnected, handleIncomingCall, endCall, rejectCall]);

  // =====================================================
  return (
    <CallContext.Provider
      value={{
        callState,
        localStream,
        remoteStream,
        localVideoRef,
        remoteVideoRef,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCall must be inside CallProvider");
  return ctx;
};

export default CallContext;
