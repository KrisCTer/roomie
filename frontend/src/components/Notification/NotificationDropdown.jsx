/* aria-label */
// src/components/notifications/NotificationDropdown.jsx
import React from "react";
import {
  Menu,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  IconButton,
  Chip,
} from "@mui/material";
import {
  Bell,
  Trash2,
  MailCheck,
  CheckCircle,
  XCircle,
  FileText,
  PenLine,
  CreditCard,
  AlertTriangle,
  MessageCircle,
  Home,
} from "lucide-react";
import { useNotificationContext } from "../../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const NotificationDropdown = ({ anchorEl, open, onClose }) => {
  const navigate = useNavigate();
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationContext();

  /* ================= ICON MAP ================= */
  const getNotificationIcon = (type) => {
    const iconProps = { size: 18 };

    switch (type) {
      case "BOOKING_CONFIRMED":
        return <CheckCircle {...iconProps} />;
      case "BOOKING_CANCELLED":
        return <XCircle {...iconProps} />;
      case "CONTRACT_ACTIVATED":
        return <FileText {...iconProps} />;
      case "CONTRACT_SIGNED":
        return <PenLine {...iconProps} />;
      case "PAYMENT_COMPLETED":
        return <CreditCard {...iconProps} />;
      case "PAYMENT_FAILED":
        return <AlertTriangle {...iconProps} />;
      case "NEW_MESSAGE":
        return <MessageCircle {...iconProps} />;
      case "PROPERTY_APPROVED":
        return <Home {...iconProps} />;
      default:
        return <Bell {...iconProps} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "URGENT":
        return "error";
      case "HIGH":
        return "warning";
      case "NORMAL":
        return "info";
      default:
        return "default";
    }
  };

  /* ================= HANDLERS ================= */
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    onClose();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleViewAll = () => {
    navigate("/notifications");
    onClose();
  };

  /* ================= RENDER ================= */
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 420,
          maxHeight: 600,
          mt: 1,
          borderRadius: 4,
          border: "1px solid #EFE6DA",
          boxShadow: "0 24px 48px rgba(17,24,39,0.14)",
          background: "#FFFCF8",
          overflow: "hidden",
        },
      }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      {/* ===== HEADER ===== */}
      <Box
        sx={{
          px: 2,
          py: 1.8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #F0E7DB",
          background:
            "linear-gradient(110deg, rgba(255,249,242,1) 0%, rgba(255,252,248,1) 100%)",
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Thông báo
        </Typography>
        <Button
          size="small"
          startIcon={<MailCheck size={18} />}
          onClick={handleMarkAllRead}
          sx={{ textTransform: "none", color: "#B45309", fontWeight: 600 }}
        >
          Đánh dấu tất cả
        </Button>
      </Box>

      {/* ===== LIST ===== */}
      <Box sx={{ maxHeight: 400, overflow: "auto" }}>
        {loading ? (
          <Box sx={{ p: 2 }}>
            {[...Array(4)].map((_, idx) => (
              <Box
                key={`dropdown-skeleton-${idx}`}
                sx={{
                  border: "1px solid #F0E7DB",
                  borderRadius: 3,
                  bgcolor: "#FFFFFF",
                  p: 1.5,
                  mb: 1.25,
                }}
              >
                <Box
                  sx={{
                    height: 12,
                    width: "45%",
                    bgcolor: "#EFE6DA",
                    borderRadius: 1,
                    mb: 1,
                  }}
                />
                <Box
                  sx={{
                    height: 10,
                    width: "70%",
                    bgcolor: "#EFE6DA",
                    borderRadius: 1,
                  }}
                />
              </Box>
            ))}
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Bell size={56} className="text-gray-400 mb-2" />
            <Typography color="text.secondary">
              Không có thông báo mới
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.slice(0, 10).map((notification) => (
              <ListItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  cursor: "pointer",
                  bgcolor: notification.isRead ? "transparent" : "#FFF4E8",
                  "&:hover": {
                    bgcolor: "#FAF3E9",
                  },
                  borderBottom: "1px solid #F3ECE2",
                }}
              >
                {/* ICON */}
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: "#111827",
                      width: 36,
                      height: 36,
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemAvatar>

                {/* CONTENT */}
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: notification.isRead ? 400 : 600,
                          flex: 1,
                          pr: 1,
                        }}
                      >
                        {notification.title}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 0.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {notification.shortMessage || notification.message}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography variant="caption" color="text.disabled">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                              locale: vi,
                            },
                          )}
                        </Typography>

                        {notification.priority !== "NORMAL" && (
                          <Chip
                            label={notification.priority}
                            size="small"
                            color={getPriorityColor(notification.priority)}
                            sx={{
                              height: 20,
                              fontSize: "0.65rem",
                            }}
                          />
                        )}

                        {!notification.isRead && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "#EA580C",
                            }}
                          />
                        )}
                      </Box>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Divider />

      {/* ===== FOOTER ===== */}
      <Box sx={{ p: 1.2, borderTop: "1px solid #F0E7DB", bgcolor: "#FFFFFF" }}>
        <Button
          fullWidth
          onClick={handleViewAll}
          sx={{
            textTransform: "none",
            borderRadius: 999,
            minHeight: 40,
            bgcolor: "#111827",
            color: "#fff",
            fontWeight: 700,
            "&:hover": { bgcolor: "#030712" },
          }}
        >
          Xem tất cả thông báo
        </Button>
      </Box>
    </Menu>
  );
};

export default NotificationDropdown;
