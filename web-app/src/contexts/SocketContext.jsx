// contexts/SocketContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

// Ã¢Â­Â MUST USE DEFAULT IMPORT FOR socket.io-client v2.3.0
import io from "socket.io-client";

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

  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.warn("Ã¢Å¡  No token found, skipping socket connection");
      return;
    }


    // Ã¢Â­Â Version 2.3.0 Ã¢â‚¬â€ Required for Netty-SocketIO compatibility
    const socketInstance = io(SOCKET_URL, {
      query: `token=${token}`,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on("disconnect", (reason) => {
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Ã¢ÂÅ’ WebSocket connection error:", err.message);
      setError(err.message);
      setIsConnected(false);
    });
    socketInstance.on("new_message", (data) => {

      if (messageCallbacksRef.current.onMessageReceived) {
        messageCallbacksRef.current.onMessageReceived(data);
      }
    });

    socketInstance.on("message_sent", (data) => {

      if (messageCallbacksRef.current.onMessageSent) {
        messageCallbacksRef.current.onMessageSent(data);
      }
    });
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const registerMessageCallbacks = useCallback((callbacks) => {
    messageCallbacksRef.current = {
      onMessageReceived: callbacks.onMessageReceived || null,
      onMessageSent: callbacks.onMessageSent || null,
    };
  }, []);

  const sendMessage = useCallback(
    (event, data) => {
      if (!socket || !isConnected) {
        console.warn("Ã¢Å¡  Socket not connected, cannot send message");
        return false;
      }

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

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export default SocketContext;
