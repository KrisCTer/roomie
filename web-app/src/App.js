import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SocketProvider } from "./contexts/SocketContext";
import AppRoutes from "./routes/AppRoutes";
import { CallProvider } from "./contexts/CallContext";
import './i18n/i18n';
import TokenDebug from './components/TokenDebug';

function App() {
  return (
    <>
    <ThemeProvider> 
      <SocketProvider>
        <CallProvider>
      <CssBaseline />
      <AppRoutes />
      {/* <TokenDebug /> */}
      </CallProvider>
      </SocketProvider>
    </ThemeProvider> 
    
    </>
  );
}

export default App;