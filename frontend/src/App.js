// src/App.jsx
import { CssBaseline } from "@mui/material";

import AppProviders from "./components/AppProviders";
import AppRoutes from "./routes/AppRoutes";
import NotificationToast from "./components/Notification/NotificationToast";
import ChatBox from "./components/ChatBox/ChatBox";
import ErrorBoundary from "./components/common/ErrorBoundary";

import "./i18n/i18n";

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <CssBaseline />
        <NotificationToast />
        <ChatBox />
        <AppRoutes />
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
