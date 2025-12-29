// src/components/notifications/NotificationDropdown.jsx
import React from "react";
import {
  Menu,
  MenuItem,
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
  const { notifications, markAsRead, markAllAsRead, deleteNotification } =
    useNotificationContext();

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
          width: 400,
          maxHeight: 600,
          mt: 1,
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        },
      }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      {/* ===== HEADER ===== */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Thông báo
        </Typography>
        <Button
          size="small"
          startIcon={<MailCheck size={18} />}
          onClick={handleMarkAllRead}
          sx={{ textTransform: "none" }}
        >
          Đánh dấu tất cả
        </Button>
      </Box>

      <Divider />

      {/* ===== LIST ===== */}
      <Box sx={{ maxHeight: 400, overflow: "auto" }}>
        {notifications.length === 0 ? (
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
                  bgcolor: notification.isRead ? "transparent" : "action.hover",
                  "&:hover": {
                    bgcolor: "action.selected",
                  },
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                {/* ICON */}
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
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
                            }
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
                              bgcolor: "primary.main",
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
      <Box sx={{ p: 1 }}>
        <Button
          fullWidth
          onClick={handleViewAll}
          sx={{ textTransform: "none" }}
        >
          Xem tất cả thông báo
        </Button>
      </Box>
    </Menu>
  );
};

export default NotificationDropdown;
