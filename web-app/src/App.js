// src/App.jsx
import { CssBaseline } from "@mui/material";

import { ThemeProvider } from "./contexts/ThemeContext";
import { SocketProvider } from "./contexts/SocketContext";
import { CallProvider } from "./contexts/CallContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { RoleProvider } from "./contexts/RoleContext";
import { UserProvider } from "./contexts/UserContext";
import { RefreshProvider } from './contexts/RefreshContext';

import AppRoutes from "./routes/AppRoutes";
import NotificationToast from "./components/Notification/NotificationToast";
import ChatBox from "./components/ChatBox/ChatBox";

import "./i18n/i18n";
// import TokenDebug from "./components/TokenDebug";

function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <CallProvider>
          <NotificationProvider>
            <RoleProvider>
              <UserProvider>
                <RefreshProvider>
                <CssBaseline />

                {/* Toast thông báo toàn app */}
                <NotificationToast />

                {/* Chat realtime */}
                <ChatBox />

                {/* Routing */}
                <AppRoutes />

                {/* Debug token nếu cần */}
                {/* <TokenDebug /> */}
                  </RefreshProvider>
                </UserProvider>
            </RoleProvider>
          </NotificationProvider>
        </CallProvider>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
