// src/components/chat/ChatBox.jsx
import React, { useState, useEffect, useRef } from "react";
import Draggable from "react-draggable";
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  CircularProgress,
  Fab,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Chat as ChatIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import aiService from "../../services/aiService";

const ChatBox = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [showConversations, setShowConversations] = useState(false);

  const messagesEndRef = useRef(null);
  const dragRef = useRef(null);

  // Load conversations
  useEffect(() => {
    if (open) {
      loadConversations();
    }
  }, [open]);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    }
  }, [currentConversationId]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const response = await aiService.getConversations();
      setConversations(response.content || []);
    } catch (error) {
      console.error("❌ Error loading conversations:", error);
      // Show user-friendly error
      if (error.response?.status === 401) {
        console.warn("Not authenticated. Please login first.");
      }
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const messages = await aiService.getMessages(conversationId);
      setMessages(messages || []);
    } catch (error) {
      console.error("❌ Error loading messages:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput("");
    setLoading(true);

    try {
      const response = await aiService.chat(
        currentInput,
        currentConversationId
      );

      const aiMessage = {
        role: "assistant",
        content: response.content,
        createdAt: response.timestamp || new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Update conversation ID if it's a new conversation
      if (!currentConversationId && response.conversationId) {
        setCurrentConversationId(response.conversationId);
        loadConversations();
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);

      let errorMessage = "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.";

      if (error.response?.status === 401) {
        errorMessage = "Bạn cần đăng nhập để sử dụng chat AI.";
      } else if (error.response?.status === 429) {
        errorMessage = "Bạn đã gửi quá nhiều tin nhắn. Vui lòng đợi một chút.";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
          createdAt: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setShowConversations(false);
  };

  const handleSelectConversation = (conversationId) => {
    setCurrentConversationId(conversationId);
    setShowConversations(false);
  };

  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    try {
      await aiService.deleteConversation(conversationId);
      loadConversations();
      if (currentConversationId === conversationId) {
        handleNewConversation();
      }
    } catch (error) {
      console.error("❌ Error deleting conversation:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Draggable
        nodeRef={dragRef}
        bounds="body"
        defaultPosition={{
          x: window.innerWidth - 100,
          y: window.innerHeight - 200,
        }}
      >
        <div
          ref={dragRef}
          style={{
            position: "fixed",
            zIndex: 1300,
          }}
        >
          <Fab
            color="primary"
            onClick={() => setOpen(!open)}
            sx={{ width: 56, height: 56 }}
          >
            {open ? <CloseIcon /> : <ChatIcon />}
          </Fab>
        </div>
      </Draggable>

      {/* Chat Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 400 },
            maxWidth: "100vw",
          },
        }}
      >
        {/* Header */}
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <BotIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Trợ lý Roomie
            </Typography>
            <IconButton
              color="inherit"
              onClick={() => setShowConversations(!showConversations)}
            >
              <ChatIcon />
            </IconButton>
            <IconButton color="inherit" onClick={handleNewConversation}>
              <AddIcon />
            </IconButton>
            <IconButton color="inherit" onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Conversations List */}
        {showConversations ? (
          <Box sx={{ flex: 1, overflow: "auto" }}>
            {conversations.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  p: 3,
                  textAlign: "center",
                }}
              >
                <ChatIcon
                  sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Chưa có cuộc hội thoại nào
                </Typography>
              </Box>
            ) : (
              <List>
                {conversations.map((conv) => (
                  <React.Fragment key={conv.id}>
                    <ListItem
                      button
                      selected={currentConversationId === conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                    >
                      <ListItemText
                        primary={conv.title}
                        secondary={
                          <>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                            >
                              {conv.lastMessage}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                              {formatDistanceToNow(new Date(conv.updatedAt), {
                                addSuffix: true,
                                locale: vi,
                              })}
                            </Typography>
                          </>
                        }
                      />
                      <IconButton
                        edge="end"
                        onClick={(e) => handleDeleteConversation(conv.id, e)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        ) : (
          <>
            {/* Messages Area */}
            <Box
              sx={{
                flex: 1,
                overflow: "auto",
                p: 2,
                bgcolor: "grey.50",
              }}
            >
              {messages.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    textAlign: "center",
                    px: 3,
                  }}
                >
                  <BotIcon
                    sx={{ fontSize: 60, color: "primary.main", mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    Xin chào! 👋
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tôi là trợ lý AI của Roomie. Tôi có thể giúp bạn:
                  </Typography>
                  <Box sx={{ mt: 2, textAlign: "left" }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      • Tìm phòng trọ phù hợp
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      • Giải đáp thắc mắc về thuê nhà
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      • Tư vấn hợp đồng và thanh toán
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Hướng dẫn sử dụng nền tảng
                    </Typography>
                  </Box>
                </Box>
              ) : (
                messages.map((msg, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent:
                        msg.role === "user" ? "flex-end" : "flex-start",
                      mb: 2,
                    }}
                  >
                    {msg.role === "assistant" && (
                      <Avatar sx={{ bgcolor: "primary.main", mr: 1 }}>
                        <BotIcon />
                      </Avatar>
                    )}

                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        maxWidth: "75%",
                        bgcolor: msg.isError
                          ? "error.light"
                          : msg.role === "user"
                          ? "primary.main"
                          : "white",
                        color: msg.role === "user" ? "white" : "text.primary",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: "pre-wrap" }}
                      >
                        {msg.content}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          mt: 0.5,
                          opacity: 0.7,
                        }}
                      >
                        {formatDistanceToNow(new Date(msg.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </Typography>
                    </Paper>

                    {msg.role === "user" && (
                      <Avatar sx={{ bgcolor: "grey.600", ml: 1 }}>
                        <PersonIcon />
                      </Avatar>
                    )}
                  </Box>
                ))
              )}

              {loading && (
                <Box
                  sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}
                >
                  <Avatar sx={{ bgcolor: "primary.main", mr: 1 }}>
                    <BotIcon />
                  </Avatar>
                  <Paper elevation={1} sx={{ p: 1.5 }}>
                    <CircularProgress size={20} />
                  </Paper>
                </Box>
              )}

              <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box
              sx={{
                p: 2,
                bgcolor: "white",
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Nhập tin nhắn..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                />
                <IconButton
                  color="primary"
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                    "&:disabled": {
                      bgcolor: "grey.300",
                    },
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1, textAlign: "center" }}
              >
                Nhấn Enter để gửi, Shift+Enter để xuống dòng
              </Typography>
            </Box>
          </>
        )}
      </Drawer>
    </>
  );
};

export default ChatBox;
