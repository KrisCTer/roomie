// src/contexts/SocketContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { getToken, getCompleteUserInfo } from "../services/localStorageService";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within SocketProvider");
  return context;
};

export const SocketProvider = ({ children }) => {
  // ⭐ Lấy từ localStorage
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [connected, setConnected] = useState(false);
  const stompClientRef = useRef(null);
  const notificationCallbackRef = useRef(null);
  const messageCallbackRef = useRef(null);

  // ⭐ Load user info
  useEffect(() => {
    const storedToken = getToken();
    const completeUser = getCompleteUserInfo();

    if (storedToken && completeUser) {
      setToken(storedToken);
      setUser({
        id: completeUser.userId,
        userId: completeUser.userId,
        username: completeUser.username,
      });
    }
  }, []);

  useEffect(() => {
    if (!user?.id || !token) return;

    const socket = new SockJS(
      "http://localhost:8090/notification/ws/notifications"
    );
    const stompClient = Stomp.over(socket);
    stompClient.debug = () => {};

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    stompClient.connect(
      headers,
      () => {
        console.log("✅ WebSocket Connected");
        setConnected(true);
        stompClientRef.current = stompClient;

        // Subscribe to notifications
        stompClient.subscribe(
          `/user/${user.id}/queue/notifications`,
          (message) => {
            try {
              const notification = JSON.parse(message.body);
              if (notificationCallbackRef.current) {
                notificationCallbackRef.current(notification);
              }
            } catch (error) {
              console.error("Error parsing notification:", error);
            }
          }
        );

        // Subscribe to messages (existing chat functionality)
        stompClient.subscribe(`/user/${user.id}/queue/messages`, (message) => {
          try {
            const chatMessage = JSON.parse(message.body);
            if (messageCallbackRef.current) {
              messageCallbackRef.current(chatMessage);
            }
          } catch (error) {
            console.error("Error parsing message:", error);
          }
        });
      },
      (error) => {
        console.error("❌ WebSocket Error:", error);
        setConnected(false);
      }
    );

    return () => {
      if (stompClient && connected) {
        stompClient.disconnect();
        setConnected(false);
      }
    };
  }, [user?.id, token]);

  const onNotification = (callback) => {
    notificationCallbackRef.current = callback;
  };

  const onMessage = (callback) => {
    messageCallbackRef.current = callback;
  };

  const sendMessage = (destination, message) => {
    if (stompClientRef.current && connected) {
      stompClientRef.current.send(destination, {}, JSON.stringify(message));
    }
  };

  const value = {
    socket: stompClientRef.current,
    connected,
    isConnected: connected,
    onNotification,
    onMessage,
    sendMessage,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
