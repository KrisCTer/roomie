// web-app/src/components/common/RoleProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useRole } from "../../contexts/RoleContext";

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { activeRole } = useRole();

  if (!allowedRoles.includes(activeRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
