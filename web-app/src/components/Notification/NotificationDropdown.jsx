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
import { Delete, Notifications, MarkEmailRead } from "@mui/icons-material";
import { useNotificationContext } from "../../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const NotificationDropdown = ({ anchorEl, open, onClose }) => {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, deleteNotification } =
    useNotificationContext();

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

  const getNotificationIcon = (type) => {
    const iconMap = {
      BOOKING_CONFIRMED: "✅",
      BOOKING_CANCELLED: "❌",
      CONTRACT_ACTIVATED: "📝",
      CONTRACT_SIGNED: "✍️",
      PAYMENT_COMPLETED: "💰",
      PAYMENT_FAILED: "❗",
      NEW_MESSAGE: "💬",
      PROPERTY_APPROVED: "🏠",
    };
    return iconMap[type] || "🔔";
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      URGENT: "error",
      HIGH: "warning",
      NORMAL: "info",
      LOW: "default",
    };
    return colorMap[priority] || "default";
  };

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
      {/* Header */}
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
          startIcon={<MarkEmailRead />}
          onClick={handleMarkAllRead}
          sx={{ textTransform: "none" }}
        >
          Đánh dấu tất cả
        </Button>
      </Box>

      <Divider />

      {/* Notifications List */}
      <Box sx={{ maxHeight: 400, overflow: "auto" }}>
        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Notifications
              sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
            />
            <Typography color="text.secondary">
              Không có thông báo mới
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.slice(0, 10).map((notification) => (
              <ListItem
                key={notification.id}
                button
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  bgcolor: notification.isRead ? "transparent" : "action.hover",
                  "&:hover": {
                    bgcolor: "action.selected",
                  },
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemAvatar>

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
                        sx={{ ml: 1 }}
                      >
                        <Delete fontSize="small" />
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
                            sx={{ height: 20, fontSize: "0.65rem" }}
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

      {/* Footer */}
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
