// src/components/notifications/NotificationToast.jsx
import React, { useEffect, useState } from "react";
import {
  Snackbar,
  Alert,
  AlertTitle,
  Box,
  IconButton,
  LinearProgress,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useNotificationContext } from "../../contexts/NotificationContext";

const NotificationToast = () => {
  const { toastQueue, removeToast } = useNotificationContext();

  return (
    <Box sx={{ position: "fixed", top: 80, right: 16, zIndex: 9999 }}>
      {toastQueue.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          index={index}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </Box>
  );
};

const ToastItem = ({ toast, index, onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) return 0;
        return prev - 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const getSeverity = () => {
    switch (toast.priority) {
      case "URGENT":
        return "error";
      case "HIGH":
        return "warning";
      default:
        return "info";
    }
  };

  const handleClick = () => {
    if (toast.actionUrl) {
      window.location.href = toast.actionUrl;
    }
    onClose();
  };

  return (
    <Snackbar
      open={true}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{ position: "static", mb: 1 }}
    >
      <Alert
        severity={getSeverity()}
        onClick={handleClick}
        sx={{
          width: 350,
          cursor: toast.actionUrl ? "pointer" : "default",
          "&:hover": toast.actionUrl ? { boxShadow: 3 } : {},
        }}
        action={
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        }
      >
        <AlertTitle sx={{ fontWeight: 600 }}>{toast.title}</AlertTitle>
        <Typography variant="body2">
          {toast.shortMessage || toast.message}
        </Typography>
        <LinearProgress variant="determinate" value={progress} sx={{ mt: 1 }} />
      </Alert>
    </Snackbar>
  );
};

export default NotificationToast;
