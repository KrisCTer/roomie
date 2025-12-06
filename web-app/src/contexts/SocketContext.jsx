// contexts/SocketContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { io } from "socket.io-client";
import { getToken } from "../services/localStorageService";

const SocketContext = createContext(null);

const SOCKET_URL = "http://localhost:8099";

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const messageCallbacksRef = useRef({
    onMessageReceived: null,
    onMessageSent: null,
  });

  // ========== INITIALIZE SOCKET ==========
  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.warn("⚠️ No token found, skipping socket connection");
      return;
    }

    console.log("🔌 Initializing WebSocket connection...");

    const socketInstance = io(SOCKET_URL, {
      query: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // ===== CONNECTION EVENTS =====
    socketInstance.on("connect", () => {
      console.log("✅ WebSocket connected:", socketInstance.id);
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ WebSocket disconnected:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("❌ WebSocket connection error:", err.message);
      setError(err.message);
      setIsConnected(false);
    });

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log("🔄 WebSocket reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on("reconnect_error", (err) => {
      console.error("❌ WebSocket reconnect error:", err.message);
    });

    socketInstance.on("reconnect_failed", () => {
      console.error("❌ WebSocket reconnect failed after max attempts");
      setError("Failed to reconnect to server");
    });

    // ===== MESSAGE EVENTS =====
    socketInstance.on("message", (data) => {
      console.log('📩 Socket event "message":', data);

      if (messageCallbacksRef.current.onMessageReceived) {
        messageCallbacksRef.current.onMessageReceived(data);
      }
    });

    socketInstance.on("message_sent", (data) => {
      console.log('📤 Socket event "message_sent":', data);

      if (messageCallbacksRef.current.onMessageSent) {
        messageCallbacksRef.current.onMessageSent(data);
      }
    });

    setSocket(socketInstance);

    // Cleanup
    return () => {
      console.log("🔌 Cleaning up socket connection");
      socketInstance.disconnect();
    };
  }, []);

  // ========== REGISTER MESSAGE CALLBACKS ==========
  const registerMessageCallbacks = useCallback((callbacks) => {
    console.log("📝 Registering message callbacks:", {
      hasOnMessageReceived: !!callbacks.onMessageReceived,
      hasOnMessageSent: !!callbacks.onMessageSent,
    });

    messageCallbacksRef.current = {
      onMessageReceived: callbacks.onMessageReceived || null,
      onMessageSent: callbacks.onMessageSent || null,
    };
  }, []);

  // ========== SEND MESSAGE (OPTIONAL - mainly using REST API) ==========
  const sendMessage = useCallback(
    (event, data) => {
      if (!socket || !isConnected) {
        console.warn("⚠️ Socket not connected, cannot send message");
        return false;
      }

      console.log("📤 Emitting socket event:", event, data);
      socket.emit(event, data);
      return true;
    },
    [socket, isConnected]
  );

  const value = {
    socket,
    isConnected,
    error,
    registerMessageCallbacks,
    sendMessage,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

// ========== CUSTOM HOOK ==========
export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  return context;
};

export default SocketContext;
