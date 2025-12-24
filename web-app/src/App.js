// src/App.jsx
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SocketProvider } from "./contexts/SocketContext";
import { CallProvider } from "./contexts/CallContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import AppRoutes from "./routes/AppRoutes";
import NotificationToast from "./components/Notification/NotificationToast";
import ChatBox from "./components/ChatBox/ChatBox";
import './i18n/i18n';
import TokenDebug from './components/TokenDebug';

function App() {
  return (
    <>
      <ThemeProvider> 
        <SocketProvider>
          <CallProvider>
            <NotificationProvider>
              <CssBaseline />
              
              {/* Toast Notifications - Hiển thị ở mọi page */}
              <NotificationToast />
              
              <ChatBox />

              {/* Routes */}
              <AppRoutes />
              
              {/* <TokenDebug /> */}
            </NotificationProvider>
          </CallProvider>
        </SocketProvider>
      </ThemeProvider> 
    </>
  );
}

export default App;