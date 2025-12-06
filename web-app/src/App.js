import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SocketProvider } from "./contexts/SocketContext";
import AppRoutes from "./routes/AppRoutes";
import { CallProvider } from "./contexts/Callcontext";
import './i18n/i18n';

function App() {
  return (
    <>
    <ThemeProvider> 
      {/* <SocketProvider>
        <CallProvider> */}
      <CssBaseline />
      <AppRoutes />
      {/* </CallProvider>
      </SocketProvider> */}
    </ThemeProvider> 
    
    </>
  );
}

export default App;