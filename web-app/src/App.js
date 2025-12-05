import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppRoutes from "./routes/AppRoutes";
import './i18n/i18n';

function App() {
  return (
    <>
    <ThemeProvider> 
      <CssBaseline />
      <AppRoutes />
    </ThemeProvider> 
    </>
  );
}

export default App;