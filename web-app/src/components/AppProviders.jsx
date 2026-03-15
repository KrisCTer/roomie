import { StyledEngineProvider } from "@mui/material/styles";
import { ThemeProvider } from "../contexts/ThemeContext";
import { SocketProvider } from "../contexts/SocketContext";
import { CallProvider } from "../contexts/CallContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import { RoleProvider } from "../contexts/RoleContext";
import { UserProvider } from "../contexts/UserContext";
import { RefreshProvider } from "../contexts/RefreshContext";

const AppProviders = ({ children }) => (
  <StyledEngineProvider injectFirst>
  <ThemeProvider>
    <SocketProvider>
      <CallProvider>
        <NotificationProvider>
          <RoleProvider>
            <UserProvider>
              <RefreshProvider>
                {children}
              </RefreshProvider>
            </UserProvider>
          </RoleProvider>
        </NotificationProvider>
      </CallProvider>
    </SocketProvider>
  </ThemeProvider>
  </StyledEngineProvider>
);

export default AppProviders;
