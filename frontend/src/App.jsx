import React from "react";
import { CssBaseline } from "@mui/material";

import AppProviders from "./components/AppProviders";
import AppRoutes from "./routes/AppRoutes";
import NotificationToast from "./components/Notification/NotificationToast";
import ChatBox from "./components/ChatBox/ChatBox";
import ErrorBoundary from "./components/common/ErrorBoundary";

import "./i18n/i18n";

function App() {
  return React.createElement(
    ErrorBoundary,
    null,
    React.createElement(
      AppProviders,
      null,
      React.createElement(CssBaseline),
      React.createElement(NotificationToast),
      React.createElement(ChatBox),
      React.createElement(AppRoutes),
    ),
  );
}

export default App;
