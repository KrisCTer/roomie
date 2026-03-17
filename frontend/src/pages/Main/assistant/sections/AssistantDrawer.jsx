import React from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Chat as ChatIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
} from "@mui/icons-material";

const AssistantDrawer = ({
  open,
  setOpen,
  conversations,
  currentConversationId,
  showConversations,
  setShowConversations,
  handleSelectConversation,
  handleDeleteConversation,
  handleNewConversation,
  formatMessageTime,
  messages,
  loading,
  quickPrompts,
  handleUseQuickPrompt,
  input,
  setInput,
  handleInputKeyPress,
  handleSend,
  messagesEndRef,
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => setOpen(false)}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 400 },
          maxWidth: "100vw",
          bgcolor: "#FFFCF8",
          borderLeft: "1px solid #F0E7DB",
        },
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "#111827",
          backgroundImage:
            "linear-gradient(120deg, #111827 0%, #1F2937 50%, #374151 100%)",
        }}
      >
        <Toolbar>
          <BotIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Tro ly Roomie
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
              <ChatIcon sx={{ fontSize: 60, color: "#C2B7A5", mb: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                Chua co cuoc hoi thoai nao
              </Typography>
              <Button
                variant="outlined"
                onClick={handleNewConversation}
                sx={{
                  borderColor: "#E5D5C1",
                  color: "#1F2937",
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 999,
                  mt: 1,
                }}
              >
                Bat dau hoi thoai moi
              </Button>
            </Box>
          ) : (
            <List>
              {conversations.map((conv) => (
                <ListItem
                  key={conv.id}
                  button
                  selected={currentConversationId === conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  sx={{
                    borderBottom: "1px solid #F3ECE2",
                    "&.Mui-selected": { bgcolor: "#FFF4E8" },
                  }}
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
                          {formatMessageTime(conv.updatedAt)}
                        </Typography>
                      </>
                    }
                  />
                  <IconButton
                    edge="end"
                    onClick={(event) =>
                      handleDeleteConversation(conv.id, event)
                    }
                    aria-label="Delete conversation"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      ) : (
        <>
          <Box sx={{ flex: 1, overflow: "auto", p: 2, bgcolor: "#FFFCF8" }}>
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
                <BotIcon sx={{ fontSize: 60, color: "#EA580C", mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Xin chao
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Tro ly AI co the giup ban tim phong, xem hop dong, va tu van
                  dat coc.
                </Typography>
                <Box
                  sx={{
                    mt: 1,
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  {quickPrompts.map((prompt) => (
                    <Button
                      key={prompt}
                      onClick={() => handleUseQuickPrompt(prompt)}
                      variant="outlined"
                      sx={{
                        justifyContent: "flex-start",
                        textAlign: "left",
                        textTransform: "none",
                        borderColor: "#E8D9C6",
                        color: "#374151",
                        bgcolor: "#FFFFFF",
                        borderRadius: 2.5,
                        px: 1.2,
                        py: 0.9,
                        fontWeight: 600,
                      }}
                    >
                      {prompt}
                    </Button>
                  ))}
                </Box>
              </Box>
            ) : (
              messages.map((msg, index) => (
                <Box
                  key={`${msg.createdAt}-${index}`}
                  sx={{
                    display: "flex",
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                    mb: 2,
                  }}
                >
                  {msg.role === "assistant" && (
                    <Avatar sx={{ bgcolor: "#EA580C", mr: 1 }}>
                      <BotIcon />
                    </Avatar>
                  )}

                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      maxWidth: "75%",
                      bgcolor: msg.isError
                        ? "#FFE4E6"
                        : msg.role === "user"
                          ? "#111827"
                          : "white",
                      color: msg.role === "user" ? "white" : "text.primary",
                      border:
                        msg.role === "assistant" ? "1px solid #EFE6DA" : "none",
                      borderRadius: 3,
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {msg.content}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ display: "block", mt: 0.5, opacity: 0.7 }}
                    >
                      {formatMessageTime(msg.createdAt)}
                    </Typography>
                  </Paper>

                  {msg.role === "user" && (
                    <Avatar sx={{ bgcolor: "#6B7280", ml: 1 }}>
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
                <Avatar sx={{ bgcolor: "#EA580C", mr: 1 }}>
                  <BotIcon />
                </Avatar>
                <Paper elevation={1} sx={{ p: 1.5 }}>
                  <CircularProgress size={20} />
                </Paper>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          <Box
            sx={{
              p: 2,
              bgcolor: "white",
              borderTop: "1px solid",
              borderColor: "#EFE6DA",
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Nhap tin nhan..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyPress={handleInputKeyPress}
                disabled={loading}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    bgcolor: "#FFFCF8",
                  },
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={!input.trim() || loading}
                sx={{
                  bgcolor: "#111827",
                  color: "white",
                  "&:hover": { bgcolor: "#030712" },
                  "&:disabled": { bgcolor: "grey.300" },
                }}
                aria-label="Send message"
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </>
      )}
    </Drawer>
  );
};

export default AssistantDrawer;
